import type { ImmutableObject } from "seamless-immutable";

export interface Config {
  userCode: string;
  userPasswd: string;
}

export type IMConfig = ImmutableObject<Config>;
