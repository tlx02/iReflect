import {
  FeedbackData,
  FeedbackInitialResponseData,
  FeedbackInitialResponsePostData,
  FeedbackPostData,
} from "../../types/feedback";
import baseApi from "./base-api";

const playtestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Note: We use the full URL here for the playtest query endpoint.
    getFeedback: build.query<FeedbackData, FeedbackPostData>({
      query: (data) => ({
        url: "https://lightrag-718956186327.asia-southeast1.run.app/query",
        method: "POST",
        body: data,
      }),
    }),
    createInitialResponseIfNotExists: build.mutation<FeedbackInitialResponseData, FeedbackInitialResponsePostData>({
      query: (feedbackPostData) => ({
        url: "/playtest/initial-response/", // if this endpoint should use your baseUrl, keep it relative
        method: "POST",
        body: feedbackPostData,
      }),
    }),
  }),
});

export const {
  useLazyGetFeedbackQuery,
  useCreateInitialResponseIfNotExistsMutation,
} = playtestApi;
