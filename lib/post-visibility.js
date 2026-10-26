const isProductionBuild = () => {
  if (process.env.ELEVENTY_INCLUDE_FUTURE === "true") {
    return false;
  }
  return (
    process.env.NODE_ENV === "production" ||
    process.env.ELEVENTY_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.NETLIFY === "true"
  );
};

const parsePostDate = (input) => {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfUtcDay = (value) => {
  const date = parsePostDate(value);
  if (!date) return null;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const isFutureDate = (value, referenceDate = new Date()) => {
  const publishDay = startOfUtcDay(value);
  const referenceDay = startOfUtcDay(referenceDate);
  if (publishDay === null || referenceDay === null) return false;
  return publishDay > referenceDay;
};

const shouldHideInProduction = (data, referenceDate = new Date()) => {
  const publishDate = data?.date || data?.page?.date;
  const isDraft = Boolean(data?.draft);
  const isFuture = isFutureDate(publishDate, referenceDate);
  return isProductionBuild() && (isDraft || isFuture);
};

const isPublishedPost = (data, referenceDate = new Date()) => {
  const publishDate = data?.date || data?.page?.date;
  const isDraft = Boolean(data?.draft);
  const isFuture = isFutureDate(publishDate, referenceDate);
  return !isDraft && !isFuture;
};

module.exports = {
  isProductionBuild,
  parsePostDate,
  startOfUtcDay,
  isFutureDate,
  shouldHideInProduction,
  isPublishedPost,
};
