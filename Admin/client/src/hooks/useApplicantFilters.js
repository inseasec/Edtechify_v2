import { useCallback, useEffect, useMemo, useState } from 'react'
import { applyApplicantFilters, parseLpaString } from '@/lib/careersApplicantFilters'

export const INITIAL_APPLICANT_FILTERS = {
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

function parseDobToDate(dob) {
  if (dob == null || dob === '') return null

  // Common backend shapes:
  // - "YYYY-MM-DD" (LocalDate)
  // - [yyyy, mm, dd]
  // - { year, month, day } / { year, monthValue, dayOfMonth }
  if (Array.isArray(dob) && dob.length >= 3) {
    const [y, m, d] = dob
    if ([y, m, d].some((x) => x == null)) return null
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  if (typeof dob === 'object') {
    const y = dob.year
    const m = dob.monthValue ?? dob.month
    const d = dob.dayOfMonth ?? dob.day
    if (y != null && m != null && d != null) {
      return new Date(Number(y), Number(m) - 1, Number(d))
    }
  }

  const dt = new Date(dob)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function calculateAge(dob) {
  const d = parseDobToDate(dob)
  if (!d) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1
  return age
}

function normalizeSalary(s) {
  return parseLpaString(s)
}

function formatSalary(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return `${n} LPA`
}

/**
 * Client-side filters + pagination for a careers pipeline slice.
 * @param {object[]} applicants
 * @param {number} itemsPerPage
 * @param {string|null} pipelineStatus — e.g. PIPELINE_STAGE.shortlisted, or `null` to skip status filter.
 * @param {{ initialPage?: number }} [options]
 */
export function useApplicantFilters(applicants, itemsPerPage, pipelineStatus, options = {}) {
  const { initialPage: initialPageOpt = 1 } = options
  const [filters, setFilters] = useState(() => ({ ...INITIAL_APPLICANT_FILTERS }))
  const [nameSortOrder, setNameSortOrder] = useState('')
  const [currentPage, setCurrentPage] = useState(() =>
    Math.max(1, parseInt(String(initialPageOpt), 10) || 1),
  )

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
    setFilters({ ...INITIAL_APPLICANT_FILTERS })
    setNameSortOrder('')
  }, [])

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    setCurrentPage(1)
  }, [filtersKey, nameSortOrder, pipelineStatus])

  const filteredApplicants = useMemo(
    () => applyApplicantFilters(applicants, filters, nameSortOrder, pipelineStatus),
    [applicants, filters, nameSortOrder, pipelineStatus],
  )

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / itemsPerPage))

  useEffect(() => {
    setCurrentPage((p) => (p > totalPages ? totalPages : p))
  }, [totalPages])

  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredApplicants.slice(start, start + itemsPerPage)
  }, [filteredApplicants, currentPage, itemsPerPage])

  const helpers = useMemo(
    () => ({
      calculateAge,
      normalizeSalary,
      formatSalary,
    }),
    [],
  )

  return {
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
  }
}
