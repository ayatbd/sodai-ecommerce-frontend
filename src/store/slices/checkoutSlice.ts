import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address, Order } from '../../types';
import { INITIAL_ADDRESSES } from '../../services/mockData';

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';

interface CheckoutState {
  step: CheckoutStep;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  sameAsShipping: boolean;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay';
  cardDetails: {
    numberLast4: string;
    holderName: string;
    expiry: string;
    brand: string;
  };
  lastOrder: Order | null;
  isProcessing: boolean;
}

const initialState: CheckoutState = {
  step: 'shipping',
  shippingAddress: INITIAL_ADDRESSES[0] || null,
  billingAddress: INITIAL_ADDRESSES[0] || null,
  sameAsShipping: true,
  paymentMethod: 'card',
  cardDetails: {
    numberLast4: '4242',
    holderName: 'Alex Rivera',
    expiry: '08/29',
    brand: 'visa',
  },
  lastOrder: null,
  isProcessing: false,
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCheckoutStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.step = action.payload;
    },
    setShippingAddress: (state, action: PayloadAction<Address>) => {
      state.shippingAddress = action.payload;
      if (state.sameAsShipping) {
        state.billingAddress = action.payload;
      }
    },
    setBillingAddress: (state, action: PayloadAction<Address>) => {
      state.billingAddress = action.payload;
    },
    setSameAsShipping: (state, action: PayloadAction<boolean>) => {
      state.sameAsShipping = action.payload;
      if (action.payload && state.shippingAddress) {
        state.billingAddress = state.shippingAddress;
      }
    },
    setPaymentMethod: (state, action: PayloadAction<'card' | 'apple_pay' | 'google_pay'>) => {
      state.paymentMethod = action.payload;
    },
    setCardDetails: (
      state,
      action: PayloadAction<{ numberLast4: string; holderName: string; expiry: string; brand: string }>
    ) => {
      state.cardDetails = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setLastOrder: (state, action: PayloadAction<Order>) => {
      state.lastOrder = action.payload;
      state.step = 'confirmation';
    },
    resetCheckout: (state) => {
      state.step = 'shipping';
      state.isProcessing = false;
      state.lastOrder = null;
    },
  },
});

export const {
  setCheckoutStep,
  setShippingAddress,
  setBillingAddress,
  setSameAsShipping,
  setPaymentMethod,
  setCardDetails,
  setProcessing,
  setLastOrder,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
