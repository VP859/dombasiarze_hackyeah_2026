import type { Metadata } from "next"
import { cookies } from "next/headers"

import { ROLE_COOKIE, toRole } from "@/lib/role"
import type { ReportRole } from "@/seed"

import { ReportForm } from "./report-form"

export const metadata: Metadata = { title: "Zgłoś problem" }

// Rola z przełącznika w nagłówku → zaznaczona odpowiedź „Kim jesteś?”.
const REPORT_ROLE: Partial<Record<string, ReportRole>> = { ngo: "ngo", jst: "official" }

export default async function Page() {
  const role = toRole((await cookies()).get(ROLE_COOKIE)?.value)
  return <ReportForm defaultRole={REPORT_ROLE[role] ?? "resident"} />
}
