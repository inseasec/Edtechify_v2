import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/lib/api'
import { getUserRole } from '@/utils/auth'
import { toggleHrApplicant } from '@/store/applicantsSlice'
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils'

export default function ApplicantDetails() {
  const navigate = useNavigate()
  const { applicantId } = useParams()
  const location = useLocation()
  const dispatch = useDispatch()

  const role = getUserRole()
  const isHR = role === 'HR'

  const { loading: hrLoading } = useSelector((state) => state.applicants)

  const [applicant, setApplicant] = useState(location.state?.applicant || null)
  const [loading, setLoading] = useState(false)

  /* ================= FETCH ================= */
  const fetchApplicant = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/careers/getApplicantById/${applicantId}`)
      setApplicant(res.data)
    } catch (err) {
      console.error(err)
      showErrorToast('Failed to fetch applicant data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!applicant && applicantId) fetchApplicant()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId])

  /* ================= RESUME ================= */
  const getResumeUrl = () => {
    if (!applicant?.resume) return null
    // Backend returns relative path like "Careers/<file>.pdf" and serves it from `upload/` (static-locations=file:upload/).
    const p = String(applicant.resume).replace(/^\//, '')
    return `${api.defaults.baseURL}/${p}`
  }

  const openResumePdf = () => {
    const url = getResumeUrl()
    if (!url) return alert('Resume not available')
    window.open(url, '_blank')
  }

  /* ================= NAVIGATION ================= */
  const goBackToList = () => {
    navigate(-1)
  }

  /* ================= STATUS ACTIONS ================= */
  const updateStatus = async (status) => {
    try {
      setLoading(true)
      await api.put(`/careers/updateByStatus/${applicantId}/${status}`)
      showSuccessToast(`Applicant ${String(status).toLowerCase()} successfully`)
      goBackToList()
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  /* ================= HR ADD ================= */
  const handleHrAdd = () => {
    if (!applicant || hrLoading) return

    dispatch(
      toggleHrApplicant({
        id: applicant.id,
        checked: true,
      }),
    )
      .unwrap()
      .then(() => {
        showSuccessToast('Applicant added successfully')
        goBackToList()
      })
      .catch((error) => {
        showErrorToast(error?.message || 'Failed to add applicant')
      })
  }

  /* ================= UI ================= */
  if (loading) return <p className="p-6 text-center">Loading...</p>
  if (!applicant) return <p className="p-6 text-center">No Applicant Found</p>

  return (
    <div className="mx-auto mt-8 w-[95%] max-w-6xl pb-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applicant Details</h1>
          <p className="text-gray-600">View complete instructor application</p>
        </div>
        <button
          onClick={goBackToList}
          className="rounded-lg bg-black px-5 py-2 text-white hover:opacity-90"
        >
          Back
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mb-8 flex flex-wrap gap-3">
        {!isHR && (
          <>
            {applicant.status !== 'SHORTLISTED' && location.state?.from !== 'REVIEW' && (
              <ActionBtn color="#ec8536" onClick={() => updateStatus('SHORTLISTED')}>
                Shortlist
              </ActionBtn>
            )}
            {location.state?.from !== 'REVIEW' && (
              <ActionBtn color="#5cbd48" onClick={() => updateStatus('REVIEW')}>
                Process
              </ActionBtn>
            )}
            {location.state?.from === 'REVIEW' && (
              <ActionBtn color="#5cbd48" onClick={() => updateStatus('SELECTED')}>
                Select
              </ActionBtn>
            )}
            <ActionBtn color="#d23b3b" onClick={() => updateStatus('ARCHIVED')}>
              Reject
            </ActionBtn>
          </>
        )}

        {isHR && (
          <ActionBtn color="#2563eb" onClick={handleHrAdd} disabled={hrLoading}>
            {hrLoading ? 'Adding...' : '+ ADD'}
          </ActionBtn>
        )}
      </div>

      {/* DETAILS */}
      <div className="space-y-8 rounded-2xl border bg-white p-8 shadow-lg">
        <SectionTitle title="Basic Information" />
        <Grid>
          <Field label="Applicant ID" value={applicant.id} />
          <Field label="Full Name" value={applicant.fullName} />
          <Field label="Email" value={applicant.email} />
          <Field label="Phone" value={applicant.phone} />
          <Field label="Marital Status" value={applicant.maritalStatus} />
          <Field label="State" value={applicant.state} />
          <Field label="City" value={applicant.city} />
        </Grid>

        <SectionTitle title="Professional Details" />
        <Grid>
          <Field label="Qualification" value={applicant.qualification} />
          <Field label="Experience Level" value={applicant.experienceLevel} />
          <Field label="Subjects" value={applicant.subjects} />
          <Field label="Role" value={applicant.roleType} />
          <Field label="Current Salary" value={applicant.currentSalary} />
          <Field label="Expected Salary" value={applicant.expectedSalary} />
        </Grid>

        <SectionTitle title="Resume" />
        <button onClick={openResumePdf} className="rounded-lg bg-black px-4 py-2 text-white">
          Open Resume
        </button>

        {applicant.video && (
          <>
            <SectionTitle title="Intro Video" />
            <video
              src={`${api.defaults.baseURL}/${String(applicant.video).replace(/^\//, '')}`}
              controls
              className="w-full max-h-[450px] rounded-xl bg-black"
            />
          </>
        )}

        {applicant?.introVideoUrl && (
          <>
            <SectionTitle title="Intro Video" />
            <div className="mt-4">
              <video src={applicant.introVideoUrl} controls className="w-full rounded-xl border" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ================= UI HELPERS ================= */
const SectionTitle = ({ title }) => <h2 className="border-b pb-2 text-xl font-semibold">{title}</h2>

const Grid = ({ children }) => <div className="grid gap-6 md:grid-cols-2">{children}</div>

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input readOnly value={value || '-'} className="rounded-lg border bg-gray-50 px-3 py-2" />
  </div>
)

const ActionBtn = ({ children, color, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ backgroundColor: color }}
    className="rounded-lg px-5 py-2 text-sm text-white disabled:opacity-60"
  >
    {children}
  </button>
)

