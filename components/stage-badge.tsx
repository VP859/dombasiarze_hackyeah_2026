import { BadgeCheckIcon, FlaskConicalIcon, LightbulbIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Stage } from "@/seed"

const STAGE = {
  pomysł: { label: "Pomysł", variant: "outline", icon: LightbulbIcon },
  pilotaż: { label: "Pilotaż", variant: "outline", icon: FlaskConicalIcon },
  sprawdzona: { label: "Sprawdzona", variant: "secondary", icon: BadgeCheckIcon },
} as const

export function StageBadge({ stage }: { stage: Stage }) {
  const stageConfig = STAGE[stage]

  if (!stageConfig) {
    return null
  }

  const { label, variant, icon: Icon } = stageConfig

  return (
    <Badge variant={variant}>
      <Icon data-icon="inline-start" aria-hidden /> {label}
    </Badge>
  )
}
