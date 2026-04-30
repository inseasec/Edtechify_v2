import Swal from 'sweetalert2'

/** Same flash style as toastUtils: bottom toast, short timer */
export default function ShowAlert(type, message) {
  Swal.fire({
    icon: type === 'success' ? 'success' : 'error',
    title: message,
    toast: true,
    position: 'bottom',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })
}
