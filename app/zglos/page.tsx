"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { CheckCircle2Icon } from "lucide-react";

import type { OperationLocation } from "@/components/Map";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

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

const REPORT_TYPES = [
  { value: "road", label: "Droga / nawierzchnia" },
  { value: "lighting", label: "Oświetlenie" },
  { value: "waste", label: "Śmieci" },
  { value: "greenery", label: "Zieleń" },
  { value: "infrastructure", label: "Infrastruktura" },
  { value: "water", label: "Woda / kanalizacja" },
  { value: "parking", label: "Parkowanie" },
  { value: "other", label: "Inne" },
]

const PRIORITIES = [
  { value: "low", label: "Niska" },
  { value: "normal", label: "Normalna" },
  { value: "high", label: "Wysoka" },
  { value: "emergency", label: "Awaria / zagrożenie" },
]

const TODAY_LOCAL = (() => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
})()

export default function Zglos() {
  const [reportText, setReportText] = useState("");
  const [gmina, setGmina] = useState("");
  const [mapLocation, setMapLocation] = useState<OperationLocation | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState("");

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

  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!mapLocation) {
      setSubmitError("Wybierz lokalizację na mapie przed wysłaniem zgłoszenia.");
      return;
    }

    if (isRecording) {
      stopRecording();
    }

    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description") ?? "").trim();
    const photos = formData
      .getAll("photos")
      .filter((photo): photo is File => photo instanceof File && photo.size > 0);

    console.log("Zgłoszenie:", {
      type: formData.get("type"),
      description: description || transcript.trim(),
      location: {
        city: mapLocation.city,
        municipality: mapLocation.municipality,
        street: mapLocation.street || String(formData.get("street") ?? "").trim(),
        buildingOrLandmark:
          mapLocation.building || String(formData.get("building") ?? "").trim(),
        latitude: mapLocation.lat,
        longitude: mapLocation.lng,
        radiusMeters: mapLocation.radiusMeters,
      },
      photos: photos.map(({ name, type, size }) => ({ name, type, size })),
      priority: formData.get("priority"),
      noticedDate: formData.get("noticedDate"),
      additionalInfo: String(formData.get("additionalInfo") ?? "").trim(),
      contact: String(formData.get("contact") ?? "").trim() || null,
    });
    setSubmitError("");
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
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Zgłoś problem</p>
        <h1 className="text-4xl font-bold text-balance md:text-5xl">Na czym polega Twój problem?</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Opisz go własnymi słowami albo nagraj głosem. Pokażemy innowacje, które rozwiązały podobny
          problem w innych gminach.
        </p>
      </div>

      <form id="report-form" onSubmit={submitReport} className="flex w-full max-w-5xl flex-col gap-5">
        <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="report-type">Typ zgłoszenia</FieldLabel>
            <Select
              id="report-type"
              name="type"
              form="report-form"
              items={REPORT_TYPES}
              defaultValue="road"
            >
              <SelectTrigger id="report-type" className="w-full rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {REPORT_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="report-priority">Priorytet / pilność</FieldLabel>
            <Select
              id="report-priority"
              name="priority"
              form="report-form"
              items={PRIORITIES}
              defaultValue="normal"
            >
              <SelectTrigger id="report-priority" className="w-full rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PRIORITIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <Field>
          <FieldLabel htmlFor="report-description">Opis problemu</FieldLabel>
          <Textarea
            id="report-description"
            name="description"
            placeholder="Opisz problem, np. dużą dziurę w jezdni przy przejściu dla pieszych…"
            value={reportText}
            onChange={(event) => setReportText(event.target.value)}
            className="min-h-28 rounded-lg"
            required={!transcript.trim()}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isRecording ? "Zatrzymaj nagrywanie" : "Rozpocznij nagrywanie"}
            aria-pressed={isRecording}
            title="Czat głosowy"
            onClick={toggleRecording}
            className={`voice-chat-icon relative h-[3.5rem] w-[3.5rem] rounded-md border-2 border-black bg-white text-black hover:bg-neutral-100 dark:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 ${isRecording ? "is-recording" : ""}`}
          >
            <MessageCircle aria-hidden="true" className="absolute size-9 stroke-[1.5]" />
            <span aria-hidden="true" className="relative z-10 flex h-5 items-center gap-1">
              <span className="voice-chat-wave h-1 w-1 rounded-full bg-current" />
              <span className="voice-chat-wave h-3 w-1 rounded-full bg-current" />
              <span className="voice-chat-wave h-2 w-1 rounded-full bg-current" />
              <span className="voice-chat-wave h-2.5 w-1 rounded-full bg-current" />
              <span className="voice-chat-wave h-1 w-1 rounded-full bg-current" />
            </span>
          </Button>
          <span className="text-sm text-muted-foreground">
            {isRecording ? "Nagrywanie wypowiedzi…" : "Możesz podyktować opis"}
          </span>
        </div>

        {(isRecording || hasRecording) && (
          <div className="flex h-12 items-center gap-3 rounded-md border border-border bg-muted px-3" role="status" aria-live="polite">
            <span className="shrink-0 text-xs font-medium text-red-600 dark:text-red-400">
              {isRecording ? "Nagrywanie" : "Gotowe do wysłania"}
            </span>
            <span
              ref={waveformViewportRef}
              className="flex h-full min-w-0 flex-1 items-center gap-[2px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-hidden="true"
            >
              <span className="flex min-w-max items-center gap-[1px]">
                {waveformLevels.map((level, index) => {
                  const height = 5 + level * 30
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
                        animationDelay: isRecording ? `${(index % 6) * 35}ms` : "0ms",
                        transition: isRecording ? "height 100ms ease, opacity 100ms ease" : "none",
                      }}
                    />
                  )
                })}
              </span>
            </span>
          </div>
        )}

        {(isRecording || hasRecording || transcriptionError) && (
          <section className="rounded-md border border-border bg-muted p-3" role="status" aria-live="polite">
            <h2 className="text-sm font-semibold text-foreground">Transkrypcja nagrania</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
              {transcriptionError || transcript || (isRecording ? "Słucham… zacznij mówić." : "Nie rozpoznano mowy w nagraniu.")}
            </p>
          </section>
        )}

        <Field>
          <FieldLabel htmlFor="report-photos">Zdjęcia</FieldLabel>
          <Input
            id="report-photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setSelectedPhotos(Array.from(event.target.files ?? []))}
            className="h-auto min-h-11 rounded-lg py-2"
          />
          {selectedPhotos.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Wybrano {selectedPhotos.length} {selectedPhotos.length === 1 ? "zdjęcie" : "zdjęć"}
            </p>
          )}
        </Field>

        <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="noticed-date">Data zauważenia</FieldLabel>
            <Input
              id="noticed-date"
              name="noticedDate"
              type="date"
              defaultValue={TODAY_LOCAL}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="report-contact">Kontakt (opcjonalnie)</FieldLabel>
            <Input
              id="report-contact"
              name="contact"
              type="text"
              autoComplete="email"
              placeholder="E-mail lub numer telefonu"
            />
          </Field>
        </FieldGroup>

        <Field>
          <FieldLabel htmlFor="additional-info">Dodatkowe informacje (opcjonalnie)</FieldLabel>
          <Textarea
            id="additional-info"
            name="additionalInfo"
            placeholder="Inne informacje, które mogą pomóc w rozwiązaniu problemu"
            className="min-h-20 rounded-lg"
          />
        </Field>
      </form>

       <section className="flex flex-col mt-6 w-full max-w-5xl">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Wskaż lokalizację problemu na mapie
        </h2>
        <Map onLocationChange={handleMapLocationChange} />
        {submitError && (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        )}
        <div className="mt-2 mb-4 flex w-full justify-end">
          <Button
            type="submit"
            form="report-form"
            variant="secondary"
            className="rounded-md bg-green-700 px-6 py-3 text-white hover:bg-green-800 mt-6"
          >
            Wyślij zgłoszenie
          </Button>
          {submitted && (
            <Alert role="status">
              <CheckCircle2Icon aria-hidden />
              <AlertTitle>Zgłoszenie jest kompletne</AlertTitle>
              <AlertDescription>
                Wersja demonstracyjna: dane są gotowe do wysłania, ale jeszcze nie zapisujemy ich w bazie.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </form>
    </div>
  );
}
