const defaultDescription =
  'Select an image file to use as the About page banner background.'

/**
 * Placeholder template picker for banner assets — choose a local file.
 * Replace with a curated template gallery when your assets are ready.
 */
export default function AboutTemplates({ onImageSelect, accept = 'image/*', description }) {
  return (
    <div className="p-8">
      <p className="mb-4 text-gray-600">{description ?? defaultDescription}</p>
      <input
        type="file"
        accept={accept}
        className="block w-full max-w-md cursor-pointer text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-orange-600"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onImageSelect(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
