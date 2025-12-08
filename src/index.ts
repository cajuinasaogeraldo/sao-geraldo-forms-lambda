import serverless from "serverless-http";
import { app } from "./app";
import * as fs from "fs";

// Setup GCP credentials from environment
const credentials = process.env.GOOGLE_CREDENTIALS_JSON;
if (credentials) {
  fs.writeFileSync("/tmp/gcp-credentials.json", credentials);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = "/tmp/gcp-credentials.json";
}

export const handler = serverless(app);
