import { createSlice, createSelector } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}



export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      state.items = [...state.items, action.payload]
    },
    removeFromCart: (state, action) => {
        let newCart = [...state.items]
        let itemIndex = state.items.findIndex(item => item._id==action.payload.id);
        if(itemIndex>=0) {
            newCart.splice(itemIndex, 1)
        }else{
            console.log("não é possível remover o item que não foi adicionado ao carrinho!")
        }
        state.items = newCart
      },
      emptyCart: (state, action) => {
        state.items = []
      },
  },
})

// Action creators are generated for each case reducer function
export const { addToCart, removeFromCart, emptyCart } = cartSlice.actions

export const selectCartItems = state => state.cart.items;

export const selectCartItemsById = createSelector(
  [selectCartItems, (state, id) => id],
  (items, id) => items.filter(item => item._id === id)
);

export const selectCartTotal = state=> state.cart.items.reduce((total, item)=> total=total+item.valor, 0)
 
export default cartSlice.reducer