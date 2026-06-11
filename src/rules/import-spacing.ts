import { builtinModules } from "node:module";
import type { Rule } from "eslint";

type ImportGroup = "builtin" | "external" | "internal" | "relative";

const DEFAULT_INTERNAL_ALIASES = ["@/"];
const DEFAULT_GROUPS: ImportGroup[] = [
  "builtin",
  "external",
  "internal",
  "relative",
];

function getImportGroup(
  source: string,
  internalAliases: string[],
): ImportGroup {
  const normalizedSource = source.replace(/^node:/, "");

  if (builtinModules.includes(normalizedSource)) {
    return "builtin";
  }

  if (internalAliases.some((alias) => source.startsWith(alias))) {
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
    schema: [
      {
        type: "object",
        properties: {
          internalAliases: {
            type: "array",
            items: {
              type: "string",
            },
          },
          groups: {
            type: "array",
            items: {
              type: "string",
              enum: ["builtin", "external", "internal", "relative"],
            },
            minItems: 4,
            maxItems: 4,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingBlankLine:
        "Expected a blank line between different import groups.",
      unexpectedGroupOrder:
        "Expected import groups to follow the configured order.",
    },
  },

  create(context) {
    const options = context.options[0];
    const internalAliases =
      options?.internalAliases ?? DEFAULT_INTERNAL_ALIASES;
    const groups = options?.groups ?? DEFAULT_GROUPS;

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
              group: getImportGroup(source, internalAliases),
            },
          ];
        });

        // Keep the furthest group we've seen so imports cannot move back to an earlier group.
        let highestSeenGroupIndex = groups.indexOf(importEntries[0]?.group);

        for (let index = 1; index < importEntries.length; index += 1) {
          const previousImport = importEntries[index - 1];
          const currentImport = importEntries[index];

          const currentGroupIndex = groups.indexOf(currentImport.group);

          if (currentGroupIndex < highestSeenGroupIndex) {
            context.report({
              node: currentImport.node,
              messageId: "unexpectedGroupOrder",
            });
          }

          highestSeenGroupIndex = Math.max(
            highestSeenGroupIndex,
            currentGroupIndex,
          );

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
                  return fixer.insertTextBefore(currentImport.node, "\n");
                },
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
