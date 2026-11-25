const COLLECTIONS = ["resources", "knowledges", "articles"];
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const TIME_PATTERN = /^\d{2,}:[0-5]\d$/;
const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const HEX_COLOR_PATTERN = /^#[\da-f]{6}$/i;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseTime(value) {
  if (typeof value !== "string" || !TIME_PATTERN.test(value)) return null;
  const [minutes, seconds] = value.split(":").map(Number);
  return minutes * 60 + seconds;
}

export function validatePortalData(data) {
  const errors = [];
  if (!isRecord(data)) return ["Portal content must be an object."];

  const seenIds = new Map();
  for (const collection of COLLECTIONS) {
    const items = data[collection];
    if (!Array.isArray(items)) {
      errors.push(`${collection} must be an array.`);
      continue;
    }

    items.forEach((item, index) => {
      const path = `${collection}[${index}]`;
      if (!isRecord(item)) {
        errors.push(`${path} must be an object.`);
        return;
      }

      if (!isNonEmptyString(item.id) || !ID_PATTERN.test(item.id)) {
        errors.push(`${path}.id is required and may contain only letters, numbers, and hyphens.`);
      } else if (seenIds.has(item.id)) {
        errors.push(`${path}.id "${item.id}" duplicates ${seenIds.get(item.id)}.`);
      } else {
        seenIds.set(item.id, `${path}.id`);
      }

      const requiredFields = {
        resources: ["title", "category", "level", "description", "summary", "template"],
        knowledges: ["title", "series", "level", "summary"],
        articles: ["title", "excerpt", "readTime", "date"]
      }[collection];
      for (const field of requiredFields) {
        if (!isNonEmptyString(item[field])) {
          errors.push(`${path}.${field} must be a non-empty string.`);
        }
      }

      if (collection === "knowledges") {
        const durationSeconds = parseTime(item.duration);
        if (durationSeconds === null) {
          errors.push(`${path}.duration must use MM:SS format.`);
        }
        if (typeof item.youtubeId !== "string" || !YOUTUBE_ID_PATTERN.test(item.youtubeId)) {
          errors.push(`${path}.youtubeId must be an 11-character YouTube video ID.`);
        }
        if (
          !Array.isArray(item.palette) ||
          item.palette.length !== 2 ||
          item.palette.some((color) => typeof color !== "string" || !HEX_COLOR_PATTERN.test(color))
        ) {
          errors.push(`${path}.palette must contain exactly two six-digit hex colors.`);
        }
        if (!Array.isArray(item.chapters) || item.chapters.length === 0) {
          errors.push(`${path}.chapters must contain at least one chapter.`);
        } else {
          let previousSeconds = -1;
          item.chapters.forEach((chapter, chapterIndex) => {
            const chapterPath = `${path}.chapters[${chapterIndex}]`;
            if (!isRecord(chapter)) {
              errors.push(`${chapterPath} must be an object.`);
              return;
            }

            const parsedTime = parseTime(chapter.time);
            if (parsedTime === null) {
              errors.push(`${chapterPath}.time must use MM:SS format.`);
            }
            if (!Number.isInteger(chapter.seconds) || chapter.seconds < 0) {
              errors.push(`${chapterPath}.seconds must be a non-negative integer.`);
            } else {
              if (parsedTime !== null && chapter.seconds !== parsedTime) {
                errors.push(`${chapterPath}.seconds must match its time value.`);
              }
              if (chapter.seconds <= previousSeconds) {
                errors.push(`${chapterPath}.seconds must be greater than the previous chapter.`);
              }
              if (durationSeconds !== null && chapter.seconds > durationSeconds) {
                errors.push(`${chapterPath}.seconds cannot exceed the video duration.`);
              }
              previousSeconds = chapter.seconds;
            }
            if (!isNonEmptyString(chapter.label)) {
              errors.push(`${chapterPath}.label must be a non-empty string.`);
            }
          });
        }
      }

      if (collection === "articles") {
        if (
          !Array.isArray(item.tags) ||
          item.tags.length === 0 ||
          item.tags.some((tag) => !isNonEmptyString(tag))
        ) {
          errors.push(`${path}.tags must contain at least one non-empty string.`);
        }
        if (
          !Array.isArray(item.content) ||
          item.content.length === 0 ||
          item.content.some((paragraph) => !isNonEmptyString(paragraph))
        ) {
          errors.push(`${path}.content must contain at least one non-empty paragraph.`);
        }
      }
    });
  }

  return errors;
}
