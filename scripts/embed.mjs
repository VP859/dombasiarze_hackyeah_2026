// Liczy wektory (embeddingi) dla innowacji i zgłoszeń, które jeszcze ich nie mają — bez nich nie ma dopasowań.
// Uruchom: node --env-file=.env scripts/embed.mjs
import { embedSolution, generateEmbedding } from "../lib/ai.ts"
import { getSupabaseAdmin } from "../lib/supabase.ts"

const supabase = getSupabaseAdmin()
const tables = {
  solutions: { columns: "id, title, problem, method", embed: embedSolution },
  needs: { columns: "id, text", embed: (need) => generateEmbedding(need.text) },
}

for (const [table, { columns, embed }] of Object.entries(tables)) {
  const { data, error } = await supabase.from(table).select(columns).is("embedding", null)
  if (error) throw new Error(`${table}: ${error.message}`)

  for (const row of data) {
    const embedding = await embed(row)
    const { error } = await supabase
      .from(table)
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", row.id)
    if (error) throw new Error(`${table}: ${error.message}`)
  }
  console.log(`${table}: policzono ${data.length}`)
}
