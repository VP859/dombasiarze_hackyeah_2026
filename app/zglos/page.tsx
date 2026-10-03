"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import type { OperationLocation } from "@/components/Map";

const Map = dynamic(
  () => import("@/components/Map"),
  {
    ssr: false,
  }
);

// Web Speech API: rozpoznawanie mowy wbudowane w przeglądarkę (Chrome, Edge, Safari).
// TypeScript nie ma typów samego SpeechRecognition, więc wystarczy minimalny opis.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition() {
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const RECOGNITION_ERRORS: Record<string, string> = {
  "not-allowed": "Brak dostępu do mikrofonu. Zezwól na mikrofon w przeglądarce.",
  "service-not-allowed": "Brak dostępu do mikrofonu. Zezwól na mikrofon w przeglądarce.",
  "no-speech": "Nie usłyszeliśmy mowy. Spróbuj jeszcze raz.",
  "audio-capture": "Nie znaleziono mikrofonu.",
  network: "Rozpoznawanie mowy wymaga połączenia z internetem.",
};

export default function Zglos() {
  const [isRecording, setIsRecording] = useState(false);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([]);
  const [frozenWaveformHeights, setFrozenWaveformHeights] = useState<number[] | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcriptionError, setTranscriptionError] = useState("");
  const [reportText, setReportText] = useState("");
  const [mapLocation, setMapLocation] = useState<OperationLocation | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSampleAtRef = useRef(0);
  const smoothedLevelRef = useRef(0);
  const waveformViewportRef = useRef<HTMLSpanElement | null>(null);

  const handleMapLocationChange = useCallback(
    (location: OperationLocation | null) => setMapLocation(location),
    []
  );

  const submitReport = () => {
    if (isRecording) {
      stopRecording();
    }

    console.log("Zgłoszenie:", {
      text: reportText.trim(),
      transcript: transcript.trim(),
      location: mapLocation,
    });
  };

  const startRecording = async () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setTranscriptionError(
        "Ta przeglądarka nie obsługuje dyktowania. Użyj Chrome, Edge lub Safari albo wpisz zgłoszenie."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      setWaveformLevels([]);
      setFrozenWaveformHeights(null);
      setHasRecording(false);
      setTranscript("");
      setTranscriptionError("");
      lastSampleAtRef.current = 0;
      smoothedLevelRef.current = 0;

      // Rozpoznawanie mowy na żywo, bez wysyłania nagrania na nasz serwer
      const recognition = new SpeechRecognition();
      recognition.lang = "pl-PL";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        setTranscript(
          Array.from(event.results, (result) => result[0].transcript)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()
        );
      };

      recognition.onerror = (event) => {
        if (event.error !== "aborted") {
          setTranscriptionError(
            RECOGNITION_ERRORS[event.error] ?? "Nie udało się rozpoznać mowy."
          );
        }
      };

      // Przeglądarka sama kończy po dłuższej ciszy — wtedy zatrzymujemy też falę
      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          stopRecording();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Analiza mikrofonu
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      analyser.fftSize = 512;

      const source =
        audioContext.createMediaStreamSource(stream);

      source.connect(analyser);

      const data = new Uint8Array(analyser.fftSize);

      const updateVolume = () => {
        if (!analyserRef.current) return;

        analyser.getByteTimeDomainData(data);

        let sumOfSquares = 0;
        for (const sample of data) {
          const centeredSample = (sample - 128) / 128;
          sumOfSquares += centeredSample * centeredSample;
        }

        const rms = Math.sqrt(sumOfSquares / data.length);
        const noiseFloor = 0.008;
        const speechPeak = 0.09;
        const measuredLevel = Math.max(
          0,
          Math.min(1, (rms - noiseFloor) / (speechPeak - noiseFloor))
        );
        smoothedLevelRef.current +=
          (measuredLevel - smoothedLevelRef.current) * 0.3;
        const normalized = smoothedLevelRef.current;

        const now = performance.now();
        if (now - lastSampleAtRef.current >= 100) {
          lastSampleAtRef.current = now;
          setWaveformLevels((levels) => [...levels, normalized]);
        }

        animationFrameRef.current =
          requestAnimationFrame(updateVolume);
      };

      updateVolume();

      setIsRecording(true);
    } catch (error) {
      console.error(
        "Nie udało się uruchomić mikrofonu:",
        error
      );
      setTranscriptionError("Nie udało się uruchomić mikrofonu.");
    }
  };

  const stopRecording = () => {
    const waveformBars = waveformViewportRef.current?.querySelectorAll<HTMLElement>(
      ".recording-wave-bar"
    );

    if (waveformBars) {
      setFrozenWaveformHeights(
        Array.from(waveformBars, (bar) => bar.getBoundingClientRect().height)
      );
    }

    // Najpierw zerujemy ref, żeby onend nie wywołał stopRecording drugi raz
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.stop();

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    audioContextRef.current?.close();

    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;

    setHasRecording(true);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition?.stop();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const viewport = waveformViewportRef.current;
    if (isRecording && viewport) {
      viewport.scrollLeft = viewport.scrollWidth;
    }
  }, [isRecording, waveformLevels]);

  return (
    <main>
      <h1 className="mb-4 text-6xl font-bold">
        Witaj!
        <span className="text-6xl text-emerald-800">
          {" "}
          Na czym polega twój problem?
        </span>
      </h1>

      <div className="flex w-full max-w-5xl flex-wrap items-center gap-2">
        {/* INPUT */}
        <div className="relative flex h-14 min-w-0 flex-1 items-center overflow-hidden rounded-md border border-border bg-background">
          <input
            type="text"
            placeholder={isRecording || hasRecording ? "" : "Wpisz swoje zgłoszenie"}
            disabled={isRecording || hasRecording}
            value={reportText}
            onChange={(event) => setReportText(event.target.value)}
            className="relative z-10 h-full w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-default disabled:text-transparent"
          />

          {/* MESSENGER STYLE WAVEFORM */}
          {(isRecording || hasRecording) && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center gap-3 px-3"
              role="status"
              aria-live="polite"
            >
              <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
                <span className="size-3 bg-current" />
                {isRecording ? "Nagrywanie" : "Gotowe do wysłania"}
              </span>
              <span
                ref={waveformViewportRef}
                className="flex h-full min-w-0 flex-1 items-center gap-[2px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-hidden="true"
              >
                <span className="flex min-w-max items-center gap-[1px]">
                  {waveformLevels.map((level, index) => {
                    const height = 5 + level * 30;

                    return (
                      <span
                        key={index}
                        className="recording-wave-bar w-[3px] shrink-0 rounded-full bg-foreground"
                        style={{
                          height: `${frozenWaveformHeights?.[index] ?? height}px`,
                          opacity: 0.8 - level * 0.5,
                          animationName: isRecording ? "recordingWave" : "none",
                          animationDuration: "650ms",
                          animationTimingFunction: "ease-in-out",
                          animationIterationCount: isRecording ? 1 : 0,
                          animationFillMode: "both",
                          animationDelay: isRecording
                            ? `${(index % 6) * 35}ms`
                            : "0ms",
                          transition: isRecording
                            ? "height 100ms ease, opacity 100ms ease"
                            : "none",
                        }}
                      />
                    );
                })}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* TWÓJ WCZEŚNIEJSZY PRZYCISK - BEZ ZMIAN */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            isRecording
              ? "Zatrzymaj nagrywanie"
              : "Rozpocznij nagrywanie"
          }
          aria-pressed={isRecording}
          title="Czat głosowy"
          onClick={toggleRecording}
          className={`voice-chat-icon relative h-[3.5rem] w-[3.5rem] rounded-md border-2 border-black bg-white text-black hover:bg-neutral-100 dark:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 ${
            isRecording ? "is-recording" : ""
          }`}
        >
          <MessageCircle
            aria-hidden="true"
            className="absolute size-9 stroke-[1.5]"
          />

          <span
            aria-hidden="true"
            className="relative z-10 flex h-5 items-center gap-1"
          >
            <span className="voice-chat-wave h-1 w-1 rounded-full bg-current" />
            <span className="voice-chat-wave h-3 w-1 rounded-full bg-current" />
            <span className="voice-chat-wave h-2 w-1 rounded-full bg-current" />
            <span className="voice-chat-wave h-2.5 w-1 rounded-full bg-current" />
            <span className="voice-chat-wave h-1 w-1 rounded-full bg-current" />
          </span>
        </Button>
      </div>

      {(isRecording || hasRecording || transcriptionError) && (
        <section
          className="mt-3 w-full max-w-5xl rounded-md border border-border bg-muted p-3"
          role="status"
          aria-live="polite"
        >
          <h2 className="text-sm font-semibold text-foreground">Transkrypcja nagrania</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {transcriptionError ||
              transcript ||
              (isRecording ? "Słucham… zacznij mówić." : "Nie rozpoznano mowy w nagraniu.")}
          </p>
        </section>
      )}

       <section className="flex flex-col mt-6 w-full max-w-5xl">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Wskaż lokalizację problemu na mapie
        </h2>
        <Map onLocationChange={handleMapLocationChange} />
        <div className="mt-2 mb-4 flex w-full justify-end">
          <Button
            onClick={submitReport}
            variant="secondary"
            className="rounded-md bg-green-700 px-6 py-3 text-white hover:bg-green-800 mt-6"
          >
            Wyślij zgłoszenie
          </Button>
        </div>
      </section>

      <style jsx>{`
        @keyframes recordingWave {
          0%,
          100% {
            transform: scaleY(1);
          }

          50% {
            transform: scaleY(1.25);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .recording-wave-bar {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}