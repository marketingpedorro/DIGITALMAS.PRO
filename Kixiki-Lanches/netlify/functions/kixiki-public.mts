import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { createKixikiPublicHandler } from "./kixiki-public-handler.mjs";

export default createKixikiPublicHandler({ getStore });

export const config: Config = { path: "/api/kixiki-public" };
