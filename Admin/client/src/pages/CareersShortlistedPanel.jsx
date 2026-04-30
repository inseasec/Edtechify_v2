import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import ApplicantFilters from '@/Components/ApplicantFilters'
import { useApplicantFilters } from '@/hooks/useApplicantFilters'
import { PIPELINE_STAGE } from '@/lib/careersApi'
import {
  uniqueApplyingFor,
  uniqueFieldValues,
} from '@/lib/careersApplicantFilters'
import {
  clearApplicantsError,
  fetchApplicantsByStatus,
} from '@/store/applicantsSlice'
import { getUserRole } from '@/utils/auth'
import { showErrorToast } from '@/utils/toastUtils'
import { CAREER_SECTIONS } from './careersSections'
import { useAdminBasePath } from '@/hooks/useAdminBasePath'
import { LayoutGrid } from 'lucide-react'

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

/** Move from Shortlisted to Under Review */
// Processing happens on the applicant detail page.

export default function CareersShortlistedPanel() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const base = useAdminBasePath()
  const { title, description } = CAREER_SECTIONS.shortlisted
  const isHR = getUserRole() === 'HR'

  const initialPage = Math.max(1, Number(location.state?.page) || 1)

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
    helpers,
    nameSortOrder,
    setNameSortOrder,
  } = useApplicantFilters(sortedApplicants, ITEMS_PER_PAGE, PIPELINE_STAGE.shortlisted, {
    initialPage,
  })

  const { calculateAge, normalizeSalary, formatSalary } = helpers

  useEffect(() => {
    dispatch(fetchApplicantsByStatus(PIPELINE_STAGE.shortlisted))
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

  const openApplicant = (item) => {
    navigate(`${base}/careers/applicant/${item.id}`, {
      state: { applicant: item, from: 'SHORTLISTED', page: currentPage },
    })
  }

  return (
    <div className="w-full space-y-4 text-left">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate(`${base}/careers/videos`, { state: { status: PIPELINE_STAGE.shortlisted } })
          }
          title="Video view"
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LayoutGrid className="h-8 w-8" aria-hidden />
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading applicants…</p>}

      {!loading && (
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
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">Shortlisted</span>
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
                    <th className="px-2 py-2 font-medium">Current salary</th>
                    <th className="px-2 py-2 font-medium">Expected salary</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplicants.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        No applicants match these filters, or the list is empty.
                      </td>
                    </tr>
                  )}
                  {paginatedApplicants.map((item) => (
                    <tr
                      key={item.id}
                      className="cursor-pointer border-b border-slate-50 hover:bg-slate-50/50"
                      onClick={() => openApplicant(item)}
                    >
                      <td className="px-2 py-2 font-medium text-slate-900">{item.fullName ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{item.email ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{item.city ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{item.state ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{calculateAge(item.dob) ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{item.gender ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">{item.experienceLevel ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-600">
                        {formatSalary(normalizeSalary(item.currentSalary))}
                      </td>
                      <td className="px-2 py-2 text-slate-600">
                        {formatSalary(normalizeSalary(item.expectedSalary))}
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
