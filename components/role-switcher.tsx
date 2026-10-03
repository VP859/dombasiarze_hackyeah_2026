"use client"

import { useId } from "react"
import { useRouter } from "next/navigation"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ROLE_COOKIE, ROLES, type Role } from "@/lib/role"

// Przełącznik ról zamiast logowania: zapisuje rolę w ciasteczku i odświeża stronę z serwera.
export function RoleSwitcher({ role, className }: { role: Role; className?: string }) {
  const router = useRouter()
  const id = useId()

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor={id} className="text-base text-muted-foreground">
        Jestem
      </label>
      <Select
        id={id}
        items={ROLES}
        value={role}
        onValueChange={(value) => {
          document.cookie = `${ROLE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`
          router.refresh()
        }}
      >
        <SelectTrigger className="min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
