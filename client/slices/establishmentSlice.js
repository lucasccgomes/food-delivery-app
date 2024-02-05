import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  establishment: null,
}

export const establishmentSlice = createSlice({
  name: 'establishment',
  initialState,
  reducers: {
    setEstablishment: (state, action) => {
      state.establishment = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setEstablishment } = establishmentSlice.actions

export const selectEstablishment = state => state.establishment.establishment;

export default establishmentSlice.reducer