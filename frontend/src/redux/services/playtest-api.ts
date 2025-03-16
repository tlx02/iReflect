import {
  PlaytestPostData,
  PlaytestResponseData,
} from "../../types/feedback";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseApi from "./base-api";

//try to use full URL but CORS reject

// const playtestApi =createApi({
//   reducerPath:"playtestApi",
//   baseQuery: fetchBaseQuery({ baseUrl: ""}),
//   endpoints: (build) => ({
//     // Note: We use the full URL here for the playtest query endpoint.
//     getFeedback: build.query<PlaytestResponseData, PlaytestPostData>({
//       query: (data) => ({
//         url: "https://lightrag-718956186327.asia-southeast1.run.app/query",
//         method: "POST",
//         body: data,
//       }),
//     }),
//   }),
// });

//try to use proxy but 404 not found
const playtestApi = createApi({
  reducerPath: "playtestApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }), 
  endpoints: (build) => ({
    getFeedback: build.query<PlaytestResponseData, PlaytestPostData>({
      query: (data) => ({
        url: "/api/playtest/", 
        method: "POST",
        body: data,
      }),
    }),
  }),
});


export const {
  useLazyGetFeedbackQuery
} = playtestApi;
export default playtestApi;
