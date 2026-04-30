import api from './api'

/**
 * Admin careers API — returns full applicant list as JSON array.
 * Set `VITE_API_BASE_URL` so paths resolve (e.g. http://host:port + /careers/...).
 */
export const CAREERS_PATHS = {
  getAllApplicants: '/careers/getAllApplicants',
  getAllOfHr: '/careers/getAllOfHr',
  getApplicantByStatus: (status) =>
    `/careers/getApplicantByStatus/${encodeURIComponent(String(status))}`,
  updateByStatus: (id, status) =>
    `/careers/updateByStatus/${encodeURIComponent(String(id))}/${encodeURIComponent(String(status))}`,
  /** Reject / archive a single applicant (adjust path if your backend differs). */
  archiveApplicant: (id) =>
    `/careers/archive/${encodeURIComponent(String(id))}`,
  /** Archived / rejected list (adjust if your backend uses a different path). */
  getAllArchived: '/careers/getAllArchived',
  updateHr: (id, assign) =>
    `/careers/updateHr/${encodeURIComponent(String(id))}?assign=${assign}`,
  /** Optional — keep if your backend exposes these */
  names: '/careers/name',
  filterOptions: '/careers/archive/filter-options',
}

export const PIPELINE_STAGE = {
  applied: 'APPLIED',
  shortlisted: 'SHORTLISTED',
  // Backend status value is "REVIEW" (not "UNDER_REVIEW")
  underReview: 'REVIEW',
  selected: 'SELECTED',
  archived: 'ARCHIVED',
  hrApplicants: 'HR_APPLICANTS',
}

export function parseCareerNames(data) {
  if (data == null) return { teachingRoles: [], nonTeachingRoles: [] }
  if (Array.isArray(data)) {
    return { teachingRoles: data, nonTeachingRoles: [] }
  }
  const d = data.data ?? data
  const teaching =
    d.teachingRoles ?? d.techRoles ?? d.TECH ?? d.teaching ?? (Array.isArray(d.tech) ? d.tech : null)
  const nonTeaching =
    d.nonTeachingRoles ?? d.nonTechRoles ?? d.NON_TECH ?? d.nonTeaching ?? (Array.isArray(d.nonTech) ? d.nonTech : null)
  return {
    teachingRoles: Array.isArray(teaching) ? teaching : [],
    nonTeachingRoles: Array.isArray(nonTeaching) ? nonTeaching : [],
  }
}

export function parseFilterOptions(data) {
  if (data == null) return null
  const d = data.data ?? data
  return {
    cities: d.cities ?? d.cityList ?? [],
    states: d.states ?? d.stateList ?? [],
    ageRanges: d.ageRanges ?? d.ageRangesList ?? null,
  }
}

/** Raw array from GET /careers/getAllApplicants */
export async function fetchAllApplicants() {
  const { data } = await api.get(CAREERS_PATHS.getAllApplicants)
  const raw = data?.data ?? data
  return Array.isArray(raw) ? raw : []
}

export async function fetchCareerNames() {
  const { data } = await api.get(CAREERS_PATHS.names)
  return parseCareerNames(data)
}

export async function fetchApplicantFilterOptions() {
  try {
    const { data } = await api.get(CAREERS_PATHS.filterOptions)
    return parseFilterOptions(data)
  } catch {
    return null
  }
}
