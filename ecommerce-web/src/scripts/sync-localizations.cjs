const fs = require("fs");
const path = require("path");

const DEFAULT_SOURCE_LOCALE = "tr";
const LOCALES_DIR = path.join(__dirname, "..", "src", "languages");
const TRANSLATE_ENDPOINT =
  "https://translate.googleapis.com/translate_a/single";
const PLACEHOLDER_REGEX = /<\/?[^>]+>|%\{[^}]+\}|\{[^}]+\}|%%s|%s/g;
const LOCALE_CODE_MAP = {
  nn: "no",
  tw: "zh-TW",
};

function getArgValue(name) {
  const arg = process.argv.find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : undefined;
}

function getLocalePath(localeCode) {
  return path.join(LOCALES_DIR, `${localeCode}.json`);
}

function getTranslateLocaleCode(localeCode) {
  return LOCALE_CODE_MAP[localeCode] || localeCode;
}

function readLocale(localeCode) {
  const localePath = getLocalePath(localeCode);

  if (!fs.existsSync(localePath)) {
    throw new Error(`Locale file not found: ${localePath}`);
  }

  return JSON.parse(fs.readFileSync(localePath, "utf8"));
}

function writeLocale(localeCode, localeData) {
  fs.writeFileSync(
    getLocalePath(localeCode),
    `${JSON.stringify(localeData, null, 4)}\n`,
    "utf8",
  );
}

function buildOrderedLocale(sourceLocale, targetLocale) {
  const orderedLocale = {};

  for (const [key, value] of Object.entries(sourceLocale)) {
    if (Object.prototype.hasOwnProperty.call(targetLocale, key)) {
      orderedLocale[key] = targetLocale[key];
      continue;
    }

    orderedLocale[key] = value;
  }

  for (const [key, value] of Object.entries(targetLocale)) {
    if (!Object.prototype.hasOwnProperty.call(orderedLocale, key)) {
      orderedLocale[key] = value;
    }
  }

  return orderedLocale;
}

function maskText(text) {
  const tokens = [];
  const maskedText = text.replace(PLACEHOLDER_REGEX, (match) => {
    const token = `[[[VP_TOKEN_${tokens.length}]]]`;
    tokens.push({ token, value: match });
    return token;
  });

  return { maskedText, tokens };
}

function unmaskText(text, tokens) {
  return tokens.reduce(
    (result, { token, value }) => result.split(token).join(value),
    text,
  );
}

function normalizeText(text) {
  return text.trim().replace(/\s+/g, " ");
}

async function translateText(text, fromLocaleCode, toLocaleCode) {
  const { maskedText, tokens } = maskText(text);
  const url = new URL(TRANSLATE_ENDPOINT);

  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", getTranslateLocaleCode(fromLocaleCode));
  url.searchParams.set("tl", getTranslateLocaleCode(toLocaleCode));
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", maskedText);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Translation request failed with status ${response.status}`,
    );
  }

  const data = await response.json();
  const translatedText = (data[0] || []).map((item) => item[0]).join("");

  return unmaskText(translatedText, tokens);
}

async function syncLocale(localeCode, sourceLocaleCode, sourceLocale, dryRun) {
  const targetLocale = readLocale(localeCode);
  const missingKeys = Object.keys(sourceLocale).filter(
    (key) => !Object.prototype.hasOwnProperty.call(targetLocale, key),
  );

  if (missingKeys.length === 0) {
    console.log(`${localeCode}.json: up to date`);
    return { added: 0, skipped: 0 };
  }

  console.log(
    `${localeCode}.json: translating ${missingKeys.length} missing keys`,
  );

  if (dryRun) {
    return { added: 0, skipped: 0 };
  }

  let added = 0;
  let skipped = 0;

  for (const key of missingKeys) {
    const sourceText = sourceLocale[key];
    let translatedText;

    try {
      translatedText = await translateText(
        sourceText,
        sourceLocaleCode,
        localeCode,
      );
    } catch (error) {
      skipped += 1;
      console.log(`  skipped ${key}: ${error.message}`);
      continue;
    }

    if (normalizeText(translatedText) === normalizeText(sourceText)) {
      skipped += 1;
      console.log(`  skipped ${key}: translation matches source text`);
      continue;
    }

    targetLocale[key] = translatedText;
    added += 1;
    console.log(`  added ${key}`);
  }

  writeLocale(localeCode, buildOrderedLocale(sourceLocale, targetLocale));

  return { added, skipped };
}

async function main() {
  const sourceLocaleCode = getArgValue("source") || DEFAULT_SOURCE_LOCALE;
  const targetLocaleCode = getArgValue("target");
  const dryRun = process.argv.includes("--dry-run");
  const sourceLocale = readLocale(sourceLocaleCode);
  const localeFiles = fs
    .readdirSync(LOCALES_DIR)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();

  let totalMissingKeys = 0;
  let totalAddedKeys = 0;
  let totalSkippedKeys = 0;

  for (const fileName of localeFiles) {
    const localeCode = path.basename(fileName, ".json");

    if (localeCode === sourceLocaleCode) {
      continue;
    }

    if (targetLocaleCode && localeCode !== targetLocaleCode) {
      continue;
    }

    const targetLocale = readLocale(localeCode);
    const missingKeys = Object.keys(sourceLocale).filter(
      (key) => !Object.prototype.hasOwnProperty.call(targetLocale, key),
    );

    totalMissingKeys += missingKeys.length;

    const result = await syncLocale(
      localeCode,
      sourceLocaleCode,
      sourceLocale,
      dryRun,
    );
    totalAddedKeys += result.added;
    totalSkippedKeys += result.skipped;
  }

  if (dryRun) {
    console.log(`Dry run complete. Total missing keys: ${totalMissingKeys}`);
    return;
  }

  console.log(
    `Sync complete. Added: ${totalAddedKeys}, skipped: ${totalSkippedKeys}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
