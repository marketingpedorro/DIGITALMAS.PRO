import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
import type { Config, Context } from "@netlify/functions";
import { createKixikiMetricsHandler } from "./kixiki-metrics-handler.mjs";

const handler = createKixikiMetricsHandler({ getUser, getStore });

const kixikiMetrics = (request: Request, context: Context) =>
  handler(request, {
    deployContext: context.deploy?.context,
    deployId: context.deploy?.id,
  });

export default kixikiMetrics;

export const config: Config = { path: "/api/kixiki-metrics" };
