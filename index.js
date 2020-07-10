const hacss = require("@hacss/core");
const path = require("path");
const globby = require("globby");
const { promisify } = require("util");
const readFile = promisify(require("fs").readFile);

const loadConfig = filePath => {
  if (filePath) {
    return require(path.join(process.cwd(), filePath));
  }

  try {
    return loadConfig("hacss.config.js");
  } catch (e) {
    if (
      e.code === "MODULE_NOT_FOUND" &&
      (e.requireStack || [])[0] === __filename
    ) {
      return {};
    }
    throw e;
  }
};

const loadSources = async globs => {
  const paths = await globby(globs);
  const sources = await Promise.all(paths.map(async p => readFile(p, "utf8")));
  return sources.join(" ");
};

module.exports = async ({ sources, config }, ctx) => {
  const result = await hacss(await loadSources(sources), loadConfig(config));

  if (ctx && ctx.webpack) {
    result.code = result.css;

    if (result.ignored && result.ignored.length) {
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
  }

  return result;
};
