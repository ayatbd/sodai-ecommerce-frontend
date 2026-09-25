import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents (e.g. 45000 for $450.00)
  currency?: string;
  metadata?: Record<string, any>;
  receipt_email?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  isTestMode: boolean;
  isSimulated?: boolean;
}

export interface PaymentIntentDetails {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  customerEmail?: string;
}

export interface GetPaymentIntentResponse {
  success: boolean;
  paymentIntent: PaymentIntentDetails;
}

export interface CancelPaymentIntentResponse {
  success: boolean;
  paymentIntentId: string;
  status: 'canceled';
}

export interface StripeConfigResponse {
  publishableKey: string;
  isTestMode: boolean;
  isStripeConfigured: boolean;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/payments',
  }),
  tagTypes: ['PaymentIntent', 'PaymentConfig'],
  endpoints: (builder) => ({
    getStripeConfig: builder.query<StripeConfigResponse, void>({
      query: () => '/config',
      providesTags: ['PaymentConfig'],
    }),

    createPaymentIntent: builder.mutation<CreatePaymentIntentResponse, CreatePaymentIntentRequest>({
      query: (body) => ({
        url: '/create-payment-intent',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PaymentIntent', id: 'CURRENT' }],
    }),

    getPaymentIntent: builder.query<GetPaymentIntentResponse, string>({
      query: (paymentIntentId) => `/${paymentIntentId}`,
      providesTags: (_result, _error, id) => [{ type: 'PaymentIntent', id }],
    }),

    cancelPaymentIntent: builder.mutation<CancelPaymentIntentResponse, string>({
      query: (paymentIntentId) => ({
        url: `/${paymentIntentId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'PaymentIntent', id }, { type: 'PaymentIntent', id: 'CURRENT' }],
    }),

    confirmTestPayment: builder.mutation<
      { success: boolean; paymentIntentId: string; status: string },
      { paymentIntentId: string; paymentMethodId?: string }
    >({
      query: ({ paymentIntentId, paymentMethodId }) => ({
        url: `/${paymentIntentId}/confirm-test`,
        method: 'POST',
        body: { paymentMethodId },
      }),
      invalidatesTags: (_result, _error, { paymentIntentId }) => [{ type: 'PaymentIntent', id: paymentIntentId }],
    }),
  }),
});

export const {
  useGetStripeConfigQuery,
  useCreatePaymentIntentMutation,
  useGetPaymentIntentQuery,
  useCancelPaymentIntentMutation,
  useConfirmTestPaymentMutation,
} = paymentApi;
