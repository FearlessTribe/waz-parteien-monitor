#!/usr/bin/env node
/**
 * Exportiert data/articles.jsonl nach dashboard/public/articles.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const input = join(root, "data", "articles.jsonl");
const output = join(__dirname, "..", "public", "articles.json");

mkdirSync(dirname(output), { recursive: true });

const raw = readFileSync(input, "utf-8");
const articles = raw
  .split("\n")
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line));

writeFileSync(output, JSON.stringify(articles, null, 0));
console.log(`Exported ${articles.length} articles → ${output}`);
