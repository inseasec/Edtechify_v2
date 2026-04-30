export default function LoadingSpinner() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent shadow-sm" />
    </div>
  )
}
