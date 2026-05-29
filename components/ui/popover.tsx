"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverPortal({ ...props }: PopoverPrimitive.Portal.Props) {
    return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

function PopoverPositioner({
    className,
    sideOffset = 4,
    ...props
}: PopoverPrimitive.Positioner.Props & { sideOffset?: number }) {
    return (
        <PopoverPrimitive.Positioner
            data-slot="popover-positioner"
            className={cn("z-50", className)}
            sideOffset={sideOffset}
            {...props}
        />
    );
}

function PopoverPopup({ className, ...props }: PopoverPrimitive.Popup.Props) {
    return (
        <PopoverPrimitive.Popup
            data-slot="popover-popup"
            className={cn(
                "w-[min(var(--popover-anchor-width,100vw)_-_2rem,_20rem)] max-w-none rounded-xl bg-popover p-3 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                className,
            )}
            {...props}
        />
    );
}

export {
    Popover,
    PopoverPortal,
    PopoverPopup,
    PopoverPositioner,
    PopoverTrigger,
};
