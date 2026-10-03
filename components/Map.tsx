"use client"

import {
  type FormEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Circle } from "react-leaflet"
import { Label } from "@/components/ui/label"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Position = {
  lat: number
  lng: number
}

export type OperationLocation = Position & {
  city: string
  municipality: string
  street: string
  building: string
  radiusMeters: number
}

type GeocodedAddress = {
  label: string
  displayName: string
  municipality?: string
  street: string
  building: string
}

async function reverseGeocodePosition(
  position: Position
): Promise<GeocodedAddress> {
  const response = await fetch("/api/geocode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reverse: true, ...position }),
  })
  const result = (await response.json()) as {
    location?: GeocodedAddress
    error?: string
  }

  if (!response.ok || !result.location) {
    throw new Error(result.error || "Nie udało się ustalić adresu.")
  }

  return result.location
}

const MAX_OPERATION_RADIUS_METERS = 50000
const DEFAULT_OPERATION_RADIUS_METERS = 500

// Własna ikona lokalizacji
const locationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(16,185,129,0.2);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const operationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 5px rgba(37,99,235,0.2);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function CenterOnUser({
  center,
  fitBounds,
}: {
  center: Position
  fitBounds: boolean
}) {
  const map = useMap()

  // useLayoutEffect: jego sprzątanie biegnie przed map.remove() w MapContainer (zwykły efekt rodzica),
  // więc zdążymy zatrzymać animację, zanim Leaflet usunie mapę.
  useLayoutEffect(() => {
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches

    if (!fitBounds) {
      map.panTo([center.lat, center.lng], { animate, duration: 0.35 })
    } else {
      const circleBounds = L.latLng(center.lat, center.lng).toBounds(
        DEFAULT_OPERATION_RADIUS_METERS * 2
      )
      const options = { padding: [48, 48] as L.PointTuple, maxZoom: 15 }
      if (animate) map.flyToBounds(circleBounds, { ...options, duration: 0.35 })
      else map.fitBounds(circleBounds, { ...options, animate: false })
    }

    // Zatrzymaj animację przy odmontowaniu (zmiana strony, podwójny montaż w dev) — inaczej Leaflet
    // sięga do usuniętej mapy („reading '_leaflet_pos'”). Gdy mapy już nie ma, nie ma czego zatrzymywać.
    return () => {
      if (map.getPane("mapPane")) map.stop()
    }
  }, [center, fitBounds, map])

  return null
}

