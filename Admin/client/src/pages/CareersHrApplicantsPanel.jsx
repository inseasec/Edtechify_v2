import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ApplicantFilters from '@/Components/ApplicantFilters'
import { useApplicantFilters } from '@/hooks/useApplicantFilters'
import {
  clearApplicantsError,
  fetchApplicantsByStatus,
} from '@/store/applicantsSlice'
import { getUserRole } from '@/utils/auth'
import { showErrorToast } from '@/utils/toastUtils'
import { CAREER_SECTIONS } from './careersSections'
import { useAdminBasePath } from '@/hooks/useAdminBasePath'
import {
  parseLpaString,
  uniqueApplyingFor,
  uniqueFieldValues,
} from '@/lib/careersApplicantFilters'
import { PIPELINE_STAGE } from '@/lib/careersApi'

const ITEMS_PER_PAGE = 20

const FALLBACK_CITIES = ['Gurgaon', 'Mohali', 'Bangalore', 'Hyderabad', 'Pune']
const FALLBACK_STATES = ['Haryana', 'Punjab', 'Karnataka', 'Telangana', 'Maharashtra']
const FALLBACK_TEACHING = ['Mathematics', 'Physics', 'English', 'Computer Science']
const FALLBACK_NON_TEACHING = ['Admin', 'HR', 'Operations', 'Counsellor']

const FALLBACK_AGE_RANGES = [
  { value: '18-25', label: '18–25' },
  { value: '26-35', label: '26–35' },
  { value: '36-45', label: '36–45' },
  { value: '46+', label: '46+' },
]

const baseUrl = window._CONFIG_.VITE_API_BASE_URL;

function fileHref(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return ''
  const p = relativePath.replace(/^\//, '')
  return `${baseUrl}/${p}`
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function calculateAge(dobStr) {
  if (dobStr == null || dobStr === '') return null
  const d = new Date(dobStr)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1
  return age
}

function formatSalary(s) {
  const n = parseLpaString(s)
  if (n == null || Number.isNaN(n)) return '—'
  return `${n} LPA`
}

export default function CareersHrApplicantsPanel() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const base = useAdminBasePath()
  const { title, description } = CAREER_SECTIONS['hr-applicants']
  const isHR = getUserRole() === 'HR'

  const { list: allApplicants, loading, error } = useSelector((s) => s.applicants)

  const sortedApplicants = useMemo(() => {
    return [...allApplicants].sort((a, b) => {
      const ad = a.applicationDate ?? a.createdAt
      const bd = b.applicationDate ?? b.createdAt
      if (ad && bd) return new Date(bd) - new Date(ad)
      return (b.id ?? 0) - (a.id ?? 0)
    })
  }, [allApplicants])

  const {
    paginatedApplicants,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredApplicants,
    filters,
    setters,
    resetFilters,
    nameSortOrder,
    setNameSortOrder,
  } = useApplicantFilters(sortedApplicants, ITEMS_PER_PAGE, PIPELINE_STAGE.hrApplicants)

  useEffect(() => {
    dispatch(fetchApplicantsByStatus(PIPELINE_STAGE.hrApplicants))
  }, [dispatch])

  useEffect(() => {
    if (!error) return
    showErrorToast(error)
    dispatch(clearApplicantsError())
  }, [error, dispatch])

  const cities = useMemo(() => {
    const u = uniqueFieldValues(sortedApplicants, 'city')
    return u.length ? u : FALLBACK_CITIES
  }, [sortedApplicants])

  const states = useMemo(() => {
    const u = uniqueFieldValues(sortedApplicants, 'state')
    return u.length ? u : FALLBACK_STATES
  }, [sortedApplicants])

  const teachingRoles = useMemo(() => {
    const u = uniqueApplyingFor(sortedApplicants, 'TECH')
    return u.length ? u : FALLBACK_TEACHING
  }, [sortedApplicants])

  const nonTeachingRoles = useMemo(() => {
    const u = uniqueApplyingFor(sortedApplicants, 'NON_TECH')
    return u.length ? u : FALLBACK_NON_TEACHING
  }, [sortedApplicants])

  const applicantKey = (row, i) => row.id ?? row.email ?? i

  const openApplicant = (row) => {
    navigate(`${base}/careers/applicant/${row.id}`, { state: { applicant: row, from: 'HR' } })
  }

  return (
    <div className="w-full space-y-4 text-left">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
      </div>

      {!loading && (
        <ApplicantFilters
          total={filteredApplicants.length}
          cities={cities}
          states={states}
          teachingRoles={teachingRoles}
          nonTeachingRoles={nonTeachingRoles}
          ageRanges={FALLBACK_AGE_RANGES}
          filters={filters}
          setters={setters}
          resetFilters={resetFilters}
          isHR={isHR}
          nameSortOrder={nameSortOrder}
          setNameSortOrder={setNameSortOrder}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <span className="text-sm font-medium text-slate-700">HR applicants</span>
          {loading && <span className="text-xs text-slate-500">Loading…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">Name</th>
                <th className="px-2 py-2 font-medium">Email</th>
                <th className="px-2 py-2 font-medium">City</th>
                <th className="px-2 py-2 font-medium">State</th>
                <th className="px-2 py-2 font-medium">Age</th>
                <th className="px-2 py-2 font-medium">Gender</th>
                <th className="px-2 py-2 font-medium">Experience</th>
                <th className="px-2 py-2 font-medium">Current Salary</th>
                <th className="px-2 py-2 font-medium">Expected</th>
              </tr>
            </thead>
            <tbody>
              {!loading && paginatedApplicants.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No applicants match these filters, or the list is empty.
                  </td>
                </tr>
              )}
              {paginatedApplicants.map((row, i) => (
                <tr
                  key={applicantKey(row, i)}
                  className="cursor-pointer border-b border-slate-50 hover:bg-slate-50/50"
                  onClick={() => openApplicant(row)}
                >
                  <td className="px-2 py-2 font-medium text-slate-900">{row.fullName ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-600">{row.email ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-600">{row.city ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-600">{row.state ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-600">{calculateAge(row.dob) ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-600">{row.gender ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-600">{row.experienceLevel ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-600">{formatSalary(row.currentSalary)}</td>
                  <td className="px-2 py-2 text-slate-600">{formatSalary(row.expectedSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i + 1)}
              className={`rounded border px-3 py-1 text-sm ${
                currentPage === i + 1 ? 'border-slate-400 bg-slate-100' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
