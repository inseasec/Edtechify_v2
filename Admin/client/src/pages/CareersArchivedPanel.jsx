import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApplicantFilters from '@/Components/ApplicantFilters'
import { useApplicantFilters } from '@/hooks/useApplicantFilters'
import api from '@/lib/api'
import { CAREERS_PATHS } from '@/lib/careersApi'
import {
  uniqueApplyingFor,
  uniqueFieldValues,
} from '@/lib/careersApplicantFilters'
import { getUserRole } from '@/utils/auth'
import { showErrorToast } from '@/utils/toastUtils'
import { CAREER_SECTIONS } from './careersSections'
import { useAdminBasePath } from '@/hooks/useAdminBasePath'

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

function normalizeArchivedPayload(resData) {
  const raw = resData?.data ?? resData
  return Array.isArray(raw) ? raw : []
}

export default function CareersArchivedPanel() {
  const navigate = useNavigate()
  const base = useAdminBasePath()
  const { title, description } = CAREER_SECTIONS.archived
  const isHR = getUserRole() === 'HR'

  const [allApplicants, setAllApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const loadArchived = useCallback(async () => {
    try {
      setLoading(true)
      setFetchError('')
      const res = await api.get(CAREERS_PATHS.getAllArchived)
      const rows = normalizeArchivedPayload(res.data)
      const sorted = [...rows].sort((a, b) => {
        const ta = new Date(a.updatedAt ?? a.createdAt ?? a.applicationDate ?? 0).getTime()
        const tb = new Date(b.updatedAt ?? b.createdAt ?? b.applicationDate ?? 0).getTime()
        return tb - ta
      })
      setAllApplicants(sorted)
    } catch (err) {
      console.error(err)
      setFetchError('Failed to load archived applicants')
      showErrorToast('Failed to load archived applicants')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArchived()
  }, [loadArchived])

  const {
    paginatedApplicants,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredApplicants,
    filters,
    setters,
    resetFilters,
    helpers,
    nameSortOrder,
    setNameSortOrder,
  } = useApplicantFilters(allApplicants, ITEMS_PER_PAGE, null)

  const { calculateAge, normalizeSalary, formatSalary } = helpers

  const cities = useMemo(() => {
    const u = uniqueFieldValues(allApplicants, 'city')
    return u.length ? u : FALLBACK_CITIES
  }, [allApplicants])

  const states = useMemo(() => {
    const u = uniqueFieldValues(allApplicants, 'state')
    return u.length ? u : FALLBACK_STATES
  }, [allApplicants])

  const teachingRoles = useMemo(() => {
    const u = uniqueApplyingFor(allApplicants, 'TECH')
    return u.length ? u : FALLBACK_TEACHING
  }, [allApplicants])

  const nonTeachingRoles = useMemo(() => {
    const u = uniqueApplyingFor(allApplicants, 'NON_TECH')
    return u.length ? u : FALLBACK_NON_TEACHING
  }, [allApplicants])

  const openApplicant = (row) => {
    navigate(`${base}/careers/applicant/${row.id}`, { state: { applicant: row, from: 'ARCHIVED' } })
  }

  const statusLabel = (row) => {
    const s = row.status
    if (s != null && String(s).trim() !== '') return String(s)
    return 'Archived'
  }

  return (
    <div className="w-full space-y-4 text-left">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
      </div>

      {loading && (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          Loading archived applicants…
        </p>
      )}

      {fetchError && !loading && <p className="text-sm text-red-600">{fetchError}</p>}

      {!loading && !fetchError && (
        <>
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

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">Archived</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-600">
                  <tr>
                    <th className="px-2 py-2 font-medium">Name</th>
                    <th className="px-2 py-2 font-medium">Email</th>
                    <th className="px-2 py-2 font-medium">City</th>
                    <th className="px-2 py-2 font-medium">State</th>
                    <th className="px-2 py-2 font-medium">Age</th>
                    <th className="px-2 py-2 font-medium">Gender</th>
                    <th className="px-2 py-2 font-medium">Experience</th>
                    <th className="px-2 py-2 font-medium">Current salary</th>
                    <th className="px-2 py-2 font-medium">Expected salary</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplicants.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        No archived applicants match these filters, or the list is empty.
                      </td>
                    </tr>
                  )}
                  {paginatedApplicants.map((a) => (
                    <tr
                      key={a.id ?? a.email}
                      className="cursor-pointer border-b border-slate-50 hover:bg-slate-50/50"
                      onClick={() => openApplicant(a)}
                    >
                      <td className="px-2 py-2 font-medium text-slate-900">{a.fullName ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{a.email ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{a.city ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{a.state ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{calculateAge(a.dob) ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{a.gender ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{a.experienceLevel ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">
                        {formatSalary(normalizeSalary(a.currentSalary))}
                      </td>
                      <td className="px-2 py-2 text-slate-600">
                        {formatSalary(normalizeSalary(a.expectedSalary))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
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
        </>
      )}
    </div>
  )
}
