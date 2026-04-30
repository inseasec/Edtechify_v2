/** Parse first number from strings like "0.0 LPA", "1.6 LPA" */
export function parseLpaString(s) {
  if (s == null || s === '') return null
  const raw = String(s).trim()

  // Handle label values coming from User Career form
  // e.g. "Less than 1 LPA" should be treated as < 1, not as 1.
  if (/less\s*than\s*1/i.test(raw)) return 0

  const m = raw.match(/(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

/** Map LPA value to same bands as ApplicantFilters `<option value="...">` */
function lpaMatchesBand(lpa, band) {
  if (band == null || band === '') return true
  if (lpa == null || Number.isNaN(lpa)) return false
  switch (band) {
    case '<1':
      return lpa < 1
    case '1-3':
      return lpa >= 1 && lpa < 3
    case '3-4':
      return lpa >= 3 && lpa < 4
    case '4-5':
      return lpa >= 4 && lpa < 5
    case '5-6':
      return lpa >= 5 && lpa < 6
    case '6-7':
      return lpa >= 6 && lpa < 7
    case '7-8':
      return lpa >= 7 && lpa < 8
    case '8+':
      return lpa >= 8
    default:
      return true
  }
}

function ageFromDob(dobStr) {
  const d = new Date(dobStr)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1
  return age
}

function ageMatchesFilter(dob, ageFilter) {
  if (!ageFilter) return true
  const age = ageFromDob(dob)
  if (age == null) return false
  switch (ageFilter) {
    case '18-25':
      return age >= 18 && age <= 25
    case '26-35':
      return age >= 26 && age <= 35
    case '36-45':
      return age >= 36 && age <= 45
    case '46+':
      return age >= 46
    default:
      return true
  }
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function applicationDateInRange(isoStr, dateFilterType, yearStr, fromStr, toStr) {
  if (!dateFilterType) return true
  const app = new Date(isoStr)
  if (Number.isNaN(app.getTime())) return false
  const appDay = startOfDay(app)

  const now = new Date()
  const today = startOfDay(now)

  switch (dateFilterType) {
    case 'today':
      return appDay.getTime() === today.getTime()
    case 'currentWeek': {
      const dow = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - ((dow + 6) % 7))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return app >= monday && app <= sunday
    }
    case 'lastWeek': {
      const dow = today.getDay()
      const thisMonday = new Date(today)
      thisMonday.setDate(today.getDate() - ((dow + 6) % 7))
      const lastMonday = new Date(thisMonday)
      lastMonday.setDate(thisMonday.getDate() - 7)
      const lastSunday = new Date(lastMonday)
      lastSunday.setDate(lastMonday.getDate() + 6)
      return app >= lastMonday && app <= lastSunday
    }
    case 'last1': {
      const a = new Date(today)
      a.setMonth(a.getMonth() - 1)
      return app >= a && app <= now
    }
    case 'last2': {
      const a = new Date(today)
      a.setMonth(a.getMonth() - 2)
      return app >= a && app <= now
    }
    case 'last3': {
      const a = new Date(today)
      a.setMonth(a.getMonth() - 3)
      return app >= a && app <= now
    }
    case 'year': {
      const y = parseInt(yearStr, 10)
      if (Number.isNaN(y)) return true
      return app.getFullYear() === y
    }
    case 'custom': {
      if (!fromStr && !toStr) return true
      const from = fromStr ? startOfDay(new Date(fromStr)) : null
      const to = toStr ? startOfDay(new Date(toStr)) : null
      if (from && appDay < from) return false
      if (to && appDay > to) return false
      return true
    }
    default:
      return true
  }
}

function norm(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
}

/**
 * Client-side filter for `/admin-api/careers/getAllApplicants` rows.
 * @param {object[]} applicants
 * @param {object} filters - ApplicantFilters state
 * @param {string} nameSortOrder - '' | 'asc' | 'desc'
 * @param {string|null} pipelineStatus - e.g. APPLIED, or `null` to skip status filtering (e.g. archived-only list).
 */
export function applyApplicantFilters(applicants, filters, nameSortOrder, pipelineStatus = 'APPLIED') {
  if (!Array.isArray(applicants)) return []

  let list =
    pipelineStatus == null
      ? [...applicants]
      : applicants.filter((a) => (a.status ?? '').toUpperCase() === String(pipelineStatus).toUpperCase())

  const f = filters

  if (f.currentSalaryFilter) {
    list = list.filter((a) => lpaMatchesBand(parseLpaString(a.currentSalary), f.currentSalaryFilter))
  }
  if (f.expectedSalaryFilter) {
    list = list.filter((a) => lpaMatchesBand(parseLpaString(a.expectedSalary), f.expectedSalaryFilter))
  }
  if (f.cityFilter) {
    const c = String(f.cityFilter).trim()
    list = list.filter((a) => String(a.city ?? '').trim() === c)
  }
  if (f.stateFilter) {
    const s = String(f.stateFilter).trim()
    list = list.filter((a) => String(a.state ?? '').trim() === s)
  }
  if (f.ageFilter) {
    list = list.filter((a) => ageMatchesFilter(a.dob, f.ageFilter))
  }
  if (f.roleTypeFilter) {
    list = list.filter((a) => (a.applyFor?.roleType ?? '') === f.roleTypeFilter)
  }
  if (f.roleFilter) {
    const r = String(f.roleFilter).trim()
    list = list.filter((a) => String(a.applyFor?.applyingFor ?? '').trim() === r)
  }
  if (f.genderFilter) {
    list = list.filter((a) => (a.gender ?? '') === f.genderFilter)
  }
  if (f.experienceFilter) {
    list = list.filter((a) => (a.experienceLevel ?? '') === f.experienceFilter)
  }
  if (f.dateFilterType) {
    list = list.filter((a) =>
      applicationDateInRange(a.applicationDate, f.dateFilterType, f.dateFilterYear, f.customFromDate, f.customToDate),
    )
  }

  const q = (f.search ?? '').trim().toLowerCase()
  if (q) {
    list = list.filter((a) => {
      const hay = [
        a.fullName,
        a.email,
        a.phone,
        a.city,
        a.state,
        a.subjects,
        a.applyFor?.applyingFor,
        a.qualification,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }

  list = [...list]
  if (nameSortOrder === 'asc') {
    list.sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? '', undefined, { sensitivity: 'base' }))
  } else if (nameSortOrder === 'desc') {
    list.sort((a, b) => (b.fullName ?? '').localeCompare(a.fullName ?? '', undefined, { sensitivity: 'base' }))
  }

  return list
}

/** Unique non-empty strings from applicant field */
export function uniqueFieldValues(applicants, key) {
  const set = new Set()
  for (const a of applicants) {
    const v = a[key]
    if (v != null && String(v).trim() !== '') set.add(String(v).trim())
  }
  return [...set].sort((x, y) => x.localeCompare(y, undefined, { sensitivity: 'base' }))
}

/** Unique applyingFor for a roleType */
export function uniqueApplyingFor(applicants, roleType) {
  const set = new Set()
  for (const a of applicants) {
    if ((a.applyFor?.roleType ?? '') !== roleType) continue
    const v = a.applyFor?.applyingFor
    if (v != null && String(v).trim() !== '') set.add(String(v).trim())
  }
  return [...set].sort((x, y) => x.localeCompare(y, undefined, { sensitivity: 'base' }))
}
