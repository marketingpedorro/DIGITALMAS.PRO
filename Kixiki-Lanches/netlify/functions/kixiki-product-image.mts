import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";
import { createKixikiProductImageHandler } from "./kixiki-product-image-handler.mjs";

export default createKixikiProductImageHandler({ getUser, getStore });

export const config: Config = { path: "/api/kixiki-product-image" };
