"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(
  () => import("@/components/Map"),
  {
    ssr: false,
  }
);

export default function Zglos() {
  const [isRecording, setIsRecording] = useState(false);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([]);
  const [frozenWaveformHeights, setFrozenWaveformHeights] = useState<number[] | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lastSampleAtRef = useRef(0);
  const smoothedLevelRef = useRef(0);
  const waveformViewportRef = useRef<HTMLSpanElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      setWaveformLevels([]);
      setFrozenWaveformHeights(null);
      setRecordedAudio(null);
      setTranscript("");
      setTranscriptionError("");
      setIsTranscribing(false);
      lastSampleAtRef.current = 0;
      smoothedLevelRef.current = 0;

      // Nagrywanie
      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType,
        });

        setRecordedAudio(audioBlob);
        setIsTranscribing(true);

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const responseText = await response.text();
          let result: {
            transcript?: string;
            error?: string;
          };

          try {
            if (!responseText.trim()) {
              throw new Error("Pusta odpowiedź serwera.");
            }
            result = JSON.parse(responseText) as typeof result;
          } catch {
            throw new Error(
              `Serwer transkrypcji zwrócił nieprawidłową odpowiedź (HTTP ${response.status}).`
            );
          }

          if (!response.ok) {
            throw new Error(result.error || "Transkrypcja nie powiodła się.");
          }

          setTranscript(result.transcript || "Nie rozpoznano mowy w nagraniu.");
        } catch (error) {
          setTranscriptionError(
            error instanceof Error
              ? error.message
              : "Nie udało się przygotować transkrypcji nagrania."
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();

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

    mediaRecorderRef.current?.stop();

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    audioContextRef.current?.close();

    mediaRecorderRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;

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
            placeholder={isRecording || recordedAudio ? "" : "Wpisz swoje zgłoszenie"}
            disabled={isRecording || Boolean(recordedAudio)}
            className="relative z-10 h-full w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-default disabled:text-transparent"
          />

          {/* MESSENGER STYLE WAVEFORM */}
          {(isRecording || recordedAudio) && (
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
          onClick={() =>
            setIsRecording((recording) => {
              if (recording) {
                stopRecording();
                return false;
              }

              startRecording();
              return true;
            })
          }
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

      {(recordedAudio || isTranscribing || transcript || transcriptionError) && (
        <section
          className="mt-3 w-full max-w-5xl rounded-md border border-border bg-muted p-3"
          role="status"
          aria-live="polite"
        >
          <h2 className="text-sm font-semibold text-foreground">Transkrypcja nagrania</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {isTranscribing
              ? "Przygotowuję transkrypcję…"
              : transcriptionError || transcript || "Nie rozpoznano mowy w nagraniu."}
          </p>
        </section>
      )}

      <Button
        onClick={() => stopRecording()}
        variant="secondary"
        className="mt-2 mb-4 rounded-md bg-green-700 px-6 py-3 text-white hover:bg-green-800"
      >
        Wyślij zgłoszenie
      </Button>

       <section className="mt-6 w-full max-w-5xl">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Wskaż lokalizację problemu na mapie
        </h2>
        <Map />
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