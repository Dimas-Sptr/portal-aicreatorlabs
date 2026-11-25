import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validatePortalData } from "../content-schema.mjs";

const portalData = Object.fromEntries(
  await Promise.all(
    ["resources", "knowledges", "articles"].map(async (collection) => [
      collection,
      JSON.parse(await readFile(new URL(`../content/${collection}.json`, import.meta.url), "utf8"))
    ])
  )
);

function copyPortalData() {
  return structuredClone(portalData);
}

test("accepts the current content files", () => {
  assert.deepEqual(validatePortalData(portalData), []);
});

test("rejects missing required fields and duplicate IDs", () => {
  const data = copyPortalData();
  data.resources[0].title = " ";
  data.articles[0].id = data.resources[0].id;

  const errors = validatePortalData(data).join("\n");
  assert.match(errors, /resources\[0\]\.title must be a non-empty string/);
  assert.match(errors, /duplicates resources\[0\]\.id/);
});

test("rejects invalid video IDs, duration, and thumbnail colors", () => {
  const data = copyPortalData();
  data.knowledges[0].youtubeId = "bad-id";
  data.knowledges[0].duration = "14:88";
  data.knowledges[0].palette[0] = "blue";

  const errors = validatePortalData(data).join("\n");
  assert.match(errors, /youtubeId must be an 11-character/);
  assert.match(errors, /duration must use MM:SS format/);
  assert.match(errors, /palette must contain exactly two six-digit hex colors/);
});

test("requires ordered chapter times to match their seconds", () => {
  const data = copyPortalData();
  data.knowledges[0].chapters[1].seconds = 0;

  const errors = validatePortalData(data).join("\n");
  assert.match(errors, /seconds must match its time value/);
  assert.match(errors, /seconds must be greater than the previous chapter/);
});
