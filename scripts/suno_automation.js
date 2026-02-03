#!/usr/bin/env node

import fs from "fs";
import path from "path";
import process from "process";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const argMap = new Map();
for (let i = 0; i < args.length; i += 1) {
  const key = args[i];
  const value = args[i + 1];
  if (key?.startsWith("--")) {
    argMap.set(key.replace(/^--/, ""), value ?? true);
  }
}

const configPath = argMap.get("config") ?? "config/suno_automation.json";
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

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const waitForSelectorSafe = async (page, selector, timeout) => {
  await page.waitForSelector(selector, { timeout });
};

const fillIfPresent = async (page, selector, value, timeout) => {
  if (value === undefined || value === null) {
    return;
  }
  await waitForSelectorSafe(page, selector, timeout);
  await page.fill(selector, value);
};

const clickIfPresent = async (page, selector, timeout) => {
  await waitForSelectorSafe(page, selector, timeout);
  await page.click(selector);
};

const run = async () => {
  const selectors = config.selectors;
  const timeouts = config.timeouts;
  const inputJsonl = resolvePath(config.inputJsonl);
  const downloadDir = resolvePath(config.downloadDir);

  ensureDir(downloadDir);

  const jobs = readJobs(inputJsonl);
  if (jobs.length === 0) {
    console.log("No jobs found.");
    return;
  }

  if (dryRun) {
    console.log(`Dry run: ${jobs.length} job(s) loaded from ${inputJsonl}.`);
    return;
  }

  const context = await chromium.launchPersistentContext(config.userDataDir, {
    headless: config.headless,
    executablePath: config.chromeExecutablePath,
    slowMo: config.slowMoMs,
    args: config.profileDirectory ? [`--profile-directory=${config.profileDirectory}`] : [],
    acceptDownloads: true
  });

  const page = await context.newPage();
  await page.goto(config.baseUrl, { timeout: timeouts.navigationMs, waitUntil: "domcontentloaded" });

  await clickIfPresent(page, selectors.createButton, timeouts.actionMs);

  for (const job of jobs) {
    await page.goto(config.baseUrl, { timeout: timeouts.navigationMs, waitUntil: "domcontentloaded" });
    await clickIfPresent(page, selectors.createButton, timeouts.actionMs);

    await clickIfPresent(page, selectors.lyricsTab, timeouts.actionMs);
    await fillIfPresent(page, selectors.lyricsInput, job.lyrics, timeouts.actionMs);

    await clickIfPresent(page, selectors.promptTab, timeouts.actionMs);
    await fillIfPresent(page, selectors.promptInput, job.stylePrompt, timeouts.actionMs);

    await fillIfPresent(page, selectors.titleInput, job.title, timeouts.actionMs);

    await clickIfPresent(page, selectors.generateButton, timeouts.actionMs);

    await waitForSelectorSafe(page, selectors.songListItem, timeouts.songGenerationMs);

    const downloads = [];
    page.on("download", (download) => {
      downloads.push(download);
    });

    await clickIfPresent(page, selectors.downloadButton, timeouts.actionMs);
    await clickIfPresent(page, selectors.downloadMp3Option, timeouts.actionMs);

    if (downloads.length > 0) {
      const download = downloads[downloads.length - 1];
      const suggested = await download.suggestedFilename();
      const target = path.join(downloadDir, suggested);
      await download.saveAs(target);
      console.log(`Downloaded: ${target}`);
    } else {
      console.log(`No download captured for job: ${job.title ?? "untitled"}`);
    }
  }

  await context.close();
};

run();
