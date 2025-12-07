
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kbs-green/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:scale-105 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-kbs-green to-kbs-light text-white hover:from-kbs-green/90 hover:to-kbs-light/90 shadow-md",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md",
        outline:
          "border-2 border-kbs-green bg-white text-kbs-green hover:bg-kbs-green hover:text-white shadow-sm",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-kbs-brown hover:from-gray-200 hover:to-gray-300 shadow-sm",
        ghost: "text-kbs-brown hover:bg-kbs-green/10 hover:text-kbs-green",
        link: "text-kbs-green underline-offset-4 hover:underline hover:text-kbs-green/80",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-xl px-4 text-xs",
        lg: "h-12 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
