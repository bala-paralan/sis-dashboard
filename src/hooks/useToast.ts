import { useToastStore } from '@/store/toastStore'
import type { ToastType } from '@/store/toastStore'

const DEFAULT_DURATION = 3000

function show(type: ToastType) {
  return (message: string, duration = DEFAULT_DURATION) => {
    useToastStore.getState().addToast({ type, message, duration })
  }
}

export const useToast = () => ({
  success: show('success'),
  error:   show('error'),
  warning: show('warning'),
  info:    show('info'),
})
