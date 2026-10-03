"use client";


import { type FormEvent, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2Icon } from "lucide-react";

import type { OperationLocation } from "@/components/Map";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getChallenges, REPORT_AUDIENCES, REPORT_ROLES } from "@/seed";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

// Pola nazwane jak w processNeedAction (description, gmina, author_role, author_email),
// żeby podpięcie zapisu do bazy było jedną zmianą.
const FORM_ID = "report-form";

const CHIP =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-2 has-checked:border-primary has-checked:bg-muted";

// Mniejsze kafelki do zaznaczania wielu opcji — wysokość zostaje 44 px (cel dotyku).
const TAG =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-base has-checked:border-primary has-checked:bg-muted";

export default function Zglos() {
  const [reportText, setReportText] = useState("");

  const [mapLocation, setMapLocation] = useState<OperationLocation | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleMapLocationChange = useCallback(
    (location: OperationLocation | null) => setMapLocation(location),
    []
  );
  // ponytail: na razie tylko log — zapis do bazy z analizą AI to processNeedAction (app/actions/matchmaking.ts).
  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log("Zgłoszenie:", {
      description: reportText.trim(),
      challenges: data.getAll("challenge"),
      audiences: data.getAll("audience"),
      gmina: mapLocation?.municipality ?? "",
      author_role: data.get("author_role"),
      author_email: data.get("author_email"),
      location: mapLocation,
    });
    setSubmitted(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Zgłoś problem</p>
        <h1 className="text-3xl font-bold text-balance md:text-4xl">Na czym polega Twój problem?</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Opisz go własnymi słowami albo nagraj głosem. Pokażemy innowacje, które rozwiązały podobny
          problem w innych gminach.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">1. Problem</h2>

        <Field>
          <FieldLabel htmlFor="report-text">Opisz problem</FieldLabel>
          <Input
            id="report-text"
            name="description"
            form={FORM_ID}
            required
            value={reportText}
            onChange={(event) => setReportText(event.target.value)}
            placeholder="Np. seniorzy z sołectw nie mają jak dojechać do lekarza"
          />
          <FieldDescription>Możesz też kliknąć mikrofon w polu i powiedzieć, na czym polega problem.</FieldDescription>
        </Field>

        <FieldSet>
          <FieldLegend>Czego dotyczy problem? (opcjonalnie)</FieldLegend>
          <FieldDescription>
            Zaznacz wszystko, co pasuje. Nie musisz, ale to pomaga pracownikom ROPS szybciej ocenić
            zgłoszenie i dobrać rozwiązanie.
          </FieldDescription>
          <div className="flex flex-wrap gap-2">
            {getChallenges().map((challenge) => (
              <label key={challenge.id} className={TAG}>
                <input
                  type="checkbox"
                  name="challenge"
                  value={challenge.id}
                  form={FORM_ID}
                  className="size-4 shrink-0 accent-primary"
                />
                {challenge.name}
              </label>
            ))}
          </div>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Kogo dotyczy? (opcjonalnie)</FieldLegend>
          <FieldDescription>
            Dzięki temu pracownicy ROPS wiedzą, komu pomóc, i łatwiej znajdą innowację dla tej grupy.
          </FieldDescription>
          <div className="flex flex-wrap gap-2">
            {REPORT_AUDIENCES.map((audience) => (
              <label key={audience} className={TAG}>
                <input
                  type="checkbox"
                  name="audience"
                  value={audience}
                  form={FORM_ID}
                  className="size-4 shrink-0 accent-primary"
                />
                {audience}
              </label>
            ))}
          </div>
        </FieldSet>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">2. Gdzie występuje problem?</h2>
          <p className="text-sm text-muted-foreground">
            Kliknij na mapie miejsce, którego dotyczy zgłoszenie, i ustaw obszar.
          </p>
        </div>
        <Map onLocationChange={handleMapLocationChange} />
        <input
          type="hidden"
          name="gmina"
          form={FORM_ID}
          value={mapLocation?.municipality ?? ""}
        />
      </section>

      <form id={FORM_ID} onSubmit={submitReport} className="flex flex-col gap-6">
        <h2 className="text-xl font-bold">3. O Tobie</h2>

        <FieldSet>
          <FieldLegend>Kim jesteś?</FieldLegend>
          <div className="grid gap-3 sm:grid-cols-3">
            {REPORT_ROLES.map((role, index) => (
              <label key={role.value} className={`${CHIP} items-start py-4`}>
                <input
                  type="radio"
                  name="author_role"
                  value={role.value}
                  required
                  defaultChecked={index === 0}
                  className="mt-1 size-5 shrink-0 accent-primary"
                />
                <span className="flex flex-col gap-1">
                  <span className="font-medium">{role.label}</span>
                  <span className="text-muted-foreground">{role.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </FieldSet>

        <Field className="max-w-md">
          <FieldLabel htmlFor="author_email">E-mail do kontaktu</FieldLabel>
          <Input
            id="author_email"
            name="author_email"
            type="email"
            required
            autoComplete="email"
            placeholder="np. jan@example.com"
          />
          <FieldDescription>Wyślemy na niego dopasowane rozwiązania. Nie pokazujemy go publicznie.</FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <input
            id="contact-consent"
            name="consent"
            type="checkbox"
            required
            className="size-5 shrink-0 accent-primary"
          />
          <FieldLabel htmlFor="contact-consent" className="font-normal">
            Wyślijcie mi dopasowane rozwiązania i odpowiedź ROPS na ten adres.
          </FieldLabel>
        </Field>

        <div className="flex flex-col gap-4 border-t pt-6">
          <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start">
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