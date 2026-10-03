interface PageProps {
  searchParams: Promise<{ ideaId?: string; callId?: string }>
}

export default async function GeneratorPage({ searchParams }: PageProps) {
  const { ideaId, callId } = await searchParams

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Generator Wniosku Grantowego</h1>
      <p className="text-slate-600">
        ID Pomysłu: <code className="bg-slate-100 p-1 rounded">{ideaId || 'Brak'}</code>
      </p>
    </main>
  )
}