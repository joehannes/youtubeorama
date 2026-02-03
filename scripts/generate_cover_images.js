#!/usr/bin/env node

import fs from "fs";
import path from "path";
import process from "process";

const args = process.argv.slice(2);
const argMap = new Map();
for (let i = 0; i < args.length; i += 1) {
  const key = args[i];
  const value = args[i + 1];
  if (key?.startsWith("--")) {
    argMap.set(key.replace(/^--/, ""), value ?? true);
  }
}

const configPath = argMap.get("config") ?? "config/image_generation.json";
const dryRun = argMap.get("dry-run") === true || argMap.get("dry-run") === "true";

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const resolvePath = (value) => path.resolve(process.cwd(), value);

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readJobs = (jsonlPath) => {
  const content = fs.readFileSync(jsonlPath, "utf-8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
};

const buildPrompt = (job) => {
  const subject = job.subject ?? "album cover art";
  const channelContext = job.channelContext ?? "";
  const dailyContext = job.dailyContext ?? "";
  const genreContext = job.genreContext ?? "";
  const visualStyle = job.visualStyle ?? "cinematic, high-detail";
  const mood = job.mood ?? "uplifting";
  const language = job.language ?? "";

  return [
    subject,
    channelContext,
    dailyContext,
    genreContext,
    `mood: ${mood}`,
    `language cues: ${language}`,
    visualStyle,
    "YouTube cover art, 16:9 composition, centered focal point"
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
};

const requestImage = async (prompt) => {
  const token = process.env[config.apiTokenEnv];
  if (!token) {
    throw new Error(`Missing ${config.apiTokenEnv} environment variable.`);
  }

  const payload = {
    inputs: prompt,
    options: { wait_for_model: true },
    parameters: {
      width: config.image.width,
      height: config.image.height,
      num_inference_steps: config.image.steps
    }
  };

  const response = await fetch(`${config.apiBaseUrl}/${config.model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Image request failed (${response.status}): ${detail}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const run = async () => {
  const inputJsonl = resolvePath(config.inputJsonl);
  const outputDir = resolvePath(config.outputDir);
  ensureDir(outputDir);

  const jobs = readJobs(inputJsonl);
  if (jobs.length === 0) {
    console.log("No image jobs found.");
    return;
  }

  if (dryRun) {
    console.log(`Dry run: ${jobs.length} image job(s) loaded from ${inputJsonl}.`);
    return;
  }

  for (const job of jobs) {
    const prompt = buildPrompt(job);
    const filename = job.outputName ?? `${job.slug ?? "cover"}.png`;
    const outputPath = path.join(outputDir, filename);

    let attempt = 0;
    while (attempt < config.retry.attempts) {
      try {
        const imageBuffer = await requestImage(prompt);
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`Saved image: ${outputPath}`);
        break;
      } catch (error) {
        attempt += 1;
        if (attempt >= config.retry.attempts) {
          console.error(`Failed to generate image for ${filename}: ${error.message}`);
          break;
        }
        await sleep(config.retry.backoffMs * attempt);
      }
    }
  }
};

run();
