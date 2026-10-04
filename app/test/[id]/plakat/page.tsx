import type { Metadata } from "next"
import { notFound } from "next/navigation"
import QRCode from "qrcode"

import { Card } from "@/components/ui/card"
import { getSolutionById } from "@/app/actions/solutions"
import { siteUrl } from "@/lib/email"

export const metadata: Metadata = {
  title: "Plakat testu",
}

export default async function PosterPage({ params }: PageProps<"/test/[id]/plakat">) {
  const { id } = await params
  const solution = await getSolutionById(id)
  if (!solution) notFound()

  const testUrl = siteUrl(`/test/${encodeURIComponent(id)}`)
  const qrCode = await QRCode.toString(testUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    width: 420,
    color: { dark: "#17211c", light: "#ffffff" },
  })

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 print:max-w-none">
      <Card className="items-center p-6 text-center sm:p-10 print:min-h-[277mm] print:justify-center print:rounded-none print:ring-0">
        <div className="flex max-w-2xl flex-col gap-4 print:gap-8">
          <p className="text-sm font-semibold tracking-wider text-primary uppercase print:text-xl">
            Podaj Dalej · Nabór do testu
          </p>
          <h1 className="text-4xl font-bold text-balance md:text-5xl print:text-7xl">{solution.title}</h1>
          <p className="text-xl text-muted-foreground print:text-2xl">{solution.method}</p>
        </div>

        <p className="text-2xl font-semibold sm:text-3xl print:text-4xl">Zeskanuj i dołącz do testu</p>
        {/* Biały kod QR także w trybie ciemnym — inaczej telefony go nie odczytają. */}
        <div
          role="img"
          aria-label={`Kod QR prowadzący do strony ${testUrl}`}
          className="w-full max-w-[420px] rounded-2xl bg-white p-4 [&_svg]:h-auto [&_svg]:w-full print:p-0"
          dangerouslySetInnerHTML={{ __html: qrCode }}
        />
        <p className="max-w-md text-muted-foreground print:text-lg">
          Zeskanuj kod, aby dowiedzieć się więcej i zgłosić swój udział.
        </p>
      </Card>
    </div>
  )
}
