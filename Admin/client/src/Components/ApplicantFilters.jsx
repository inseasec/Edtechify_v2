/**
 * Filter bar for careers applicant lists (Applied, HR, etc.).
 * Controlled via `filters` + `setters` from the parent.
 */
export default function ApplicantFilters({
  total,
  cities = [],
  states = [],
  teachingRoles = [],
  nonTeachingRoles = [],
  ageRanges = [],
  filters,
  setters,
  resetFilters,
  isHR,
  nameSortOrder,
  setNameSortOrder,
}) {
  // Keep this aligned with User Career salary options.
  // (User list includes "Custom LPA" which is not meaningful for filtering.)
  const SALARY_BANDS = [
    { value: '<1', label: 'Less than 1 LPA' },
    { value: '1-3', label: '1-3 LPA' },
    { value: '3-4', label: '3-4 LPA' },
    { value: '4-5', label: '4-5 LPA' },
    { value: '5-6', label: '5-6 LPA' },
    { value: '6-7', label: '6-7 LPA' },
    { value: '7-8', label: '7-8 LPA' },
    { value: '8+', label: '8+ LPA' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-sm sm:px-4">
      <p className="font-semibold text-slate-800">Showing {total} applicants</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          aria-label="Filter by current salary"
          value={filters.currentSalaryFilter}
          onChange={(e) => setters.setCurrentSalaryFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Current salaries</option>
          {SALARY_BANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by expected salary"
          value={filters.expectedSalaryFilter}
          onChange={(e) => setters.setExpectedSalaryFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Expected salaries</option>
          {SALARY_BANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by city"
          value={filters.cityFilter}
          onChange={(e) => setters.setCityFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {!isHR && (
          <select
            aria-label="Filter by state"
            value={filters.stateFilter}
            onChange={(e) => setters.setStateFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        )}

        <select
          aria-label="Filter by age"
          value={filters.ageFilter}
          onChange={(e) => setters.setAgeFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Age</option>
          {ageRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by role type"
          value={filters.roleTypeFilter}
          onChange={(e) => {
            setters.setRoleTypeFilter(e.target.value)
            setters.setRoleFilter('')
          }}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Role type</option>
          <option value="TECH">Teaching</option>
          <option value="NON_TECH">Non teaching</option>
        </select>

        <select
          aria-label="Filter by role"
          value={filters.roleFilter}
          onChange={(e) => setters.setRoleFilter(e.target.value)}
          disabled={!filters.roleTypeFilter}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Roles</option>
          {filters.roleTypeFilter === 'TECH' &&
            teachingRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          {filters.roleTypeFilter === 'NON_TECH' &&
            nonTeachingRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
        </select>

        <select
          aria-label="Filter by gender"
          value={filters.genderFilter}
          onChange={(e) => setters.setGenderFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <select
          aria-label="Filter by experience"
          value={filters.experienceFilter}
          onChange={(e) => setters.setExperienceFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Experience</option>
          <option value="0-1">0–1 years</option>
          <option value="2-4">2–4 years</option>
          <option value="5+">5+ years</option>
        </select>

        <select
          aria-label="Filter by application date"
          value={filters.dateFilterType}
          onChange={(e) => setters.setDateFilterType(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Date applied</option>
          <option value="today">Today</option>
          <option value="currentWeek">Current week</option>
          <option value="lastWeek">Last week</option>
          <option value="last1">Last 1 month</option>
          <option value="last2">Last 2 months</option>
          <option value="last3">Last 3 months</option>
          <option value="year">Choose year</option>
          <option value="custom">Custom range</option>
        </select>

        {filters.dateFilterType === 'year' && (
          <input
            type="number"
            placeholder="Year"
            value={filters.dateFilterYear}
            onChange={(e) => setters.setDateFilterYear(e.target.value)}
            className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        )}

        {filters.dateFilterType === 'custom' && (
          <>
            <input
              type="date"
              value={filters.customFromDate}
              onChange={(e) => setters.setCustomFromDate(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <input
              type="date"
              value={filters.customToDate}
              onChange={(e) => setters.setCustomToDate(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </>
        )}

        <input
          type="search"
          placeholder="Search…"
          value={filters.search}
          onChange={(e) => setters.setSearch(e.target.value)}
          className="min-w-[140px] flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:max-w-xs sm:flex-none"
        />

        <select
          aria-label="Sort by name"
          value={nameSortOrder}
          onChange={(e) => setNameSortOrder(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Sort by name</option>
          <option value="asc">A – Z</option>
          <option value="desc">Z – A</option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white transition hover:bg-slate-800"
        >
          Reset filters
        </button>
      </div>
    </div>
  )
}
