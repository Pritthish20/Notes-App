import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userInfo: localStorage.getItem('userInfo') ?
   JSON.parse(localStorage.getItem('userInfo')) :
   null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserInfo:(state,action)=>{
        state.userInfo = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
        const expires=new Date().getTime() +6*60*60*1000;
        localStorage.setItem('expires', expires);
    },

    logout:(state)=>{
        state.userInfo = null;
        localStorage.clear();
    }

    
  },
})


export const { setUserInfo,logout } = authSlice.actions

export default authSlice.reducer