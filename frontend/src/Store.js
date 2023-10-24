import { createContext, useReducer } from "react";

export const Store = createContext();

const initialState = {
  fullBox: false,
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,

  cart: {
    shippingAddress:
      localStorage.getItem("shippingAddress") &&
      localStorage.getItem("detailAddress")
        ? JSON.parse(localStorage.getItem("shippingAddress")) &&
          JSON.parse(localStorage.getItem("detailAddress"))
        : { location: {} },
    paymentMethod: localStorage.getItem("paymentMethod")
      ? localStorage.getItem("paymentMethod")
      : "",
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
  },
};
function reducer(state, action) {
  switch (action.type) {
    case "SET_FULLBOX_ON":
      return { ...state, fullBox: true };
    case "SET_FULLBOX_OFF":
      return { ...state, fullBox: false };
    // case "CART_CLEAR":
    //   return { ...state, cart: { ...state.cart, cartItems: [] } };
    case "CART_ADD_ITEM": {
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );

      if (!existItem) {
        // If the item doesn't exist in the cart, simply add it.
        const cartItems = [...state.cart.cartItems, newItem];
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        return { ...state, cart: { ...state.cart, cartItems } };
      }

      if (existItem.color._id === newItem.color._id) {
        // If the same item with the same color exists, update the quantity.
        const cartItems = state.cart.cartItems.map((item) =>
          item._id === existItem._id ? newItem : item
        );
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        return { ...state, cart: { ...state.cart, cartItems } };
      }

      // If the same item with a different color exists, add it as a new item.
      const cartItems = [...state.cart.cartItems, newItem];
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_REMOVE_ITEM": {
      const {
        _id,
        color: { colorId },
      } = action.payload; // Destructure _id and color._id from the item
      const updatedCartItems = state.cart.cartItems.filter(
        (item) => item._id !== _id || item.color._id !== colorId
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
      return { ...state, cart: { ...state.cart, cartItems: updatedCartItems } };
    }

    case "USER_SIGNIN":
      return { ...state, userInfo: action.payload };
    case "USER_SIGNOUT":
      return {
        ...state,
        userInfo: null,
        cart: {
          cartItems: [],
          shippingAddress: {},
          detailAddress: {},
          paymentMethod: "",
        },
      };
    case "SAVE_SHIPPING_ADDRESS":
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      };

    case "SAVE_PAYMENT_METHOD":
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };
    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children} </Store.Provider>;
}
