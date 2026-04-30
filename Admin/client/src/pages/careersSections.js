/** URL segment → sidebar label & page heading (careers pipeline). */
export const CAREER_SECTIONS = {
  applied: {
    title: 'Applied',
    // description: 'Applications received and awaiting initial review.',
  },
  shortlisted: {
    title: 'Shortlisted',
    description: 'Candidates moved forward in the hiring funnel.',
  },
  'under-review': {
    title: 'Under Review',
    description: 'Applications currently being evaluated by the team.',
  },
  selected: {
    title: 'Selected',
    description: 'Candidates selected for the next stage or offer.',
  },
  archived: {
    title: 'Archived',
    description: 'Closed or withdrawn applications kept for reference.',
  },
  'hr-applicants': {
    title: 'HR Applicants',
    description: 'Applicants visible to HR workflows and screening.',
  },
  settings: {
    title: 'Settings',
    description: 'Careers portal preferences, notifications, and pipeline options.',
  },
}

export function isCareerSection(segment) {
  return segment != null && segment !== '' && segment in CAREER_SECTIONS
}
