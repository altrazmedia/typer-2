"use client";

import { Toast } from "@base-ui/react/toast";

export const toastManager = Toast.createToastManager();

export function showErrorToast(message: string): void {
  toastManager.add({
    title: message,
    type: "error",
    priority: "high",
    timeout: 5000,
  });
}
