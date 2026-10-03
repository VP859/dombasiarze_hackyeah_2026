"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react"
import { MicIcon, SquareIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Web Speech API: rozpoznawanie mowy wbudowane w przeglądarkę (Chrome, Edge, Safari). Bez wysyłania nagrań na nasz serwer.
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}
type RecognitionConstructor = new () => Recognition

function getRecognition() {
  const w = window as typeof window & {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

const subscribe = () => () => {}

const ERRORS: Record<string, string> = {
  "not-allowed": "Brak dostępu do mikrofonu. Zezwól na mikrofon w przeglądarce.",
  "service-not-allowed": "Brak dostępu do mikrofonu. Zezwól na mikrofon w przeglądarce.",
  "no-speech": "Nie usłyszeliśmy mowy. Spróbuj jeszcze raz.",
  "audio-capture": "Nie znaleziono mikrofonu.",
  network: "Rozpoznawanie mowy wymaga połączenia z internetem.",
}

// Ustawia wartość tak, jakby wpisał ją użytkownik — działa z polami kontrolowanymi (onChange) i niekontrolowanymi.
function setFieldValue(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(field, value)
  field.dispatchEvent(new Event("input", { bubbles: true }))
}

export function DictationButton({
  target,
  position = "center",
}: {
  target: RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  position?: "center" | "top"
}) {
  // Na serwerze i przy hydracji false, w przeglądarce sprawdzamy wsparcie — bez rozjazdu HTML.
  const supported = useSyncExternalStore(subscribe, () => !!getRecognition(), () => false)
  const recognitionRef = useRef<Recognition | null>(null)
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => () => recognitionRef.current?.stop(), [])

  if (!supported) return null

  function start() {
    const field = target.current
    const SpeechRecognition = getRecognition()
    if (!field || !SpeechRecognition) return

    // Dopisujemy do tego, co już jest w polu.
    const before = field.value.trim() ? `${field.value.trimEnd()} ` : ""
    let failed = false
    const recognition = new SpeechRecognition()
    recognition.lang = "pl-PL"
    recognition.interimResults = true
    recognition.continuous = field instanceof HTMLTextAreaElement

    recognition.onresult = (event) => {
      const text = Array.from(event.results, (result) => result[0].transcript)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
      setFieldValue(field, before + text)
    }
    recognition.onerror = (event) => {
      if (event.error === "aborted") return
      failed = true
      setStatus(ERRORS[event.error] ?? "Nie udało się rozpoznać mowy.")
    }
    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
      if (!failed) setStatus("Zakończono dyktowanie.")
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
    setStatus("Słucham… mów teraz.")
  }

  return (
    <>
      <Button
        type="button"
        variant={listening ? "default" : "ghost"}
        size="icon"
        aria-label="Dyktuj głosem"
        aria-pressed={listening}
        title={listening ? "Zatrzymaj dyktowanie" : "Dyktuj głosem"}
        onClick={listening ? () => recognitionRef.current?.stop() : start}
        className={cn("absolute right-0", position === "center" ? "inset-y-0 my-auto" : "top-0")}
      >
        {listening ? <SquareIcon aria-hidden /> : <MicIcon aria-hidden />}
      </Button>
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
    </>
  )
}
