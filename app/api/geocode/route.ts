type GeocodeResult = {
  lat: string
  lon: string
  display_name: string
  address?: Record<string, string>
}

type CachedLocation = {
  lat: number
  lng: number
  label: string
  displayName: string
  municipality?: string
  street: string
  building: string
} | null

const resultCache = new Map<string, CachedLocation>()
let lastRequestAt = 0
let requestQueue: Promise<void> = Promise.resolve()

async function waitForNominatimSlot() {
  const previousRequest = requestQueue
  let releaseQueue!: () => void
  requestQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve
  })

  await previousRequest

  try {
    const wait = Math.max(0, 1000 - (Date.now() - lastRequestAt))
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait))
    }
    lastRequestAt = Date.now()
  } finally {
    releaseQueue()
  }
}

export async function POST(request: Request) {
  let body: {
    query?: unknown
    city?: unknown
    street?: unknown
    building?: unknown
    reverse?: unknown
    lat?: unknown
    lng?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Nieprawidłowe zapytanie." }, { status: 400 })
  }

  const isReverse = body.reverse === true
  const isStructuredSearch =
    !isReverse &&
    (body.city !== undefined || body.street !== undefined || body.building !== undefined)
  const city = typeof body.city === "string" ? body.city.trim() : ""
  const street = typeof body.street === "string" ? body.street.trim() : ""
  const building = typeof body.building === "string" ? body.building.trim() : ""
  const searchQuery = isStructuredSearch
    ? [building, street, city, "Polska"].filter(Boolean).join(", ")
    : typeof body.query === "string"
      ? body.query.trim()
      : ""
  let cacheKey: string

  if (isReverse) {
    if (
      typeof body.lat !== "number" ||
      typeof body.lng !== "number" ||
      !Number.isFinite(body.lat) ||
      !Number.isFinite(body.lng) ||
      Math.abs(body.lat) > 90 ||
      Math.abs(body.lng) > 180
    ) {
      return Response.json({ error: "Nieprawidłowe współrzędne." }, { status: 400 })
    }
    cacheKey = `reverse:${body.lat.toFixed(4)},${body.lng.toFixed(4)}`
  } else if (isStructuredSearch) {
    const addressFields = [body.city, body.street, body.building]
    if (
      addressFields.some((field) => field !== undefined && typeof field !== "string") ||
      addressFields.some((field) => typeof field === "string" && field.length > 100)
    ) {
      return Response.json({ error: "Nieprawidłowe dane adresu." }, { status: 400 })
    }
    if (!city && !street && !building) {
      return Response.json({ error: "Wpisz miejscowość, ulicę lub numer budynku." }, { status: 400 })
    }
    cacheKey = `search:${searchQuery.toLocaleLowerCase("pl-PL")}`
  } else {
    if (typeof body.query !== "string" || !body.query.trim() || body.query.length > 100) {
      return Response.json(
        { error: "Podaj nazwę miejscowości (maksymalnie 100 znaków)." },
        { status: 400 }
      )
    }
    cacheKey = `search:${body.query.trim().toLocaleLowerCase("pl-PL")}`
  }

  if (resultCache.has(cacheKey)) {
    const location = resultCache.get(cacheKey)
    return location
      ? Response.json({ location })
      : Response.json({ error: "Nie znaleziono miejscowości w Polsce." }, { status: 404 })
  }

  try {
    await waitForNominatimSlot()

    const params = isReverse
      ? new URLSearchParams({
          lat: String(body.lat),
          lon: String(body.lng),
          format: "jsonv2",
          zoom: "18",
          addressdetails: "1",
        })
      : new URLSearchParams({
          q: searchQuery,
          countrycodes: "pl",
          format: "jsonv2",
          limit: "1",
          addressdetails: "1",
        })
    const endpoint = isReverse ? "reverse" : "search"
    const response = await fetch(
      `https://nominatim.openstreetmap.org/${endpoint}?${params.toString()}`,
      {
        headers: {
          "Accept-Language": "pl",
          "User-Agent": "PodajDalej/1.0 (geocoding; OpenStreetMap Nominatim)",
        },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim returned ${response.status}`)
    }

    const payload = (await response.json()) as GeocodeResult | GeocodeResult[]
    const match = Array.isArray(payload) ? payload[0] : payload
    if (!match) {
      resultCache.set(cacheKey, null)
      return Response.json(
        { error: "Nie znaleziono miejscowości w Polsce." },
        { status: 404 }
      )
    }

    const address = match.address
    const location: NonNullable<CachedLocation> = {
      lat: Number(isReverse ? body.lat : match.lat),
      lng: Number(isReverse ? body.lng : match.lon),
      label:
        address?.city ??
        address?.town ??
        address?.village ??
        address?.municipality ??
        address?.county ??
        match.display_name,
      displayName: match.display_name,
      municipality: address?.municipality,
      street:
        address?.road ??
        address?.pedestrian ??
        address?.residential ??
        address?.path ??
        "",
      building: address?.house_number ?? address?.building ?? "",
    }
    if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
      throw new Error("Nominatim returned invalid coordinates")
    }

    resultCache.set(cacheKey, location)
    return Response.json({ location })
  } catch (error) {
    console.error("Geocoding error:", error)
    return Response.json(
      { error: "Nie udało się połączyć z usługą wyszukiwania miejscowości." },
      { status: 502 }
    )
  }
}