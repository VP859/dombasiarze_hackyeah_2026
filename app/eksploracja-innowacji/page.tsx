import { redirect } from "next/navigation"

// Lista innowacji jest teraz w /biblioteka (te same dane z Supabase).
export default function Page() {
  redirect("/biblioteka")
}
