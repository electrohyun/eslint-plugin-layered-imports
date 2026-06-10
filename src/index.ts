import importSpacingRule from "./rules/import-spacing";

const plugin = {
  meta: {
    name: "@electrohyun/eslint-plugin-layered-imports",
    version: "0.0.0",
  },
  rules: {
    "import-spacing": importSpacingRule,
  },
};

export default plugin;
