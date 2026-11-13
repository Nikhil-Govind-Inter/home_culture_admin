import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  /** Cap the list height to this many rows; the rest scrolls. */
  maxVisibleItems?: number
  /** Size the trigger to the longest option label instead of full width. */
  autoWidth?: boolean
  /** Start at the placeholder's width, then resize to fit the selected label. */
  fitSelected?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled,
  className,
  maxVisibleItems,
  autoWidth,
  fitSelected,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((option) => option.value === value)
  // ch ≈ one character; +6 leaves room for padding, chevron and check icon.
  const autoWidthStyle = autoWidth
    ? {
        width: `${Math.max(...options.map((o) => o.label.length), placeholder.length) + 6}ch`,
        maxWidth: "24rem",
      }
    : fitSelected
      ? {
          // Never narrower than the placeholder; +8 covers padding, gap and chevron.
          width: `${Math.max(selected ? selected.label.length : 0, placeholder.length) + 8}ch`,
          maxWidth: "24rem",
        }
      : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          style={autoWidthStyle}
          className={cn(
            "w-full shrink-0 justify-between font-normal",
            fitSelected && "transition-[width] duration-200",
            !selected && "text-muted-foreground",
            className
          )}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {/* Grows to fit the longest option (never narrower than the trigger) so labels aren't clipped. */}
      <PopoverContent className="w-auto min-w-[--radix-popover-trigger-width] max-w-[24rem] p-0">
        <Command className="overflow-visible">
          <CommandInput placeholder={searchPlaceholder} />
          {/* row = 32px (py-1.5 + text-sm), group padding = 8px */}
          <CommandList
            className="overflow-x-visible"
            style={maxVisibleItems ? { maxHeight: maxVisibleItems * 32 + 8 } : undefined}
          >
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="overflow-visible">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="capitalize whitespace-nowrap"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
