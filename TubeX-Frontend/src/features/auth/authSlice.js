import { createSlice } from "@reduxjs/toolkit";

// Redux keeps the logged-in user available to every component.
// Tokens are kept separately because they are credentials, not UI data.
const savedUser = localStorage.getItem("tubeX_user");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    loading: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;

      if (action.payload) {
        localStorage.setItem("tubeX_user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("tubeX_user");
      }
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
