const hacss = require("@hacss/core");
const path = require("path");
const globby = require("globby");
const {
  promises: { readFile },
} = require("fs");

const loadConfig = filePath => {
  if (filePath) {
    return require(path.join(process.cwd(), filePath));
  }

  try {
    return loadConfig("hacss.config.js");
  } catch (_) {
    return {};
  }
};

const loadSources = async globs => {
  const paths = await globby(globs);
  const sources = await Promise.all(paths.map(async p => readFile(p, "utf8")));
  return sources.join(" ");
};

module.exports = async ({ sources, config, verbose }, ctx) => {
  const result = await hacss(await loadSources(sources), loadConfig(config));

  if (ctx.webpack) {
    result.code = result.css;
  }

  if (verbose && result.ignored && result.ignored.length) {
    const logger = ctx.getLogger ? ctx.getLogger() || console : console;

    logger.warn(`
Hacss discarded ${
      result.ignored.length === 1
        ? "a rule due to an error"
        : "some rules due to errors"
    }:
${result.ignored.map(({ className, error }) => `${className} - ${error}`)}
    `);
  }

  return result;
};
