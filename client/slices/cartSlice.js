// No cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  userId: null, // Adicionado para associar o carrinho a um usuário específico
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload; // Configura o ID do usuário para o estado do carrinho
      console.log("UserId configurado:", action.payload); // Adiciona um console.log para verificar o userId configurado
    },
    addToCart: (state, action) => {
      console.log("UserId in addToCart action:", state.userId); 
      if (state.userId === action.payload.userId) {
        state.items = [...state.items, action.payload.item];
      } else {
        console.warn("Tentativa de adicionar item ao carrinho de outro usuário.");
      }
      console.log("UserId no addToCart:", state.userId); // Adiciona um console.log para verificar o userId ao adicionar ao carrinho
    },
    removeFromCart: (state, action) => {
      if (state.userId === action.payload.userId) {
        const itemId = action.payload.itemId;
        state.items = state.items.filter(item => item._id !== itemId);
      } else {
        console.warn("Tentativa de remover item do carrinho de outro usuário.");
      }
      console.log("UserId no removeFromCart:", state.userId); // Adiciona um console.log para verificar o userId ao remover do carrinho
    },
    emptyCart: (state, action) => {
      if (state.userId === action.payload.userId) {
        state.items = [];
      } else {
        console.warn("Tentativa de esvaziar o carrinho de outro usuário.");
      }
      console.log("UserId no emptyCart:", state.userId); // Adiciona um console.log para verificar o userId ao esvaziar o carrinho
    },
  },
});

// Action creators são gerados para cada função reducer
export const { setUser, addToCart, removeFromCart, emptyCart } = cartSlice.actions;

export const selectCartItems = state => state.cart.items;

export const selectCartItemsById = (state, id) =>
  state.cart.items.filter(item => item._id === id);

export const selectCartTotal = state =>
  state.cart.items.reduce((total, item) => total + item.valor, 0);

export default cartSlice.reducer;
