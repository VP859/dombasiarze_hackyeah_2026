"use client";
import { Button } from "@/components/ui/button"


export default function Zglos() {
  return (
    <main className="ml-[20rem] mt-[5rem] ml-[20rem]">
        <h1 className="text-6xl font-bold mb-4">Witaj!<span className="text-emerald-800 text-6xl"> Na czym polega twój problem?</span></h1>
        <input type="text" placeholder="Wpisz swoje zgłoszenie" className="border border-gray-300 rounded-md p-2 py-3 w-[60%]" />
        <Button variant="secondary" className="ml-2 bg-blue-700 text-white hover:bg-blue-800 rounded-md px-10 py-6">
          Wybierz plik
        </Button>
        <Button variant="secondary" className="ml-2 bg-green-700 text-white hover:bg-green-800 rounded-md px-10 py-6">
          Wyślij zgłoszenie
        </Button>
    </main>
  );
}