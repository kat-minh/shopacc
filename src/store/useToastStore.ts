import { create } from "zustand";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, type = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newToast: ToastMessage = { id, message, type };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
