import {
  ACCESS,
  EMAIL,
  IS_ACTIVATED,
  NAME,
  REFRESH,
  TOKENS,
  USER,
} from "../constants";
import { PasswordPayloadPostData, SelfData } from "./users";

export type AuthenticationData = {
  [USER]: SelfData;
  [TOKENS]: {
    [ACCESS]: string;
    [REFRESH]: string;
  };
};

export type CheckAccountPostData = {
  [EMAIL]: string;
};

export type AccountDetails = {
  [NAME]: string;
  [EMAIL]: string;
  [IS_ACTIVATED]: boolean;
};

export type PasswordLoginPostData = PasswordPayloadPostData & {
  [NAME]: string;
  [EMAIL]: string;
};

export type PasswordResetDetails = {
  ["isResetSuccess"]: boolean;
};

export type PasswordResetPostData = PasswordPayloadPostData & {
  ["uid"]: string;
  ["token"]: string;
};
