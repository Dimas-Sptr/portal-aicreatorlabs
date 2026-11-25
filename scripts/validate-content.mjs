import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validatePortalData } from "../content-schema.mjs";

const collections = ["resources", "knowledges", "articles"];
const portalData = {};
const errors = [];

for (const collection of collections) {
  const filePath = new URL(`../content/${collection}.json`, import.meta.url);
  try {
    portalData[collection] = JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    errors.push(`${fileURLToPath(filePath)}: ${error.message}`);
  }
}

if (errors.length === 0) {
  errors.push(...validatePortalData(portalData));
}

if (errors.length > 0) {
  console.error("Validasi konten gagal:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `Konten valid: ${portalData.resources.length} resources, ${portalData.knowledges.length} videos, ${portalData.articles.length} articles.`
  );
}
