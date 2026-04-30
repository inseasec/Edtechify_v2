import Swal from 'sweetalert2'

const toastBase = {
  toast: true,
  position: 'bottom',
  showConfirmButton: false,
  timerProgressBar: true,
}

export function showSuccessToast(message) {
  Swal.fire({
    ...toastBase,
    icon: 'success',
    title: message,
    timer: 3000,
  })
}

export function showErrorToast(message) {
  Swal.fire({
    ...toastBase,
    icon: 'error',
    title: typeof message === 'string' ? message : 'Something went wrong',
    timer: 4000,
  })
}
