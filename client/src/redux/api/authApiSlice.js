import { apiSlice } from "./apiSlice";
import { BASE_URL,AUTH_URL } from "../constants";

export const authApiSlice=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        login:builder.mutation({
            query:(data)=>({
                url:`${BASE_URL}${AUTH_URL}/login`,
                method: 'POST',
                body: data,
            }),
        }),
        logout:builder.mutation({
            query:()=>({
                url:`${BASE_URL}${AUTH_URL}/logout`,
                method: 'POST',
            }),
        }),
        signup:builder.mutation({
            query:(data)=>({
                url:`${BASE_URL}${AUTH_URL}/signup`,
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useSignupMutation
}=authApiSlice;