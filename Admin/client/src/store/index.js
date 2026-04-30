import { configureStore } from '@reduxjs/toolkit'
import applicantsReducer from './applicantsSlice'

export const store = configureStore({
  reducer: {
    applicants: applicantsReducer,
  },
})
