import { builtinModules } from "node:module";
import type { Rule } from "eslint";

type ImportGroup = "builtin" | "external" | "internal" | "relative";

function getImportGroup(source: string): ImportGroup {
  const normalizedSource = source.replace(/^node:/, "");

  if (builtinModules.includes(normalizedSource)) {
    return "builtin";
  }

  if (source.startsWith("@/")) {
    return "internal";
  }

  if (source.startsWith("./") || source.startsWith("../")) {
    return "relative";
  }

  return "external";
}

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Require blank lines between different import groups",
      recommended: false,
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      missingBlankLine:
        "Expected a blank line between different import groups.",
    },
  },

  create(context) {
    return {
      Program(node) {
        const imports = node.body.filter(
          (statement) => statement.type === "ImportDeclaration",
        );

        const importEntries = imports.flatMap((importNode) => {
          const source = importNode.source.value;

          if (typeof source !== "string") {
            return [];
          }

          return [
            {
              node: importNode,
              source,
              group: getImportGroup(source),
            },
          ];
        });

        for (let index = 1; index < importEntries.length; index += 1) {
          const previousImport = importEntries[index - 1];
          const currentImport = importEntries[index];

          if (previousImport.group !== currentImport.group) {
            const previousLocation = previousImport.node.loc;
            const currentLocation = currentImport.node.loc;

            if (!previousLocation || !currentLocation) {
              continue;
            }

            const previousEndLine = previousLocation.end.line;
            const currentStartLine = currentLocation.start.line;
            const hasBlankLine = currentStartLine - previousEndLine > 1;

            if (!hasBlankLine) {
              context.report({
                node: currentImport.node,
                messageId: "missingBlankLine",
                fix(fixer) {
                  return fixer.insertTextBefore(
                    currentImport.node,
                    "\n"
                  );
                }
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
