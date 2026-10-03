"use server"

import { getSupabaseAdmin } from "@/lib/supabase"
import {
  generateGrantApplicationContent,
  GrantApplicationContent,
} from "@/lib/ai"

export async function generateGrantApplication(
  ideaId: string,
  callId: number
): Promise<GrantApplicationContent> {
  const [{ data: idea, error: ideaError }, { data: call, error: callError }] =
    await Promise.all([
      getSupabaseAdmin().from("ideas").select("*").eq("id", ideaId).single(),
      getSupabaseAdmin().from("calls").select("*").eq("id", callId).single(),
    ])

  if (ideaError || callError || !idea || !call) {
    throw new Error("Nie odnaleziono rekordu pomysłu lub naboru grantowego.")
  }

  const applicationContent = await generateGrantApplicationContent(
    {
      title: idea.title,
      essence: idea.essence,
      audience: idea.audience,
      canvas: idea.canvas,
    },
    {
      title: call.title,
      rules: call.rules,
    }
  )

  const supabaseAdmin = getSupabaseAdmin()
  const { error: insertError } = await supabaseAdmin
    .from("applications")
    .insert({
      idea_id: ideaId,
      call_id: callId,
      content: applicationContent,
    })

  if (insertError) {
    console.error("Błąd zapisu wniosku:", insertError)
    throw new Error("Nie udało się zapisać wygenerowanego wniosku.")
  }

  return applicationContent
}
