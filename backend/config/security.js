const PRODUCTION_FRONTEND_ORIGIN = 'https://roommate-finder-ashen.vercel.app';
const DEVELOPMENT_FRONTEND_ORIGIN = 'http://localhost:3000';

const parseConfiguredOrigins = (frontendUrls) => frontendUrls
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => {
    let parsedOrigin;
    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error(`Invalid FRONTEND_URL origin: ${origin}`);
    }

    if (
      !['http:', 'https:'].includes(parsedOrigin.protocol) ||
      parsedOrigin.username ||
      parsedOrigin.password ||
      parsedOrigin.pathname !== '/' ||
      parsedOrigin.search ||
      parsedOrigin.hash
    ) {
      throw new Error(`FRONTEND_URL entries must be origins without paths: ${origin}`);
    }

    return parsedOrigin.origin;
  });

const getAllowedOrigins = (
  frontendUrls = process.env.FRONTEND_URL || '',
  nodeEnv = process.env.NODE_ENV
) => {
  const origins = new Set([PRODUCTION_FRONTEND_ORIGIN]);
  if (nodeEnv !== 'production') origins.add(DEVELOPMENT_FRONTEND_ORIGIN);
  parseConfiguredOrigins(frontendUrls).forEach((origin) => origins.add(origin));
  return [...origins];
};

const getHelmetOptions = () => ({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
});

module.exports = {
  getAllowedOrigins,
  getHelmetOptions,
};
