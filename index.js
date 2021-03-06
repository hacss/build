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
    return loadConfig("hacss.config");
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

module.exports = ({ code, sources, config }) =>
  (code
    ? Promise.resolve(code)
    : globby(sources)
        .then(paths => Promise.all(paths.map(p => readFile(p, "utf8"))))
        .then(code => code.join())
  ).then(code => ({ code: hacss(code, loadConfig(config)) }));
