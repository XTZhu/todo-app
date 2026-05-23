import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/8 text-destructive",
        outline: "bg-muted text-muted-foreground",
        priority_high: "bg-rose-100 text-rose-700 dark:bg-rose-900/25 dark:text-rose-400",
        priority_medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400",
        priority_low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
