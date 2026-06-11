import { Linter, Rule } from "eslint";
import importSpacingRule from "./rules/import-spacing";

interface LayeredImportsPlugin {
  meta: {
    name: string;
    version: string;
  };
  rules: {
    "import-spacing": Rule.RuleModule;
  };
  configs: {
    fsd: Linter.Config;
  };
}

const plugin: LayeredImportsPlugin = {
  meta: {
    name: "@electrohyun/eslint-plugin-layered-imports",
    version: "0.0.0",
  },
  rules: {
    "import-spacing": importSpacingRule,
  },
  configs: {
    fsd: {} as Linter.Config,
  },
};

plugin.configs.fsd = {
  plugins: {
    "layered-imports": plugin,
  },
  rules: {
    "layered-imports/import-spacing": [
      "error",
      {
        internalAliases: ["@/"],
        groups: ["builtin", "external", "internal", "relative"],
      },
    ],
  },
};

export default plugin;
