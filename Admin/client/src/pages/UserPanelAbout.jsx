import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import api from '@/lib/api'
import { showErrorToast, showSuccessToast } from '@/utils/toastUtils'
import AboutTemplates from '@/Components/AboutTemplates'

const ORG_UPDATE_PATH = '/organizations/update'
const ACHIEVEMENT_ADD_PATH = '/organizations/achievement/add'
const ACHIEVEMENT_DELETE_PATH = '/organizations/achievement'

const baseUrl = window._CONFIG_.VITE_API_BASE_URL;
// const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

function courseImageUrl(filename) {
  if (!filename || typeof filename !== 'string') return ''
  const path = filename.replace(/^\//, '')
  if (path.includes('course-images')) return `${baseUrl}/${path}`
  return `${baseUrl}/course-images/${path}`
}

function multipartConfig() {
  return {
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData) {
          delete headers['Content-Type']
        }
        return body
      },
    ],
  }
}

const defaultAchievementTitle =
  'What benefits will you receive upon completing your courses at Rankwell ?'

export default function UserPanelAbout() {
  const ctx = useOutletContext()
  const ctxMode = Boolean(ctx)

  const {
    formData,
    handleTextChange,
    handleFileChange,
    files,
    isLoading: ctxIsLoading,
    saving: ctxSaving,
    fetchAllData: ctxFetchAllData,
    baseUrl: ctxBaseUrl,
  } = ctx ?? {}

  const fileInputRef = useRef(null)
  const achRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [orgName, setOrgName] = useState('')
  const [orgAddress, setOrgAddress] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')

  const [vision, setVision] = useState('')
  const [mission, setMission] = useState('')
  const [orgValues, setOrgValues] = useState('')

  const [directorName, setDirectorName] = useState('')
  const [directorRole, setDirectorRole] = useState('')
  const [aboutDirector, setAboutDirector] = useState('')

  const [achievementTitle, setAchievementTitle] = useState(defaultAchievementTitle)
  const [isEditingAchievement, setIsEditingAchievement] = useState(false)
  const [editAchievementValue, setEditAchievementValue] = useState('')

  const [bannerPreview, setBannerPreview] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  const [directorImagePreview, setDirectorImagePreview] = useState(null)
  const [directorImageFile, setDirectorImageFile] = useState(null)

  const [existingAchievementImages, setExistingAchievementImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [achievementPreviewUrl, setAchievementPreviewUrl] = useState(null)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [customTemplateOpen, setCustomTemplateOpen] = useState(false)

  const setCtxField = useCallback(
    (name, value) => {
      if (!ctxMode || !handleTextChange) return
      handleTextChange({ target: { name, value } })
    },
    [ctxMode, handleTextChange],
  )

  const ctxAchievementImages = Array.isArray(formData?.orgAchievement?.achivementImages)
    ? formData.orgAchievement.achivementImages
    : []

  const aboutWallpaperPath = formData?.orgAboutUs?.aboutWallpaper ?? null
  const directorImagePath = formData?.orgDirectorDetail?.directorImage ?? null
  const ctxAchievementTitle =
    formData?.orgAchievement?.achivementTitle ??
    formData?.orgAchievement?.achievementTitle ??
    defaultAchievementTitle

  const effectiveBaseUrl = (ctxBaseUrl ?? baseUrl)?.replace(/\/$/, '') ?? ''

  useEffect(() => {
    if (!selectedImage) {
      setAchievementPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(selectedImage)
    setAchievementPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [selectedImage])

  useEffect(() => {
    return () => {
      if (bannerPreview?.startsWith?.('blob:')) URL.revokeObjectURL(bannerPreview)
      if (directorImagePreview?.startsWith?.('blob:')) URL.revokeObjectURL(directorImagePreview)
    }
  }, [bannerPreview, directorImagePreview])

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/organizations/details')
      const data = res.data?.data ?? res.data
      if (!data) return

      setOrgName(data.orgName ?? '')
      setOrgAddress(data.orgAddress ?? '')
      setOrgPhone(data.orgPhone ?? '')
      setOrgEmail(data.orgEmail ?? '')

      const oa = data.orgAboutUs ?? {}
      setVision(oa.vision ?? '')
      setMission(oa.mission ?? '')
      setOrgValues(oa.orgValues ?? '')

      const od = data.orgDirectorDetail ?? {}
      setDirectorName(od.directorName ?? '')
      setDirectorRole(od.role ?? '')
      setAboutDirector(od.aboutDirector ?? '')

      const oach = data.orgAchievement ?? {}
      setAchievementTitle(oach.achivementTitle ?? oach.achievementTitle ?? defaultAchievementTitle)

      const aboutWp =
        oa.aboutWallpaper ?? data.existingFiles?.aboutWallpaper ?? data.aboutWallpaper ?? null
      setBannerFile(null)
      if (aboutWp) {
        const url = courseImageUrl(aboutWp)
        setBannerPreview(url)
      } else {
        setBannerPreview(null)
      }

      const dirImg =
        od.directorImage ?? data.existingFiles?.directorImage ?? data.directorImage ?? null
      setDirectorImageFile(null)
      if (dirImg) {
        setDirectorImagePreview(courseImageUrl(dirImg))
      } else {
        setDirectorImagePreview(null)
      }

      const achImgs =
        oach.achivementImages ??
        oach.achievementImages ??
        data.existingFiles?.achievementImages ??
        data.achievementImages ??
        []
      setExistingAchievementImages(Array.isArray(achImgs) ? [...achImgs] : [])
    } catch (err) {
      console.error(err)
      showErrorToast(err?.response?.data?.message ?? err?.response?.data ?? 'Could not load organization')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (ctxMode) return
    loadDetails()
  }, [ctxMode, loadDetails])

  const handleBannerFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (ctxMode) {
      handleFileChange?.('wallpaper', file)
      setShowUploadModal(false)
      setCustomTemplateOpen(false)
      return
    }
    if (bannerPreview?.startsWith?.('blob:')) URL.revokeObjectURL(bannerPreview)
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleBannerFile(file)
    }
    e.target.value = ''
  }

  const handleDirectorImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (ctxMode) {
      handleFileChange?.('directorImage', file)
      e.target.value = ''
      return
    }
    if (directorImagePreview?.startsWith?.('blob:')) URL.revokeObjectURL(directorImagePreview)
    setDirectorImageFile(file)
    setDirectorImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleTemplateImageSelect = (file) => {
    if (!file) {
      if (!ctxMode) {
        if (bannerPreview?.startsWith?.('blob:')) URL.revokeObjectURL(bannerPreview)
        setBannerPreview(null)
        setBannerFile(null)
      } else {
        handleFileChange?.('wallpaper', null)
      }
      setCustomTemplateOpen(false)
      return
    }
    handleBannerFile(file)
  }

  const saveAchievementHeading = () => {
    const v = editAchievementValue.trim()
    if (ctxMode) {
      if (v) setCtxField('orgAchievement.achivementTitle', v)
    } else {
      if (v) setAchievementTitle(v)
    }
    setIsEditingAchievement(false)
    setEditAchievementValue('')
  }

  const handleAchievementKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveAchievementHeading()
    }
    if (e.key === 'Escape') {
      setIsEditingAchievement(false)
      setEditAchievementValue('')
    }
  }

  const handleUpdate = async () => {
    try {
      setSaving(true)
      const fd = new FormData()
      fd.append('orgName', orgName)
      fd.append('orgAddress', orgAddress)
      fd.append('orgPhone', orgPhone)
      fd.append('orgEmail', orgEmail)

      fd.append('orgAboutUs.vision', vision)
      fd.append('orgAboutUs.mission', mission)
      fd.append('orgAboutUs.orgValues', orgValues)

      fd.append('orgDirectorDetail.directorName', directorName)
      fd.append('orgDirectorDetail.role', directorRole)
      fd.append('orgDirectorDetail.aboutDirector', aboutDirector)

      fd.append('orgAchievement.achivementTitle', achievementTitle)

      if (bannerFile) fd.append('aboutWallpaper', bannerFile)
      if (directorImageFile) fd.append('directorImage', directorImageFile)

      await api.post(ORG_UPDATE_PATH, fd, multipartConfig())
      showSuccessToast('About page updated successfully')
      setBannerFile(null)
      setDirectorImageFile(null)
      await loadDetails()
    } catch (err) {
      console.error(err)
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === 'string' ? err.response.data : null) ??
        err?.message ??
        'Update failed'
      showErrorToast(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleAchievementUpload = async () => {
    if (!selectedImage) {
      showErrorToast('Please select an image')
      return
    }
    if (ctxMode) {
      const next = Array.isArray(files?.achievementImages) ? [...files.achievementImages] : []
      next.push(selectedImage)
      // Frontend layout uploads these on the single top "Update" button.
      ctx?.setFiles?.((prev) => ({ ...prev, achievementImages: next }))
      showSuccessToast('Image added (click Update to save)')
      setSelectedImage(null)
      return
    }
    const formData = new FormData()
    formData.append('image', selectedImage)
    try {
      const response = await api.post(ACHIEVEMENT_ADD_PATH, formData, multipartConfig())
      showSuccessToast(typeof response.data === 'string' ? response.data : 'Image uploaded')
      setSelectedImage(null)
      await loadDetails()
    } catch (error) {
      console.error(error)
      showErrorToast(error?.response?.data?.message ?? 'Upload failed')
    }
  }

  const removeAchievementImage = async (imagePath) => {
    if (!imagePath) return
    if (ctxMode) {
      if (!window.confirm('Are you sure you want to delete this image?')) return
      try {
        await api.delete(ACHIEVEMENT_DELETE_PATH, { params: { imagePath } })
        showSuccessToast('Image deleted')
        await ctxFetchAllData?.()
      } catch (error) {
        console.error(error)
        showErrorToast('Failed to delete image')
      }
      return
    }
    if (!window.confirm('Are you sure you want to delete this image?')) return
    try {
      await api.delete(ACHIEVEMENT_DELETE_PATH, { params: { imagePath } })
      setExistingAchievementImages((prev) => prev.filter((img) => img !== imagePath))
      showSuccessToast('Image deleted')
      await loadDetails()
    } catch (error) {
      console.error(error)
      showErrorToast('Failed to delete image')
    }
  }

  useEffect(() => {
    if (!ctxMode) return
    if (!files?.wallpaper) {
      if (bannerPreview?.startsWith?.('blob:')) URL.revokeObjectURL(bannerPreview)
      setBannerPreview(null)
      return
    }
    const u = URL.createObjectURL(files.wallpaper)
    if (bannerPreview?.startsWith?.('blob:')) URL.revokeObjectURL(bannerPreview)
    setBannerPreview(u)
    return () => URL.revokeObjectURL(u)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxMode, files?.wallpaper])

  useEffect(() => {
    if (!ctxMode) return
    if (!files?.directorImage) {
      if (directorImagePreview?.startsWith?.('blob:')) URL.revokeObjectURL(directorImagePreview)
      setDirectorImagePreview(null)
      return
    }
    const u = URL.createObjectURL(files.directorImage)
    if (directorImagePreview?.startsWith?.('blob:')) URL.revokeObjectURL(directorImagePreview)
    setDirectorImagePreview(u)
    return () => URL.revokeObjectURL(u)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxMode, files?.directorImage])

  const getBannerSrc = () => {
    if (ctxMode) {
      if (bannerPreview) return bannerPreview
      if (aboutWallpaperPath) return courseImageUrl(aboutWallpaperPath)
      return null
    }
    if (bannerFile && bannerPreview) return bannerPreview
    return bannerPreview
  }

  const getDirectorImageSrc = () => {
    if (ctxMode) {
      if (directorImagePreview) return directorImagePreview
      if (directorImagePath) return courseImageUrl(directorImagePath)
      return null
    }
    return directorImagePreview
  }

  const splitTitleIntoLines = (title) => {
    if (!title) return { line1: '', line2: '', line3: '' }
    const words = title.split(' ')
    return {
      line1: words.slice(0, 5).join(' '),
      line2: words.slice(5, 10).join(' '),
      line3: words.slice(10).join(' '),
    }
  }

  const { line1, line2, line3 } = splitTitleIntoLines(ctxMode ? ctxAchievementTitle : achievementTitle)

  const handleLeftScroll = () => {
    achRef.current?.scrollBy({ left: -350, behavior: 'smooth' })
  }

  const handleRightScroll = () => {
    achRef.current?.scrollBy({ left: 350, behavior: 'smooth' })
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedImage(file)
    e.target.value = ''
  }

  const renderEditableAchievementHeading = () => (
    <div className="group relative flex min-h-[100px] flex-col items-center justify-center gap-2">
      <div className="relative mx-auto w-full max-w-4xl px-4">
        {isEditingAchievement ? (
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              value={editAchievementValue}
              onChange={(e) => setEditAchievementValue(e.target.value)}
              onBlur={saveAchievementHeading}
              onKeyDown={handleAchievementKeyDown}
              className="w-full rounded-xl border-2 border-orange-500 bg-white px-4 py-3 text-center text-xl text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:text-2xl md:text-3xl"
              placeholder="Enter achievement heading..."
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <div className="mx-auto mt-2 w-[70%]">
              <p className="text-3xl font-[24px] leading-tight text-[#FB923C] sm:text-4xl">{line1}</p>
              <p className="mt-1 text-3xl font-[24px] text-[#FB923C] sm:text-4xl">{line2}</p>
              <p className="text-lg text-[#EA580C] sm:text-6xl">
                <span className="font-bold">{line3}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditAchievementValue(ctxMode ? ctxAchievementTitle : achievementTitle)
                setIsEditingAchievement(true)
              }}
              className="rounded-lg bg-gray-100 p-2 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100"
              title="Edit heading"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const achievementSlot = (
    <div className="relative h-[400px] w-[300px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-md">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      <div onClick={() => fileInputRef.current?.click()} className="h-full w-full cursor-pointer">
        {achievementPreviewUrl ? (
          <img src={achievementPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-orange-100">
            <ImagePlus className="h-20 w-20 text-orange-600" />
          </div>
        )}
      </div>
      {selectedImage && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-2 top-2 rounded bg-black/50 px-2 py-1 text-xs text-white"
          >
            Change
          </button>
          <div className="absolute bottom-0 left-0 w-full bg-black/50 p-4">
            <button
              type="button"
              onClick={handleAchievementUpload}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-3 text-white transition hover:bg-orange-700"
            >
              <Upload className="h-5 w-5" />
              Upload Image
            </button>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div
      className={
        ctxMode
          ? 'min-h-0 bg-white text-gray-900'
          : '-mx-6 -mb-6 min-h-0 bg-white text-gray-900'
      }
    >
      {ctxMode ? null : (
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm text-slate-600">About Us</h2>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving || loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      )}

      {(ctxMode ? ctxIsLoading : loading) ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading…
        </div>
      ) : null}

      {!(ctxMode ? ctxIsLoading : loading) && (
        <div className="min-h-screen bg-white">
          <div className="relative mb-12 w-full">
            <div className="relative w-full overflow-hidden bg-black">
              {getBannerSrc() ? (
                <div className="relative h-[400px] w-full">
                  <img src={getBannerSrc()} alt="About Banner" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute right-4 top-4 z-20">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(true)}
                      className="flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700"
                      title="Change banner"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-sm">Change</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative flex h-[400px] w-full flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="mb-4 text-center">
                    <Upload className="mx-auto mb-4 h-20 w-20 text-gray-400" />
                    <h3 className="mb-2 text-xl font-semibold text-gray-700">No About Banner Uploaded</h3>
                    <p className="mb-4 text-gray-500">Upload a banner image for the about section</p>
                  </div>
                  <div className="absolute bottom-6 right-6">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(true)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-black shadow-md transition hover:shadow-lg"
                    >
                      <Upload className="h-5 w-5 text-black" />
                      <span className="font-medium">Upload About Banner</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <AboutCard
                number="1"
                title="Our Vision"
                value={ctxMode ? formData?.orgAboutUs?.vision ?? '' : vision}
                onChange={(e) =>
                  ctxMode ? setCtxField('orgAboutUs.vision', e.target.value) : setVision(e.target.value)
                }
              />
              <AboutCard
                number="2"
                title="Our Mission"
                value={ctxMode ? formData?.orgAboutUs?.mission ?? '' : mission}
                onChange={(e) =>
                  ctxMode ? setCtxField('orgAboutUs.mission', e.target.value) : setMission(e.target.value)
                }
              />
              <AboutCard
                number="3"
                title="Our Values"
                value={ctxMode ? formData?.orgAboutUs?.orgValues ?? '' : orgValues}
                onChange={(e) =>
                  ctxMode ? setCtxField('orgAboutUs.orgValues', e.target.value) : setOrgValues(e.target.value)
                }
              />
            </div>
          </div>

          <hr className="my-10 h-1 w-full rounded-full bg-black" />

          <div className="px-4 text-center">
            <h1 className="mb-8 text-4xl font-bold sm:text-5xl md:text-7xl">
              Our <span className="text-orange-500">Director</span>
            </h1>

            <div className="mx-auto w-full max-w-md">
              <div className="mx-auto h-48 w-48 overflow-hidden rounded-full border-4 border-orange-500 shadow-lg shadow-orange-400 md:h-64 md:w-64">
                {getDirectorImageSrc() ? (
                  <img src={getDirectorImageSrc()} alt="Director" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                )}
              </div>

              <div className="mt-7 space-y-4 text-left">
                <Input
                  label="Director Name"
                  value={ctxMode ? formData?.orgDirectorDetail?.directorName ?? '' : directorName}
                  onChange={(e) =>
                    ctxMode
                      ? setCtxField('orgDirectorDetail.directorName', e.target.value)
                      : setDirectorName(e.target.value)
                  }
                />
                <Input
                  label="Director Role"
                  value={ctxMode ? formData?.orgDirectorDetail?.role ?? '' : directorRole}
                  onChange={(e) =>
                    ctxMode
                      ? setCtxField('orgDirectorDetail.role', e.target.value)
                      : setDirectorRole(e.target.value)
                  }
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Upload Director Image</label>
                  <input
                    type="file"
                    name="directorImage"
                    accept="image/*"
                    onChange={handleDirectorImageUpload}
                    className="w-full rounded-xl border-2 border-gray-300 p-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-center text-4xl sm:text-5xl md:text-6xl">About The Director</h2>

            <div className="mx-auto mt-6 max-w-4xl">
              <textarea
                value={ctxMode ? formData?.orgDirectorDetail?.aboutDirector ?? '' : aboutDirector}
                onChange={(e) =>
                  ctxMode
                    ? setCtxField('orgDirectorDetail.aboutDirector', e.target.value)
                    : setAboutDirector(e.target.value)
                }
                rows={10}
                placeholder="Write director details..."
                className="w-full rounded-2xl border-2 border-gray-300 p-4 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <hr className="my-2 mt-12 h-1 w-full rounded-full bg-black" />

          <div className="relative mt-10 pb-16 text-center">
            {renderEditableAchievementHeading()}

            {(ctxMode ? ctxAchievementImages.length > 0 : existingAchievementImages.length > 0) || selectedImage ? (
              <div className="relative mx-auto mt-10 w-full md:w-[90%]">
                <button
                  type="button"
                  className="absolute left-0 top-1/2 z-10 hidden -translate-x-2 -translate-y-1/2 rounded-full border-2 border-orange-500 bg-gray-800 px-2 py-1 text-2xl text-white hover:bg-gray-700 md:left-[-12px] md:flex"
                  onClick={handleLeftScroll}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <div
                  ref={achRef}
                  style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                  className="mx-auto mt-10 flex w-full space-x-10 overflow-x-auto whitespace-nowrap py-4 md:w-[80%]"
                >
                  {achievementSlot}
                  {[...(ctxMode ? ctxAchievementImages : existingAchievementImages)].reverse().map((img, i) => (
                    <div key={`existing-${img}-${i}`} className="relative flex-shrink-0">
                      <img
                        className="h-[400px] w-[300px] rounded-md border object-cover"
                        src={courseImageUrl(img)}
                        alt={`Achievement ${i}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeAchievementImage(img)}
                        className="absolute -right-2 -top-2 rounded-full bg-white p-2 text-red-500 hover:text-red-600"
                        aria-label="Delete image"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-2 rounded-full border-2 border-orange-500 bg-gray-800 px-2 py-1 text-2xl text-white hover:bg-gray-700 md:right-[-12px] md:flex"
                  onClick={handleRightScroll}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="mx-auto mt-10 w-full py-12 md:w-[90%]">
                <div className="mx-auto flex max-w-[300px] justify-center">{achievementSlot}</div>
              </div>
            )}
          </div>

          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowUploadModal(false)}
                aria-hidden
              />
              <div className="relative flex gap-8 rounded-xl bg-white p-8 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setCustomTemplateOpen(true)
                    setShowUploadModal(false)
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded border p-6 text-gray-800 transition hover:shadow-md"
                >
                  <Upload className="mb-2 h-6 w-6" />
                  <p>Upload from Custom Templates</p>
                </button>
                <div className="rounded border p-6 text-gray-800">
                  <label
                    htmlFor="about-banner-local-upload"
                    className="flex cursor-pointer flex-col items-center gap-2"
                  >
                    <Upload className="h-6 w-6" />
                    <span>Upload from your System</span>
                  </label>
                </div>
                <input
                  id="about-banner-local-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {customTemplateOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setCustomTemplateOpen(false)}
                aria-hidden
              />
              <div className="relative max-h-[90vh] w-[95%] max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                  type="button"
                  onClick={() => setCustomTemplateOpen(false)}
                  className="absolute right-4 top-4 z-20 rounded-full bg-red-500 p-2 shadow-lg hover:bg-red-600"
                  aria-label="Close"
                >
                  ✕
                </button>
                <div className="h-full max-h-[90vh] overflow-y-auto">
                  <AboutTemplates onImageSelect={handleTemplateImageSelect} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  )
}

function AboutCard({ number, title, value, onChange }) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-orange-500 text-4xl font-bold text-white">
        {number}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-orange-500">{title}</h3>
      <textarea
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full rounded-xl border-2 border-gray-300 p-3 outline-none focus:ring-2 focus:ring-orange-500"
        placeholder={`Enter ${title.toLowerCase()}...`}
      />
    </div>
  )
}
