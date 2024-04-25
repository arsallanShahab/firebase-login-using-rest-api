// src/types/express.d.ts

import { Request } from "express";
import { UserData } from "./app";

declare module "express" {
  interface Request {
    uid?: string;
    user?: UserData;
  }
}
