import { ANNOTATED_CONTENT, CONTENT, CREATED, CREATOR, FEEDBACK, ID, INITIAL_RESPONSE, MILESTONE, NAME, QUESTION, SUBMISSION_ID, TEMPLATE } from "../constants";
import { BaseData } from "./base";
import { MilestoneData } from "./milestones";
import { TemplateData } from "./templates";
import { UserData } from "./users";

export type FeedbackData = {
  [ANNOTATED_CONTENT]: string;
  [FEEDBACK]: string;
};

export type FeedbackPostData = {
  [CONTENT]: string;
};

export type FeedbackInitialResponseData = {
  [CREATED]: boolean;
  [INITIAL_RESPONSE]: string;
};

export type FeedbackInitialResponsePostData = Partial<BaseData> & {
  [SUBMISSION_ID]: string | number;
  [QUESTION]: string;
  [INITIAL_RESPONSE]: string;
};
