"use client"

import { type FormEvent, useEffect, useRef, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Circle } from "react-leaflet"
import { Label } from "@/components/ui/label"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Position = {
  lat: number
  lng: number
}

export type OperationLocation = Position & {
  city: string
  municipality: string
  radiusMeters: number
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

  useEffect(() => {
    if (!fitBounds) {
      map.panTo([center.lat, center.lng], {
        animate: true,
        duration: 0.35,
      })
      return
    }

    const circleBounds = L.latLng(center.lat, center.lng).toBounds(
      DEFAULT_OPERATION_RADIUS_METERS * 2
    )

    map.flyToBounds(circleBounds, {
      duration: 0.35,
      padding: [48, 48],
      maxZoom: 15,
    })
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
  const [cityError, setCityError] = useState("")
  const [isSearchingCity, setIsSearchingCity] = useState(false)
  const locationRequestIdRef = useRef(0)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Twoja przeglądarka nie obsługuje geolokalizacji.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        })
      },
      (error) => {
        console.error(error)

        setError("Nie udało się pobrać Twojej lokalizacji.")
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
            radiusMeters: radius,
          }
    )
  }, [onLocationChange, centerLat, centerLng, cityQuery, cityMunicipality, radius])

  const selectMapLocation = async (nextPosition: Position) => {
    const requestId = ++locationRequestIdRef.current
    setSelectedCenter(nextPosition)
    setCityQuery("")
    setCityResult("")
    setCityMunicipality("")
    setCityError("")
    setIsSearchingCity(true)

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reverse: true, ...nextPosition }),
      })
      const result = (await response.json()) as {
        location?: Position & {
          label: string
          displayName: string
          municipality?: string
        }
        error?: string
      }

      if (!response.ok || !result.location) {
        throw new Error(result.error || "Nie udało się ustalić miejscowości.")
      }
      if (requestId !== locationRequestIdRef.current) return

      setCityQuery(result.location.label)
      setCityResult(result.location.displayName)
      setCityMunicipality(result.location.municipality ?? "")
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
    const query = cityQuery.trim()

    if (!query) {
      setCityError("Wpisz nazwę miejscowości.")
      setCityResult("")
      return
    }

    setIsSearchingCity(true)
    setCityError("")
    setCityResult("")
    setCityMunicipality("")
    const requestId = ++locationRequestIdRef.current

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const result = (await response.json()) as {
        location?: Position & {
          label: string
          displayName: string
          municipality?: string
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
      <div className="grid w-full max-w-7xl grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative h-[500px] w-full min-w-0 overflow-hidden rounded-xl">
          <MapContainer
            center={[52.2297, 21.0122]}
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
                    color: "red",
                    fillColor: "red",
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
                <Popup>Środek wybranego okręgu działania</Popup>
              </Marker>
            )}
          </MapContainer>

          {!position && !error && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />

                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-600" />
                </div>

                {/* Tekst */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">
                    Pobieranie lokalizacji
                  </p>

                  <div className="mt-1 flex justify-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-sm shadow-lg">
              {error}
            </div>
          )}
        </div>

        <section className="flex w-full min-w-0 flex-col gap-5 border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Obszar działania
            </h2>
            <p className="text-sm text-muted-foreground">
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
              className="text-right text-xs text-muted-foreground tabular-nums"
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
            className="w-full accent-emerald-600"
            aria-valuetext={`${radius} metrów`}
          />
          <p className="text-sm text-muted-foreground">
            Kliknij mapę, aby wybrać środek okręgu. Niebieski znacznik możesz
            przeciągnąć w inne miejsce.
          </p>
          <form onSubmit={searchCity}>
            <Field className="gap-1">
              <FieldLabel htmlFor="input-field-miasto" className="text-xs">
                Miejscowość
              </FieldLabel>
              <div className="flex gap-2 items-center   ">
                <Input
                  id="input-field-miasto"
                  className="h-9 min-w-0 rounded-lg text-xs text-foreground placeholder:text-xs placeholder:text-muted-foreground"
                  type="text"
                  placeholder="Np. Kraków"
                  value={cityQuery}
                  onChange={(event) => {
                    locationRequestIdRef.current += 1
                    setIsSearchingCity(false)
                    setCityQuery(event.target.value)
                    setCityResult("")
                    setCityMunicipality("")
                    setCityError("")
                  }}
                  maxLength={100}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  variant="default"
                  size="xs"
                  className="h-9 min-h-9 rounded-lg px-2 py-1 text-xs"
                  disabled={isSearchingCity}
                >
                  {isSearchingCity ? "Szukam…" : "Szukaj"}
                </Button>
                
              </div>

              {cityResult && (
                <p role="status" className="text-xs text-muted-foreground">
                  Wybrano: {cityResult}
                </p>
              )}
              {cityError && (
                <p role="alert" className="text-xs text-destructive">
                  {cityError}
                </p>
              )}
            </Field>
          </form>

          {selectedCenter && position && (
            <button
              type="button"
              onClick={() => setSelectedCenter(null)}
              className="self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Wróć do mojej lokalizacji
            </button>
          )}
        </section>
      </div>
    </>
  )
}
