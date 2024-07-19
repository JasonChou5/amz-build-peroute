const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const init = () => {
  const envOverride = dotenv.parse(fs.readFileSync(path.join(process.cwd(), ".env.development")));
  process.env = { ...process.env, ...envOverride };
  dotenv.config();
  process.env.___ENV_USER_DEFINED___ = dotenv.config().parsed;
};

const reload = () => {
  dotenv.config({ override: true });
};

module.exports.init = init;
module.exports.init = reload;

module.exports = {
  init,
  reload,
};
