import * as React from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function toast({ title, description, variant = "default" }: ToastProps) {
  // Simple toast implementation using browser alert for now
  // Can be enhanced later with a proper toast library
  if (variant === "destructive") {
    alert(title || description || "Error occurred");
  } else {
    // Use a simple notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title || "Notification", { body: description });
    } else {
      // Fallback to console or silent success
      console.log(title || description);
    }
  }
}

function useToast() {
  return {
    toast,
  };
}

export { useToast, toast };

