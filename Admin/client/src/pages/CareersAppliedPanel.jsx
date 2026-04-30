import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ApplicantFilters from '@/Components/ApplicantFilters'
import {
  applyApplicantFilters,
  parseLpaString,
  uniqueApplyingFor,
  uniqueFieldValues,
} from '@/lib/careersApplicantFilters'
import api from '@/lib/api'
import { CAREERS_PATHS, PIPELINE_STAGE } from '@/lib/careersApi'
import {
  clearApplicantsError,
  fetchAllApplicants,
  toggleHrApplicant,
} from '@/store/applicantsSlice'
import { getUserRole } from '@/utils/auth'
import { showErrorToast, showSuccessToast } from '@/utils/toastUtils'
import { CAREER_SECTIONS } from './careersSections'

const INITIAL_FILTERS = {
  currentSalaryFilter: '',
  expectedSalaryFilter: '',
  cityFilter: '',
  stateFilter: '',
  ageFilter: '',
  roleTypeFilter: '',
  roleFilter: '',
  genderFilter: '',
  experienceFilter: '',
  dateFilterType: '',
  dateFilterYear: '',
  customFromDate: '',
  customToDate: '',
  search: '',
}

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
const HR_STATUS_STORAGE_KEY = 'hr_applicant_status'

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

export default function CareersAppliedPanel() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { title, description } = CAREER_SECTIONS.applied
  const isHR = getUserRole() === 'HR'

  const allApplicants = useSelector((s) => s.applicants.list)
  const listLoading = useSelector((s) => s.applicants.loading)
  const applicantsError = useSelector((s) => s.applicants.error)
  const hrAddedIds = useSelector((s) => s.applicants.hrAddedIds)

  const [localHrStatus, setLocalHrStatus] = useState({})
  const [hrApplicants, setHrApplicants] = useState([])

  const [filters, setFilters] = useState(() => ({ ...INITIAL_FILTERS }))
  const [nameSortOrder, setNameSortOrder] = useState('')

  const setters = useMemo(
    () => ({
      setCurrentSalaryFilter: (v) => setFilters((f) => ({ ...f, currentSalaryFilter: v })),
      setExpectedSalaryFilter: (v) => setFilters((f) => ({ ...f, expectedSalaryFilter: v })),
      setCityFilter: (v) => setFilters((f) => ({ ...f, cityFilter: v })),
      setStateFilter: (v) => setFilters((f) => ({ ...f, stateFilter: v })),
      setAgeFilter: (v) => setFilters((f) => ({ ...f, ageFilter: v })),
      setRoleTypeFilter: (v) => setFilters((f) => ({ ...f, roleTypeFilter: v })),
      setRoleFilter: (v) => setFilters((f) => ({ ...f, roleFilter: v })),
      setGenderFilter: (v) => setFilters((f) => ({ ...f, genderFilter: v })),
      setExperienceFilter: (v) => setFilters((f) => ({ ...f, experienceFilter: v })),
      setDateFilterType: (v) => setFilters((f) => ({ ...f, dateFilterType: v })),
      setDateFilterYear: (v) => setFilters((f) => ({ ...f, dateFilterYear: v })),
      setCustomFromDate: (v) => setFilters((f) => ({ ...f, customFromDate: v })),
      setCustomToDate: (v) => setFilters((f) => ({ ...f, customToDate: v })),
      setSearch: (v) => setFilters((f) => ({ ...f, search: v })),
    }),
    [],
  )

  const resetFilters = useCallback(() => {
    setFilters({ ...INITIAL_FILTERS })
    setNameSortOrder('')
  }, [])

  useEffect(() => {
    dispatch(fetchAllApplicants())

    const saved = localStorage.getItem(HR_STATUS_STORAGE_KEY)
    if (saved) {
      try {
        setLocalHrStatus(JSON.parse(saved))
      } catch {
        setLocalHrStatus({})
      }
    }

    const fetchHrApplicants = async () => {
      try {
        const { data } = await api.get(CAREERS_PATHS.getAllOfHr)
        const safe = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
        setHrApplicants(safe)
      } catch (err) {
        console.error('Failed to fetch HR applicants', err)
      }
    }

    fetchHrApplicants()
  }, [dispatch])

  useEffect(() => {
    if (!applicantsError) return
    showErrorToast(applicantsError)
    dispatch(clearApplicantsError())
  }, [applicantsError, dispatch])

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

  const filteredApplicants = useMemo(
    () => {
      const rows = applyApplicantFilters(allApplicants, filters, nameSortOrder, PIPELINE_STAGE.applied)
      if (nameSortOrder) return rows
      return [...rows].sort((a, b) => {
        const dateA = new Date(a?.applicationDate || a?.createdAt || 0).getTime()
        const dateB = new Date(b?.applicationDate || b?.createdAt || 0).getTime()
        return dateB - dateA
      })
    },
    [allApplicants, filters, nameSortOrder],
  )

  console.log("all applicants",allApplicants)
  console.log("f",filteredApplicants)

  const total = filteredApplicants.length

  const applicantKey = (row, i) => row.id ?? row.email ?? i

  const openApplicant = useCallback(
    (row) => {
      if (!row?.id) return
      // Route is nested under whichever admin base path is active (super-admin/team-admin/career),
      // but this panel doesn't use the base-path hook, so we navigate relatively.
      navigate(`../careers/applicant/${row.id}`, { state: { applicant: row, from: 'APPLIED' } })
    },
    [navigate],
  )

  const hrApplicantIds = useMemo(() => {
    const ids = Array.isArray(hrApplicants) ? hrApplicants.map((a) => a?.id).filter(Boolean) : []
    return new Set(ids)
  }, [hrApplicants])

  const getHrStatus = useCallback(
    (itemId) => {
      if (!itemId) return false
      if (hrApplicantIds.has(itemId)) return true
      if (localHrStatus[itemId] !== undefined) return Boolean(localHrStatus[itemId])
      return hrAddedIds.includes(itemId)
    },
    [hrApplicantIds, localHrStatus, hrAddedIds],
  )

  const handleHrToggle = useCallback(
    async (itemId, isAdded, e) => {
      e?.preventDefault?.()
      e?.stopPropagation?.()
      if (!itemId || isAdded) return

      try {
        setLocalHrStatus((prev) => {
          const updated = { ...prev, [itemId]: true }
          localStorage.setItem(HR_STATUS_STORAGE_KEY, JSON.stringify(updated))
          return updated
        })

        await dispatch(toggleHrApplicant({ id: itemId, checked: true })).unwrap()
        showSuccessToast('Applicant tagged successfully')
      } catch (error) {
        showErrorToast(error?.message || 'Failed to tag applicant')
      }
    },
    [dispatch],
  )

  return (
    <div className="w-full space-y-4 text-left">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
      </div>
      <ApplicantFilters
        total={total}
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
          <span className="text-sm font-medium text-slate-700">Applicants</span>
          {listLoading && <span className="text-xs text-slate-500">Loading…</span>}
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
              {!listLoading && filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No applicants match these filters, or the list is empty.
                  </td>
                </tr>
              )}
              {allApplicants.map((row, i) => (
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
    </div>
  )
}
