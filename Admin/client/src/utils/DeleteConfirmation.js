import Swal from 'sweetalert2'

/**
 * Confirm delete with SweetAlert2, then run async onConfirm (e.g. api.delete).
 * On success shows success toast and calls onSuccess.
 */
export default async function DeleteConfirmation({
  title,
  text,
  successMessage,
  errorMessage,
  onConfirm,
  onCancel,
  onSuccess,
}) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) {
    onCancel?.()
    return
  }

  try {
    await onConfirm()
    await Swal.fire({
      icon: 'success',
      title: successMessage,
      toast: true,
      position: 'bottom',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    })
    onSuccess?.()
  } catch (err) {
    console.error(err)
    await Swal.fire({
      icon: 'error',
      title: errorMessage,
      toast: true,
      position: 'bottom',
      showConfirmButton: false,
      timer: 4000,
    })
  }
}
