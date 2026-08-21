import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import { createKixikiEventsHandler } from "./kixiki-events-handler.mjs";

const handler = createKixikiEventsHandler({ getStore });

const kixikiEvents = (request: Request, context: Context) =>
  handler(request, {
    deployContext: context.deploy?.context,
    deployId: context.deploy?.id,
  });

export default kixikiEvents;

export const config: Config = { path: "/api/kixiki-events" };
