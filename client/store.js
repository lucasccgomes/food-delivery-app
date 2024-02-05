import { configureStore } from '@reduxjs/toolkit'
import cartSlice from './slices/cartSlice'
import establishmentSlice from './slices/establishmentSlice'


export const store = configureStore({
  reducer: {
    cart: cartSlice,
    establishment: establishmentSlice
  },
})