import { useToastStore } from '@/store/toastStore'

const DEFAULT_DURATION = 3000

export function useToast() {
  const add = useToastStore((s) => s.add)

  return {
    success: (message: string, duration = DEFAULT_DURATION) =>
      add({ type: 'success', message, duration }),
    error: (message: string, duration = DEFAULT_DURATION) =>
      add({ type: 'error', message, duration }),
    warning: (message: string, duration = DEFAULT_DURATION) =>
      add({ type: 'warning', message, duration }),
    info: (message: string, duration = DEFAULT_DURATION) =>
      add({ type: 'info', message, duration }),
  }
}
