import { http, HttpResponse } from "msw";

// Matches both absolute and relative URLs reliably
const healthUrl = /\/api\/v1\/health$/;
const versionUrl = /\/api\/v1\/version$/;

export const handlers = [
  http.get(healthUrl, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  http.get(versionUrl, () => {
    return HttpResponse.json({ name: "Arcanalyse API", version: "0.1.0", env: "dev" });
  }),
];
