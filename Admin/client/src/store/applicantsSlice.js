import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'
import { CAREERS_PATHS } from '@/lib/careersApi'

function normalizeApplicantList(resData) {
  const raw = resData?.data ?? resData
  return Array.isArray(raw) ? raw : []
}

function rejectMessage(err, fallback) {
  const d = err?.response?.data
  if (d == null) return fallback
  if (typeof d === 'string') return d
  if (typeof d === 'object' && d.message) return String(d.message)
  return fallback
}

/** Fetch all applicants */
export const fetchAllApplicants = createAsyncThunk(
  'applicants/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(CAREERS_PATHS.getAllApplicants)
      return normalizeApplicantList(res.data)
    } catch (err) {
      return rejectWithValue(rejectMessage(err, 'Failed to fetch applicants'))
    }
  },
)

/** Fetch applicants by pipeline status */
export const fetchApplicantsByStatus = createAsyncThunk(
  'applicants/fetchByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(CAREERS_PATHS.getApplicantByStatus(status))
      return normalizeApplicantList(res.data)
    } catch (err) {
      return rejectWithValue(rejectMessage(err, 'Failed to fetch applicants'))
    }
  },
)

/** Update applicant status (removes from list in slice on success) */
export const updateApplicantStatus = createAsyncThunk(
  'applicants/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await api.put(CAREERS_PATHS.updateByStatus(id, status))
      return { id, status }
    } catch (err) {
      return rejectWithValue(rejectMessage(err, 'Failed to update status'))
    }
  },
)

/** Assign / unassign HR on an applicant */
export const toggleHrApplicant = createAsyncThunk(
  'applicants/toggleHrApplicant',
  async ({ id, checked }, { rejectWithValue }) => {
    try {
      await api.put(CAREERS_PATHS.updateHr(id, checked))
      return { id, checked }
    } catch (err) {
      return rejectWithValue(rejectMessage(err, 'Failed to update HR assignment'))
    }
  },
)

const applicantsSlice = createSlice({
  name: 'applicants',
  initialState: {
    list: [],
    loading: false,
    error: '',
    hrAddedIds: [],
  },
  reducers: {
    clearApplicantsError(state) {
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllApplicants.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchAllApplicants.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchAllApplicants.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? 'Error')
      })

      .addCase(fetchApplicantsByStatus.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchApplicantsByStatus.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchApplicantsByStatus.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? 'Error')
      })

      .addCase(updateApplicantStatus.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a.id !== action.payload.id)
      })

      .addCase(toggleHrApplicant.pending, (state) => {
        state.loading = true
      })
      .addCase(toggleHrApplicant.fulfilled, (state, action) => {
        state.loading = false
        const { id, checked } = action.payload
        if (checked) {
          if (!state.hrAddedIds.includes(id)) state.hrAddedIds.push(id)
        } else {
          state.hrAddedIds = state.hrAddedIds.filter((hrId) => hrId !== id)
        }
      })
      .addCase(toggleHrApplicant.rejected, (state, action) => {
        state.loading = false
        state.error = String(action.payload ?? 'Error')
      })
  },
})

export const { clearApplicantsError } = applicantsSlice.actions
export default applicantsSlice.reducer
