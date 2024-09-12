import { createContext } from "react";


// Context for sending request to store feedback initial responses
type FeedbackContextType = {
  testMode?: boolean;
  submissionId?: string | number;
};


export const FeedbackContext = createContext<FeedbackContextType>({
  testMode: false,
  submissionId: "",
});
