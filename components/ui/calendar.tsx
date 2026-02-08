"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        // Container principal com sombra elegante e bordas suaves
        "bg-card dark:bg-card border border-border rounded-xl shadow-lg group/calendar p-5",
        "[--cell-size:--spacing(11)]",
        "[[data-slot=card-content]_&]:bg-card [[data-slot=popover-content]_&]:bg-popover",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-6 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-3", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-2 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-9 aria-disabled:opacity-40 p-0 select-none rounded-full",
          "hover:bg-primary/10 hover:text-primary transition-all duration-200",
          "border border-transparent hover:border-primary/20",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-9 aria-disabled:opacity-40 p-0 select-none rounded-full",
          "hover:bg-primary/10 hover:text-primary transition-all duration-200",
          "border border-transparent hover:border-primary/20",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-10 w-full px-12",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-base font-semibold justify-center h-10 gap-2 text-foreground",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-primary border border-border shadow-sm has-focus:ring-primary/30 has-focus:ring-[3px] rounded-lg",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold text-foreground tracking-tight",
          captionLayout === "label"
            ? "text-base"
            : "rounded-lg pl-3 pr-2 flex items-center gap-1.5 text-sm h-9 [&>svg]:text-muted-foreground [&>svg]:size-4",
          defaultClassNames.caption_label
        ),
        // Grid do calendário com bordas visíveis estilo Google Calendar
        table: cn(
          "w-full border-collapse",
          "border border-border rounded-lg overflow-hidden",
          "bg-background"
        ),
        weekdays: cn(
          "flex bg-muted/50 border-b border-border",
          defaultClassNames.weekdays
        ),
        weekday: cn(
          "text-muted-foreground font-semibold text-xs uppercase tracking-wider select-none py-3",
          "flex-1 text-center",
          defaultClassNames.weekday
        ),
        week: cn(
          "flex w-full",
          "border-b border-border last:border-b-0",
          defaultClassNames.week
        ),
        week_number_header: cn(
          "select-none w-10 bg-muted/30",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-xs select-none text-muted-foreground font-medium",
          defaultClassNames.week_number
        ),
        // Células dos dias com bordas visíveis
        day: cn(
          "relative flex-1 p-0 text-center group/day aspect-square select-none",
          "border-r border-border last:border-r-0",
          "[&:first-child[data-selected=true]_button]:rounded-l-lg",
          "[&:last-child[data-selected=true]_button]:rounded-r-lg",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-lg bg-primary/20",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "rounded-none bg-primary/10",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "rounded-r-lg bg-primary/20",
          defaultClassNames.range_end
        ),
        // Hoje com destaque especial
        today: cn(
          "bg-primary/5 dark:bg-primary/10",
          "[&_button]:ring-2 [&_button]:ring-primary [&_button]:ring-offset-1",
          "[&_button]:text-primary [&_button]:font-bold",
          "data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground/40 bg-muted/20 aria-selected:text-muted-foreground/60",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground/30 opacity-40 cursor-not-allowed",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("size-5 text-foreground", className)}
                {...props}
              />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-5 text-foreground", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon
              className={cn("size-5 text-foreground", className)}
              {...props}
            />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-10 items-center justify-center text-center bg-muted/30 border-r border-border">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        // Base styles
        "relative flex aspect-square size-full min-h-10 min-w-10 flex-col items-center justify-center",
        "rounded-lg font-medium text-sm text-foreground",
        "transition-all duration-200 ease-out",

        // Hover effect - estilo Google Calendar
        "hover:bg-primary/10 hover:text-primary hover:scale-105",
        "hover:shadow-sm hover:z-10",

        // Focus states
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        "group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-primary/50",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10",

        // Selected single day - círculo azul como no Google Calendar
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[selected-single=true]:font-semibold data-[selected-single=true]:shadow-md",
        "data-[selected-single=true]:hover:bg-primary/90 data-[selected-single=true]:hover:scale-105",

        // Range selection styles
        "data-[range-middle=true]:bg-primary/15 data-[range-middle=true]:text-primary",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:hover:bg-primary/25",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-start=true]:rounded-l-lg data-[range-start=true]:rounded-r-none",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "data-[range-end=true]:rounded-r-lg data-[range-end=true]:rounded-l-none",

        // Sub-elements
        "[&>span]:text-xs [&>span]:opacity-60 [&>span]:mt-0.5",

        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
