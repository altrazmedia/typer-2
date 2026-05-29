"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { XIcon } from "lucide-react";
import type { FC, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { toastManager } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ToastProviderViewportProps {
  children: ReactNode;
}

/** Wraps app + renders stacked toasts globally (see `toastManager` / `showErrorToast`). */
export const ToastProviderViewport: FC<ToastProviderViewportProps> = ({
  children,
}) => {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          className={cn(
            "fixed inset-x-0 bottom-4 z-[100] mx-auto flex w-full max-w-sm flex-col gap-2 px-4 outline-none",
          )}
        >
          <ToastStack />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
};

const ToastStack: FC = () => {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <>
      {toasts.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          toast={item}
          className={cn(
            "rounded-xl bg-background p-3 text-sm text-foreground shadow-md ring-1 ring-foreground/10 outline-none focus-visible:ring-2",
            item.type === "error" && "bg-destructive/10 text-destructive ring-destructive/30",
          )}
        >
          <ToastPrimitive.Content className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <ToastPrimitive.Title className="font-heading font-medium leading-snug">
                {item.title}
              </ToastPrimitive.Title>
              {item.description ? (
                <ToastPrimitive.Description className="text-muted-foreground text-xs">
                  {item.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close
              aria-label="Zamknij"
              render={<Button variant="ghost" size="icon-sm" className="shrink-0" />}
            >
              <XIcon className="size-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Content>
        </ToastPrimitive.Root>
      ))}
    </>
  );
};
