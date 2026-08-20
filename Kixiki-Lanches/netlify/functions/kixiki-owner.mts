import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";
import { createKixikiOwnerHandler } from "./kixiki-owner-handler.mjs";

export default createKixikiOwnerHandler({ getUser, getStore });

export const config: Config = { path: "/api/kixiki-owner" };
