import baseApi from "./base-api";
import {
  AuthenticationData,
  AccountDetails,
  PasswordLoginPostData,
  CheckAccountPostData,
  PasswordResetDetails,
  PasswordResetPostData,
} from "../../types/auth";

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkAccount: build.query<AccountDetails, CheckAccountPostData>({
      query: (data) => ({
        url: "/gateway/check/",
        method: "POST",
        body: data,
      }),
      extraOptions: { includeAuth: false },
    }),
    passwordLogin: build.mutation<AuthenticationData, PasswordLoginPostData>({
      query: (data) => ({
        url: "/gateway/login/",
        method: "POST",
        body: data,
      }),
      extraOptions: { includeAuth: false },
    }),
    passwordReset: build.query<PasswordResetDetails, CheckAccountPostData>({
      query: (data) => ({
        url: "/gateway/reset/",
        method: "POST",
        body: data,
      }),
      extraOptions: { includeAuth: false },
    }),
    passwordResetConfirm: build.mutation<
      PasswordResetDetails,
      PasswordResetPostData
    >({
      query: (data) => ({
        url: "/gateway/reset-confirm/",
        method: "POST",
        body: data,
      }),
      extraOptions: { includeAuth: false },
    }),
  }),
});

export const {
  usePasswordResetConfirmMutation,
  useLazyPasswordResetQuery,
  usePasswordLoginMutation,
  useLazyCheckAccountQuery,
} = authApi;
