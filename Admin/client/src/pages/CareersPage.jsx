import { useParams } from 'react-router-dom'
import CareersAppliedPanel from './CareersAppliedPanel'
import CareersArchivedPanel from './CareersArchivedPanel'
import CareersHrApplicantsPanel from './CareersHrApplicantsPanel'
import CareersReviewPanel from './CareersReviewPanel'
import CareersSettingsPanel from './CareersSettingsPanel'
import CareersSelectedPanel from './CareersSelectedPanel'
import CareersShortlistedPanel from './CareersShortlistedPanel'
import { CAREER_SECTIONS } from './careersSections'

export default function CareersPage() {
  const { section } = useParams()

  if (section === 'applied') {
    return <CareersAppliedPanel />
  }

  if (section === 'shortlisted') {
    return <CareersShortlistedPanel />
  }

  if (section === 'under-review') {
    return <CareersReviewPanel />
  }

  if (section === 'selected') {
    return <CareersSelectedPanel />
  }

  if (section === 'archived') {
    return <CareersArchivedPanel />
  }

  if (section === 'hr-applicants') {
    return <CareersHrApplicantsPanel />
  }

  if (section === 'settings') {
    return <CareersSettingsPanel />
  }

  if (section && section in CAREER_SECTIONS) {
    const { title, description } = CAREER_SECTIONS[section]
    return (
      <div className="max-w-5xl text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-600">{description}</p>
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-12 text-center text-sm text-slate-500">
          Applicant list and actions for this stage will connect to your careers API here.
        </div>
      </div>
    )
  }

  if (section) {
    return (
      <div className="max-w-3xl text-left">
        <h1 className="text-2xl font-semibold text-slate-900">Not found</h1>
        <p className="mt-2 text-slate-600">This careers section does not exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl text-left">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Career</h1>
      <p className="mt-2 text-slate-600">
        Manage job postings, applicant pipelines, and hiring stages. Use the sidebar to open Applied,
        Shortlisted, Under Review, Selected, Archived, HR Applicants, or Settings.
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
        Overview dashboard — hook up jobs list, metrics, and quick links when ready.
      </div>
    </div>
  )
}
