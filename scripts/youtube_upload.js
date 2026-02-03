#!/usr/bin/env node

import fs from "fs";
import path from "path";
import process from "process";
import readline from "readline";
import { google } from "googleapis";

const args = process.argv.slice(2);
const argMap = new Map();
for (let i = 0; i < args.length; i += 1) {
  const key = args[i];
  const value = args[i + 1];
  if (key?.startsWith("--")) {
    argMap.set(key.replace(/^--/, ""), value ?? true);
  }
}

const configPath = argMap.get("config") ?? "config/youtube_upload.json";
const dryRun = argMap.get("dry-run") === true || argMap.get("dry-run") === "true";

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const resolvePath = (value) => path.resolve(process.cwd(), value);

const readJobs = (jsonlPath) => {
  const content = fs.readFileSync(jsonlPath, "utf-8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
};

const addDays = (isoString, days) => {
  const date = new Date(isoString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

const authorize = async (tokenPath) => {
  const credentials = JSON.parse(fs.readFileSync(resolvePath(config.credentialsPath), "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed ?? credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(resolvePath(tokenPath))) {
    const token = JSON.parse(fs.readFileSync(resolvePath(tokenPath), "utf-8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload"]
  });

  console.log("Authorize this app by visiting:", authUrl);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise((resolve) => {
    rl.question("Enter the code from that page here: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  const tokenResponse = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokenResponse.tokens);
  fs.mkdirSync(path.dirname(resolvePath(tokenPath)), { recursive: true });
  fs.writeFileSync(resolvePath(tokenPath), JSON.stringify(tokenResponse.tokens, null, 2));
  return oAuth2Client;
};

const uploadVideo = async (youtube, job) => {
  const filePath = resolvePath(job.videoPath);
  const description = job.descriptionPath
    ? fs.readFileSync(resolvePath(job.descriptionPath), "utf-8")
    : job.description ?? "";
  let publishAt = job.publishAt ?? undefined;
  if (job.publishOffsetDays && publishAt) {
    publishAt = addDays(publishAt, job.publishOffsetDays);
  }
  const requestBody = {
    snippet: {
      title: job.title,
      description,
      tags: job.tags ?? [],
      categoryId: job.categoryId ?? config.categoryId
    },
    status: {
      privacyStatus: job.privacyStatus ?? config.defaultPrivacyStatus,
      publishAt
    }
  };

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody,
    media: {
      body: fs.createReadStream(filePath)
    }
  });

  return res.data;
};

const run = async () => {
  const inputJsonl = resolvePath(config.inputJsonl);
  const jobs = readJobs(inputJsonl);
  if (jobs.length === 0) {
    console.log("No upload jobs found.");
    return;
  }

  if (dryRun) {
    console.log(`Dry run: ${jobs.length} upload job(s) loaded from ${inputJsonl}.`);
    return;
  }

  for (const job of jobs) {
    const channels =
      config.channelsPath && fs.existsSync(resolvePath(config.channelsPath))
        ? JSON.parse(fs.readFileSync(resolvePath(config.channelsPath), "utf-8"))
        : {};
    const channelConfig = job.channelKey ? channels[job.channelKey] : null;
    const tokenPath = channelConfig?.tokenPath ?? config.tokenPath;
    if (!tokenPath) {
      throw new Error("Missing tokenPath. Set config.tokenPath or channelsPath with tokenPath.");
    }
    const authClient = await authorize(tokenPath);
    const youtube = google.youtube({ version: "v3", auth: authClient });
    const result = await uploadVideo(youtube, job);
    const channelLabel = channelConfig?.channelName ? ` (${channelConfig.channelName})` : "";
    console.log(`Uploaded${channelLabel} ${job.title}: ${result.id}`);
  }
};

run();
