"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

import { DictationButton } from "@/components/dictation-button"

// Łączy własny ref komponentu z ref-em podanym z zewnątrz.
function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.RefObject<T | null>).current = node
    }
  }
}

// Dyktowanie ma sens tylko w polach na zwykły tekst (nie e-mail, liczby, hasła).
const DICTATION_TYPES = new Set([undefined, "text", "search"])

function Input({ className, type, ref, ...props }: React.ComponentProps<"input">) {
  const innerRef = React.useRef<HTMLInputElement>(null)
  const dictation = DICTATION_TYPES.has(type) && !props.disabled && !props.readOnly

  const input = (
    <InputPrimitive
      type={type}
      ref={mergeRefs(innerRef, ref)}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-4 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-base dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        dictation && "pr-12",
        className
      )}
      {...props}
    />
  )

  if (!dictation) return input

  // Mikrofon po prawej stronie pola — dyktowanie głosem (components/dictation-button.tsx).
  return (
    <div data-slot="input-wrapper" className="relative w-full min-w-0">
      {input}
      <DictationButton target={innerRef} />
    </div>
  )
}

export { Input, mergeRefs }
