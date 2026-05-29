"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
    return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
    return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
    return (
        <DialogPrimitive.Backdrop
            data-slot="sheet-overlay"
            className={cn(
                "fixed inset-0 isolate z-50 bg-black/40 duration-200 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
                className,
            )}
            {...props}
        />
    );
}

function SheetContent({
    className,
    children,
    ...props
}: DialogPrimitive.Popup.Props) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <DialogPrimitive.Popup
                data-slot="sheet-content"
                className={cn(
                    "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col gap-4 rounded-t-2xl bg-popover p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom",
                    className,
                )}
                {...props}
            >
                <div
                    aria-hidden
                    className="mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30"
                />
                {children}
            </DialogPrimitive.Popup>
        </SheetPortal>
    );
}

export { Sheet, SheetContent, SheetOverlay, SheetPortal };
