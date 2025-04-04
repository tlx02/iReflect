import {
  FeedbackData,
  FeedbackInitialResponseData,
  FeedbackInitialResponsePostData,
  FeedbackPostData,
} from "../../types/feedback";
import baseApi from "./base-api";

const playtestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFeedback: build.query<FeedbackData, FeedbackPostData>({
      query: (data) => ({
        url: "/playtest/",
        method: "POST",
        body: data,
      }),
    }),
    createInitialResponseIfNotExists: build.mutation<
      FeedbackInitialResponseData,
      FeedbackInitialResponsePostData
    >({
      query: ({ ...feedbackPostData }) => ({
        url: "/playtest/initial-response/",
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
