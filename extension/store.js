import {configureStore, createSlice} from '@reduxjs/toolkit';

const initialState = {
    analysisresult:''
};

const codeslice = createSlice({
    name:code,
    initialState,
    reducers:{
        setAnalysisResult: (state,action) =>{
            state.analysisresult=action.payload;

        }
    }
});

export const {setAnalysisResult} = codeSlice.actions;
export default configureStore({
    reducer: { code: codeSlice.reducer }
});