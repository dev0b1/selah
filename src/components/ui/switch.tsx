import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
      className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-border/40 bg-selah-wood/30 transition-colors data-[state=checked]:bg-selah-wood-dark data-[state=unchecked]:bg-selah-wood/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selah-wood-dark focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-selah-wood/30 shadow-md ring-1 ring-border transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-selah-wood-dark data-[state=checked]:ring-2 data-[state=checked]:ring-selah-wood-dark data-[state=checked]:shadow-lg data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