function SelectCircleCenter({
  onSelect,
}: {
  onSelect: (position: Position) => void
}) {
  useMapEvents({
    click(event) {
      onSelect({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })

  return null
}

export default function Map({
  onLocationChange,
}: {
  onLocationChange?: (location: OperationLocation | null) => void
}) {
  const [position, setPosition] = useState<Position | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<Position | null>(null)
  const [radius, setRadius] = useState(DEFAULT_OPERATION_RADIUS_METERS)
  const [cityQuery, setCityQuery] = useState("")
  const [cityResult, setCityResult] = useState("")
  const [cityMunicipality, setCityMunicipality] = useState("")
  const [cityStreet, setCityStreet] = useState("")
  const [cityBuilding, setCityBuilding] = useState("")
  const [cityError, setCityError] = useState("")
  const [isSearchingCity, setIsSearchingCity] = useState(false)
  const locationRequestIdRef = useRef(0)

  // Mapa ładuje się tylko w przeglądarce (ssr: false), więc navigator jest dostępny od początku.
  const [error, setError] = useState<string | null>(() =>
    navigator.geolocation
      ? null
      : "Twoja przeglądarka nie obsługuje geolokalizacji."
  )

  useEffect(() => {
    // Brak geolokalizacji obsługuje już stan początkowy `error` powyżej.
    if (!navigator.geolocation) return

    const initialRequestId = locationRequestIdRef.current

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const currentPosition = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        }
        setPosition(currentPosition)

        if (locationRequestIdRef.current !== initialRequestId) return

        const requestId = ++locationRequestIdRef.current
        setIsSearchingCity(true)
        void reverseGeocodePosition(currentPosition)
          .then((address) => {
            if (requestId !== locationRequestIdRef.current) return
            setCityQuery(address.label)
            setCityResult(address.displayName)
            setCityMunicipality(address.municipality ?? "")
            setCityStreet(address.street)
            setCityBuilding(address.building)
          })
          .catch(() => {
            if (requestId === locationRequestIdRef.current) {
              setCityError(
                "Nie udało się pobrać adresu dla Twojej lokalizacji."
              )
            }
          })
          .finally(() => {
            if (requestId === locationRequestIdRef.current) {
              setIsSearchingCity(false)
            }
          })
      },
      // Odmowa zgody to normalna sytuacja, nie błąd aplikacji — bez console.error, tylko podpowiedź na mapie.
      (positionError) => {
        setError(
          positionError.code === positionError.PERMISSION_DENIED
            ? "Nie udostępniono lokalizacji. Kliknij na mapie, żeby wskazać miejsce."
            : "Nie udało się pobrać Twojej lokalizacji. Kliknij na mapie, żeby wskazać miejsce."
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  const operationCenter = selectedCenter ?? position
  const centerLat = operationCenter?.lat
  const centerLng = operationCenter?.lng

  useEffect(() => {
    onLocationChange?.(
      centerLat === undefined || centerLng === undefined
        ? null
        : {
            lat: centerLat,
            lng: centerLng,
            city: cityQuery,
            municipality: cityMunicipality,
            street: cityStreet,
            building: cityBuilding,
            radiusMeters: radius,
          }
    )
  }, [
    onLocationChange,
    centerLat,
    centerLng,
    cityQuery,
    cityMunicipality,
    cityStreet,
    cityBuilding,
    radius,
  ])

  const selectMapLocation = async (nextPosition: Position) => {
    const requestId = ++locationRequestIdRef.current
    setSelectedCenter(nextPosition)
    setCityQuery("")
    setCityResult("")
    setCityMunicipality("")
    setCityStreet("")
    setCityBuilding("")
    setCityError("")
    setIsSearchingCity(true)

    try {
      const address = await reverseGeocodePosition(nextPosition)
      if (requestId !== locationRequestIdRef.current) return

      setCityQuery(address.label)
      setCityResult(address.displayName)
      setCityMunicipality(address.municipality ?? "")
      setCityStreet(address.street)
      setCityBuilding(address.building)
    } catch (lookupError) {
      if (requestId !== locationRequestIdRef.current) return
      setCityError(
        lookupError instanceof Error
          ? "Wybrano punkt na mapie, ale nie udało się ustalić jego miejscowości."
          : "Wybrano punkt na mapie, ale nie udało się ustalić jego miejscowości."
      )
    } finally {
      if (requestId === locationRequestIdRef.current) {
        setIsSearchingCity(false)
      }
    }
  }

  const searchCity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const city = cityQuery.trim()
    const street = cityStreet.trim()
    const building = cityBuilding.trim()

    if (!city && !street && !building) {
      setCityError("Wpisz miejscowość, ulicę lub numer budynku.")
      setCityResult("")
      return
    }

    setIsSearchingCity(true)
    setCityError("")
    setCityResult("")
    setCityMunicipality("")
    setCityStreet("")
    setCityBuilding("")
    const requestId = ++locationRequestIdRef.current

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, street, building }),
      })
      const result = (await response.json()) as {
        location?: Position & {
          label: string
          displayName: string
          municipality?: string
          street: string
          building: string
        }
        error?: string
      }

      if (!response.ok || !result.location) {
        throw new Error(result.error || "Nie znaleziono miejscowości.")
      }
      if (requestId !== locationRequestIdRef.current) return

      setSelectedCenter({ lat: result.location.lat, lng: result.location.lng })
      setCityQuery(result.location.label)
      setCityResult(result.location.displayName)
      setCityMunicipality(result.location.municipality ?? "")
      setCityStreet(result.location.street)
      setCityBuilding(result.location.building)
    } catch (searchError) {
      if (requestId !== locationRequestIdRef.current) return
      setCityError(
        searchError instanceof Error
          ? searchError.message
          : "Nie udało się wyszukać miejscowości."
      )
    } finally {
      if (requestId === locationRequestIdRef.current) {
        setIsSearchingCity(false)
      }
    }
  }

  return (
    <>
      <div className="grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative isolate h-[420px] w-full min-w-0 overflow-hidden rounded-2xl ring-1 ring-foreground/10">
          <MapContainer
            center={[50.0614, 19.9366]}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SelectCircleCenter onSelect={selectMapLocation} />

            {operationCenter && (
              <>
                <Circle
                  center={[operationCenter.lat, operationCenter.lng]}
                  radius={radius}
                  pathOptions={{
                    color: "#047857",
                    fillColor: "#047857",
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                />

                <CenterOnUser
                  center={operationCenter}
                  fitBounds={Boolean(position && !selectedCenter)}
                />
              </>
            )}

            {position && (
              <Marker
                position={[position.lat, position.lng]}
                icon={locationIcon}
              >
                <Popup>Twoja aktualna lokalizacja</Popup>
              </Marker>
            )}

            {selectedCenter && (
              <Marker
                position={[selectedCenter.lat, selectedCenter.lng]}
                icon={operationIcon}
                draggable
                eventHandlers={{
                  dragend(event) {
                    const point = event.target.getLatLng()
                    void selectMapLocation({ lat: point.lat, lng: point.lng })
                  },
                }}
              >
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  {[cityBuilding, cityStreet].filter(Boolean).join(", ") ||
                    cityQuery ||
                    "Wybrany punkt"}
                </Tooltip>
                <Popup>Środek wybranego okręgu działania</Popup>
              </Marker>
            )}
          </MapContainer>

          {!position && !error && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 rounded-full border-4 border-muted" />

                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary motion-safe:animate-spin" />
                </div>

                {/* Tekst */}
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    Pobieranie lokalizacji
                  </p>

                  <div className="mt-1 flex justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary [animation-delay:-0.3s] motion-safe:animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary [animation-delay:-0.15s] motion-safe:animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-2xl border bg-background px-4 py-2"
            >
              {error}
            </div>
          )}
        </div>

        <section className="flex w-full min-w-0 flex-col gap-4 border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Obszar działania
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ustaw promień okręgu wokół wybranego punktu.
            </p>
          </div>
          <Label
            htmlFor="operation-radius"
            className="flex justify-between text-sm font-medium text-foreground"
          >
            Zasięg działania
            <output
              htmlFor="operation-radius"
              className="text-right text-sm text-muted-foreground tabular-nums"
            >
              {radius >= 1000
                ? `${(radius / 1000).toLocaleString("pl-PL")} km`
                : `${radius} m`}
            </output>
          </Label>
          <input
            id="operation-radius"
            type="range"
            min={100}
            max={MAX_OPERATION_RADIUS_METERS}
            step={100}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="h-8 w-full accent-primary"
            aria-valuetext={`${radius} metrów`}
          />
          <form
            onSubmit={searchCity}
            className="flex flex-col gap-3"
          >
            <Field>
              <FieldLabel
                htmlFor="input-field-miasto"
                className="text-sm"
              >
                Miejscowość
              </FieldLabel>
              <Input
                id="input-field-miasto"
                className="h-9 rounded-lg text-sm text-foreground placeholder:text-sm placeholder:text-muted-foreground"
                type="text"
                placeholder="Np. Kraków"
                value={cityQuery}
                onChange={(event) => {
                  locationRequestIdRef.current += 1
                  setIsSearchingCity(false)
                  setCityQuery(event.target.value)
                  setCityResult("")
                  setCityMunicipality("")
                  setCityStreet("")
                  setCityBuilding("")
                  setCityError("")
                }}
                maxLength={100}
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="report-street" className="text-sm">
                Ulica
              </FieldLabel>
              <Input
                className="h-9 rounded-lg text-sm text-foreground placeholder:text-sm placeholder:text-muted-foreground"
                id="report-street"
                name="street"
                form="report-form"
                value={cityStreet}
                onChange={(event) => {
                  setCityStreet(event.target.value)
                  setCityResult("")
                  setCityError("")
                }}
                placeholder={
                  operationCenter
                    ? "Brak danych ulicy"
                    : "Wybierz punkt na mapie"
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="report-building" className="text-sm">
                Numer budynku / punkt orientacyjny
              </FieldLabel>
              <Input
                className="h-9 rounded-lg text-sm text-foreground placeholder:text-sm placeholder:text-muted-foreground"
                id="report-building"
                name="building"
                form="report-form"
                value={cityBuilding}
                onChange={(event) => {
                  setCityBuilding(event.target.value)
                  setCityResult("")
                  setCityError("")
                }}
                placeholder={
                  operationCenter
                    ? "Brak numeru budynku"
                    : "Wybierz punkt na mapie"
                }
              />
            </Field>
            <div className="mt-2 flex w-full min-w-0 items-center gap-2">
              {selectedCenter && position && (
                <button
                  type="button"
                  onClick={() => setSelectedCenter(null)}
                  className="min-h-9 shrink-0 text-sm font-medium whitespace-nowrap text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Wróć do mojej lokalizacji
                </button>
              )}
              <Button
                type="submit"
                variant="default"
                size="xs"
                className=" w-full! flex h-9 min-h-9 shrink-0 rounded-lg px-3 py-1 text-xs"
                disabled={isSearchingCity}
              >
                {isSearchingCity ? "Szukam…" : "Szukaj"}
              </Button>
            </div>
            <p aria-live="polite" className="text-sm">
              {cityError ? (
                <span className="text-destructive">{cityError}</span>
              ) : (
                cityResult && <span className="text-muted-foreground">Znaleziono: {cityResult}</span>
              )}
            </p>
          </form>
        </section>
      </div>
    </>
  )
}
