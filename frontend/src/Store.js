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
      const existItemIndex = state.cart.cartItems.findIndex(
        (item) =>
          item._id === newItem._id &&
          item.color.selectColor._id === newItem.color.selectColor_id
      );

      if (existItemIndex === -1) {
        // If the item doesn't exist in the cart, simply add it.
        const cartItems = [...state.cart.cartItems, newItem];
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        return { ...state, cart: { ...state.cart, cartItems } };
      }

      // If the same item with the same color exists, update the quantity.
      const cartItems = state.cart.cartItems.map((item, index) =>
        index === existItemIndex
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      );

      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "UPDATE_CART_ITEM": {
      const updatedItem = action.payload; // The payload should contain the updated item

      const updatedCartItems = state.cart.cartItems.map((item) => {
        if (
          item._id === updatedItem._id &&
          item.color.selectColor._id === updatedItem.color.selectColor._id
        ) {
          return updatedItem;
        }
        return item;
      });

      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

      return { ...state, cart: { ...state.cart, cartItems: updatedCartItems } };
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
