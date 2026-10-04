"use client"

import * as React from "react"
import { cn } from "cn"

import { DictationButton } from "@/components/dictation-button"
import { mergeRefs } from "@/components/ui/input"

function Textarea({ className, ref, ...props }: React.ComponentProps<"textarea">) {
  const innerRef = React.useRef<HTMLTextAreaElement>(null)
  const dictation = !props.disabled && !props.readOnly

  const textarea = (
    <textarea
      ref={mergeRefs(innerRef, ref)}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full resize-none rounded-2xl border border-field bg-input/50 px-4 py-3 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-base dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        dictation && "pr-14",
        className
      )}
      {...props}
    />
  )

  if (!dictation) return textarea

  // Mikrofon w prawym górnym rogu — dyktowanie głosem (components/dictation-button.tsx).
  return (
    <div data-slot="textarea-wrapper" className="relative w-full min-w-0">
      {textarea}
      <DictationButton target={innerRef} position="top" />
    </div>
  )
}

export { Textarea }
