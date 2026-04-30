import { Link, useLocation, useParams } from 'react-router-dom'
import { PIPELINE_STAGE } from '@/lib/careersApi'
import { useAdminBasePath } from '@/hooks/useAdminBasePath'

/** Map `from` on location.state to careers URL segment (sidebar). */
function sectionPathFromFrom(from) {
  const map = {
    applied: 'applied',
    shortlisted: 'shortlisted',
    'under-review': 'under-review',
    selected: 'selected',
    archived: 'archived',
    'hr-applicants': 'hr-applicants',
  }
  return map[from] ?? 'shortlisted'
}

/** Map pipeline status (videos screen) back to a sensible careers tab. */
function sectionPathFromStatus(status) {
  const m = {
    [PIPELINE_STAGE.applied]: 'applied',
    [PIPELINE_STAGE.shortlisted]: 'shortlisted',
    [PIPELINE_STAGE.underReview]: 'under-review',
    [PIPELINE_STAGE.selected]: 'selected',
    [PIPELINE_STAGE.archived]: 'archived',
    [PIPELINE_STAGE.hrApplicants]: 'hr-applicants',
  }
  return m[status] ?? null
}

/** Placeholder until a video grid is wired to the careers API. */
export function CareersVideosPlaceholder() {
  const base = useAdminBasePath()
  const location = useLocation()
  const status = location.state?.status
  const backSeg = sectionPathFromStatus(status)
  const backTo = backSeg ? `${base}/careers/${backSeg}` : `${base}/careers`

  return (
    <div className="max-w-3xl text-left">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Video view</h1>
      <p className="mt-2 text-slate-600">
        Pipeline filter: <span className="font-mono text-slate-800">{status ?? '—'}</span>
      </p>
      <p className="mt-4 text-sm text-slate-500">
        Connect this route to your video applicants UI when the backend is ready.
      </p>
      <Link to={backTo} className="mt-6 inline-block text-orange-600 hover:underline">
        ← Back to careers
      </Link>
    </div>
  )
}

/** Placeholder detail view; full profile can reuse shared applicant components later. */
export function CareersApplicantDetailPlaceholder() {
  const base = useAdminBasePath()
  const { applicantId } = useParams()
  const location = useLocation()
  const row = location.state

  const from = row?.from
  const segment = sectionPathFromFrom(from)
  const backTo = `${base}/careers/${segment}`
  const backState =
    (from === 'under-review' || from === 'shortlisted') && row?.page != null
      ? { page: row.page }
      : undefined

  return (
    <div className="max-w-3xl text-left">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Applicant</h1>
      <p className="mt-2 text-slate-600">
        ID: <span className="font-mono text-slate-800">{applicantId}</span>
      </p>
      {row?.fullName && (
        <p className="mt-2 text-slate-700">
          Name: <span className="font-medium">{row.fullName}</span>
        </p>
      )}
      <Link
        to={backTo}
        state={backState}
        className="mt-6 inline-block text-orange-600 hover:underline"
      >
        ← Back
      </Link>
    </div>
  )
}
