// Celowo bez "use server": te funkcje wołają tylko akcje serwera, nie mogą być publicznym endpointem.

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dombasiarzehackyeah2026.vercel.app").replace(/\/$/, "")

/** Pełny adres strony aplikacji — do linków w e-mailach i kodów QR. */
export const siteUrl = (path: string) => `${SITE_URL}${path}`

const FOOTER = "\n\n—\nMałopolski Hub Innowacji Społecznych · ROPS Kraków"

// Resend przez REST, bez dodatkowej paczki. Bez RESEND_API_KEY tylko logujemy — aplikacja działa dalej.
// ponytail: bez własnej domeny Resend dostarcza tylko na adres właściciela konta; do wdrożenia zweryfikować domenę ROPS.
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info(`E-mail pominięty (brak RESEND_API_KEY): „${subject}” → ${to}`)
    return false
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "Podaj Dalej <onboarding@resend.dev>",
        to: [to],
        subject,
        text: text + FOOTER,
      }),
    })
    if (!res.ok) console.error("Resend:", res.status, await res.text())
    return res.ok
  } catch (err) {
    console.error("Resend:", err)
    return false
  }
}

/** Powiadomienie dla zespołu ROPS (adres w ROPS_EMAIL) o nowej sprawie. */
export async function notifyRops(subject: string, text: string) {
  const to = process.env.ROPS_EMAIL
  if (!to) {
    console.info(`Powiadomienie ROPS pominięte (brak ROPS_EMAIL): „${subject}”`)
    return
  }
  await sendEmail(to, subject, `${text}\n\nPanel ROPS: ${siteUrl("/panel")}`)
}
