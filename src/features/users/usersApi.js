import { apiSlice } from "../api/apiSlice";

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (email) => `/users?email=${email}`,

      providesTags: ["user"],
      invalidatesTags: ["user", "conversation"],
    }),
  }),
});

export const { useGetUserQuery } = usersApi;
