#!/usr/bin/env node
/**
 * Exportiert data/articles.jsonl nach dashboard/public/articles.json
 * (schlank für Cloudflare Workers: max. 25 MiB pro Asset)
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const input = join(root, "data", "articles.jsonl");
const output = join(__dirname, "..", "public", "articles.json");
const MAX_PLAINTEXT_CHARS = 800;

function slimArticle(article) {
  const hasParty =
    article.party_analysis?.has_party_mention ||
    (article.party_analysis?.parties_mentioned?.length ?? 0) > 0;

  return {
    url: article.url,
    title: article.title ?? null,
    publishing_date: article.publishing_date ?? null,
    authors: article.authors ?? [],
    topics: article.topics ?? [],
    summary: article.summary ?? null,
    plaintext:
      hasParty && article.plaintext
        ? article.plaintext.slice(0, MAX_PLAINTEXT_CHARS)
        : null,
    party_analysis: article.party_analysis ?? {
      has_party_mention: false,
      parties_mentioned: [],
      mentions: [],
      party_summary: {},
      targeted_sentiment: null,
    },
  };
}

mkdirSync(dirname(output), { recursive: true });

const raw = readFileSync(input, "utf-8");
const articles = raw
  .split("\n")
  .filter((line) => line.trim())
  .map((line) => slimArticle(JSON.parse(line)));

writeFileSync(output, JSON.stringify(articles));
const sizeMb = (Buffer.byteLength(JSON.stringify(articles)) / 1024 / 1024).toFixed(2);
console.log(`Exported ${articles.length} articles (${sizeMb} MiB) → ${output}`);
