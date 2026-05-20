import { useToast } from 'vue-toastification'
import type { ToastID, ToastOptions } from 'vue-toastification/dist/types/types'
import { TYPE } from 'vue-toastification'

type ToastOptionWarning = ToastOptions & { type?: typeof TYPE.WARNING }
type ToastOptionInfo = ToastOptions & { type?: typeof TYPE.INFO }
type ToastOptionError = ToastOptions & { type?: typeof TYPE.ERROR }
type ToastOptionSuccess = ToastOptions & { type?: typeof TYPE.SUCCESS }

class Notifier {
  private getToast() {
    return useToast()
  }

  dismiss(toastId: ToastID) {
    this.getToast().dismiss(toastId)
  }

  clear() {
    this.getToast().clear()
  }

  notifyError(message: string, err?: Error, toastOptions?: ToastOptionError): ToastID {
    console.error(message, err)
    const errMsg = (err as any)?.response?.data?.message ?? (err as any)?.response?.message ?? err?.message ?? ''
    const fullMessage = errMsg ? `${message}${message.endsWith('.') ? '' : ': '}${errMsg}` : message
    return this.getToast().error(fullMessage, toastOptions)
  }

  notifyWarning(message: string, toastOptions?: ToastOptionWarning): ToastID {
    return this.getToast().warning(message, toastOptions)
  }

  notifySuccess(message: string, toastOptions?: ToastOptionSuccess): ToastID {
    return this.getToast().success(message, toastOptions)
  }

  notifyInfo(message: string, toastOptions?: ToastOptionInfo): ToastID {
    return this.getToast().info(message, toastOptions)
  }
}

export const notifier = new Notifier()
