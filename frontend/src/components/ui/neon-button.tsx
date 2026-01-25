
import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NeonButtonProps extends ButtonProps {
    glow?: boolean
}

export function NeonButton({ className, variant = "default", glow = true, children, ...props }: NeonButtonProps) {
    return (
        <Button
            variant={variant}
            className={cn(
                "relative overflow-hidden transition-all duration-300",
                variant === "default" && glow && "shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.7)] hover:scale-[1.02]",
                variant === "outline" && "border-primary/50 text-primary hover:bg-primary/10 hover:border-primary",
                className
            )}
            {...props}
        >
            {children}
        </Button>
    )
}
