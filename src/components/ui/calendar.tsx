"use client"

import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import "@/styles/daypicker.css"

export function Calendar({
  selected,
  onSelect,
  className,
}: {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      className={className}
    />
  )
}
