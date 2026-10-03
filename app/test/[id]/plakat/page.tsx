import type { Metadata } from "next"
import QRCode from "qrcode"

import { RatingForm } from "@/components/rating-form"

const innovation = {
  name: "Sąsiedzkie odwiedziny u seniorów",
  description:
    "Program łączy osoby starsze z przeszkolonymi sąsiadami, którzy regularnie odwiedzają ich w domu.",
}

type PosterPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Plakat testu | Podaj Dalej",
}

export default async function PosterPage({ params }: PosterPageProps) {
  const { id } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const testUrl = `${siteUrl.replace(/\/$/, "")}/test/${encodeURIComponent(id)}`
  const qrCode = await QRCode.toString(testUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    width: 420,
    color: {
      dark: "#17211c",
      light: "#ffffff",
    },
  })

  return (
    <main className="poster-page flex min-h-svh flex-col items-center justify-center bg-stone-50 px-4 py-8 text-stone-900 sm:px-6 sm:py-12 dark:bg-stone-950 dark:text-stone-50 print:min-h-0 print:bg-white print:p-0">
      <section className="flex min-h-[calc(100svh-4rem)] w-full max-w-3xl flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-10 dark:border-stone-800 dark:bg-stone-900 print:min-h-[277mm] print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="mb-8 max-w-2xl print:mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-800 print:mb-5 dark:text-emerald-300">
            Podaj Dalej · Nabór do testu
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl print:text-7xl">
            {innovation.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-600 print:mt-8 print:text-2xl dark:text-stone-300">
            {innovation.description}
          </p>
        </div>

        <p className="text-2xl font-medium text-stone-900 sm:text-3xl print:text-4xl dark:text-stone-50">
          Zeskanuj i dołącz do testu
        </p>
        <div
          className="mt-8 w-full max-w-[420px] rounded-2xl border border-stone-200 bg-white p-4 [&_svg] dark:border-stone-700:h-auto [&_svg]:w-full print:mt-12 print:border-0 print:p-0"
          aria-label={`Kod QR prowadzący do strony ${testUrl}`}
          dangerouslySetInnerHTML={{ __html: qrCode }}
        />
        <p className="mt-5 max-w-md text-base leading-7 text-stone-600 print:mt-8 print:text-lg dark:text-stone-300">
          Zeskanuj kod, aby dowiedzieć się więcej i zgłosić swój udział.
        </p>
      </section>

      <div className="mt-8 w-full max-w-3xl print:hidden">
        <RatingForm />
      </div>
    </main>
  )
}

