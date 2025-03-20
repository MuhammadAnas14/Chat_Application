import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: JSON.parse(localStorage.getItem("user")) || null,
    users: [], // Store all registered users
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
            state.error = null;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        loginFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isLoading = false;
            state.error = null;
            localStorage.removeItem("user");
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUsers } = authSlice.actions;
export default authSlice.reducer;
