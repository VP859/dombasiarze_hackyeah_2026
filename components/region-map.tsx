// Schematyczna mapa Małopolski: miasta powiatowe (przybliżone współrzędne) i łuki „podaj dalej”.
// Sylwetka regionu to kropki przycięte do okręgów wokół miast — ilustracja, nie dokładne granice.
const TOWNS = {
  krakow: { name: "Kraków", lat: 50.06, lon: 19.94, label: true },
  tarnow: { name: "Tarnów", lat: 50.01, lon: 20.99, label: true },
  nowySacz: { name: "Nowy Sącz", lat: 49.62, lon: 20.69, label: true },
  zakopane: { name: "Zakopane", lat: 49.3, lon: 19.95, label: true },
  oswiecim: { name: "Oświęcim", lat: 50.04, lon: 19.23, label: true },
  nowyTarg: { name: "Nowy Targ", lat: 49.48, lon: 20.03 },
  chrzanow: { name: "Chrzanów", lat: 50.14, lon: 19.4 },
  olkusz: { name: "Olkusz", lat: 50.28, lon: 19.56 },
  miechow: { name: "Miechów", lat: 50.36, lon: 20.03 },
  proszowice: { name: "Proszowice", lat: 50.19, lon: 20.29 },
  wieliczka: { name: "Wieliczka", lat: 49.99, lon: 20.06 },
  bochnia: { name: "Bochnia", lat: 49.97, lon: 20.43 },
  brzesko: { name: "Brzesko", lat: 49.97, lon: 20.61 },
  dabrowa: { name: "Dąbrowa Tarnowska", lat: 50.17, lon: 20.99 },
  gorlice: { name: "Gorlice", lat: 49.66, lon: 21.16 },
  limanowa: { name: "Limanowa", lat: 49.71, lon: 20.42 },
  myslenice: { name: "Myślenice", lat: 49.83, lon: 19.94 },
  sucha: { name: "Sucha Beskidzka", lat: 49.74, lon: 19.59 },
  wadowice: { name: "Wadowice", lat: 49.88, lon: 19.49 },
} as const

type Town = keyof typeof TOWNS

// Łańcuchy przekazywania: każdy kolejny odcinek rysuje się chwilę później.
const CHAINS: Town[][] = [
  ["krakow", "myslenice", "nowyTarg", "zakopane"],
  ["krakow", "proszowice", "miechow"],
  ["tarnow", "brzesko", "bochnia"],
  ["tarnow", "dabrowa"],
  ["nowySacz", "limanowa"],
  ["nowySacz", "gorlice"],
  ["oswiecim", "wadowice", "sucha"],
]

const SOURCES = new Set(CHAINS.map((chain) => chain[0]))

// Rzut równoodległościowy, długość skrócona o cos(49,8°).
function project(lat: number, lon: number) {
  return { x: (lon - 18.95) * 161, y: (50.62 - lat) * 250 }
}

const points = Object.fromEntries(
  Object.entries(TOWNS).map(([id, t]) => [id, project(t.lat, t.lon)])
) as Record<Town, { x: number; y: number }>

// Krynica-Zdrój domyka południowy wschód, a punkty w połowie drogi między sąsiednimi miastami
// wypełniają dziury, żeby region był jedną plamą, a nie wyspami.
const anchors = [...Object.values(points), project(49.42, 20.96)]
const shape = [
  ...anchors,
  ...anchors.flatMap((a, i) =>
    anchors
      .slice(i + 1)
      .filter((b) => Math.hypot(a.x - b.x, a.y - b.y) < 120)
      .map((b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }))
  ),
]

function arc(from: Town, to: Town) {
  const a = points[from]
  const b = points[to]
  // Punkt kontrolny odsunięty prostopadle — delikatny łuk zamiast prostej.
  const mx = (a.x + b.x) / 2 - (b.y - a.y) * 0.25
  const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.25
  return `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`
}

export function RegionMap({ className }: { className?: string }) {
  const segments = CHAINS.flatMap((chain) =>
    chain.slice(1).map((to, i) => ({ from: chain[i], to, step: i }))
  )

  return (
    <svg
      viewBox="0 0 400 380"
      role="img"
      aria-label="Schematyczna mapa Małopolski. Linie łączą miasta i pokazują, jak sprawdzone pomysły przechodzą z gminy do gminy."
      className={className}
    >
      <defs>
        <pattern id="region-dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1.6" className="fill-muted-foreground/35" />
        </pattern>
        <mask id="region-shape">
          {shape.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="40" fill="white" />
          ))}
        </mask>
      </defs>

      <rect width="400" height="380" fill="url(#region-dots)" mask="url(#region-shape)" />

      {segments.map(({ from, to, step }) => (
        <path
          key={`${from}-${to}`}
          d={arc(from, to)}
          pathLength={1}
          strokeDasharray="1"
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="stroke-primary motion-safe:animate-draw dark:stroke-chart-2"
          style={{ animationDelay: `${300 + step * 450}ms` }}
        />
      ))}

      {(Object.keys(TOWNS) as Town[]).map((id) => {
        const { x, y } = points[id]
        const town = TOWNS[id]
        const source = SOURCES.has(id)
        return (
          <g key={id}>
            <circle
              cx={x}
              cy={y}
              r={source ? 6 : 4}
              strokeWidth={2}
              className={source ? "fill-primary stroke-background dark:fill-chart-2" : "fill-foreground stroke-background"}
            />
            {"label" in town && (
              <text
                x={x + 10}
                y={y + 4}
                fontSize={14}
                fontWeight={600}
                className="fill-foreground stroke-background [paint-order:stroke]"
                strokeWidth={4}
              >
                {town.name}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
