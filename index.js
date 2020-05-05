const path = require("path");
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

module.exports = async ({ sources, config }) =>
  hacss(await loadSources(sources), loadConfig(config));
