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

function getInternalLayer(
  source: string,
  internalAliases: string[],
): string | undefined {
  const alias = internalAliases.find((internalAlias) =>
    source.startsWith(internalAlias),
  );

  if (!alias) {
    return undefined;
  }

  return source.slice(alias.length).split("/")[0];
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
          internalLayerOrder: {
            type: "array",
            items: {
              type: "string",
            },
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
    const sourceCode = context.sourceCode;
    const options = context.options[0];
    const internalAliases =
      options?.internalAliases ?? DEFAULT_INTERNAL_ALIASES;
    const groups = options?.groups ?? DEFAULT_GROUPS;
    const internalLayerOrder = options?.internalLayerOrder;

    return {
      Program(node) {
        const sourceText = sourceCode.getText();
        const imports = node.body.filter(
          (statement) => statement.type === "ImportDeclaration",
        );

        type ImportEntry = {
          node: (typeof imports)[number];
          source: string;
          group: ImportGroup;
        };

        const importEntries: ImportEntry[] = imports.flatMap((importNode) => {
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

        function getImportTextStart(entry: ImportEntry): number {
          const commentsBefore = sourceCode.getCommentsBefore(entry.node);
          let start = entry.node.range![0];
          let expectedEndLine = entry.node.loc!.start.line - 1;

          for (let index = commentsBefore.length - 1; index >= 0; index -= 1) {
            const comment = commentsBefore[index];

            if (!comment.loc || !entry.node.loc) {
              break;
            }

            if (comment.loc.end.line !== expectedEndLine) {
              break;
            }

            start = comment.range![0];
            expectedEndLine = comment.loc.start.line - 1;
          }

          return start;
        }

        function getImportText(entry: ImportEntry): string {
          return sourceText.slice(
            getImportTextStart(entry),
            entry.node.range![1],
          );
        }

        function buildImportBlockText(entries: ImportEntry[]): string {
          return entries.reduce((text, entry, index) => {
            const importText = getImportText(entry);

            if (index === 0) {
              return importText;
            }

            const previousEntry = entries[index - 1];
            const separator =
              previousEntry.group === entry.group ? "\n" : "\n\n";

            return `${text}${separator}${importText}`;
          }, "");
        }

        function compareImportEntries(
          firstEntry: ImportEntry,
          secondEntry: ImportEntry,
        ): number {
          const firstGroupIndex = groups.indexOf(firstEntry.group);
          const secondGroupIndex = groups.indexOf(secondEntry.group);

          if (firstGroupIndex !== secondGroupIndex) {
            return firstGroupIndex - secondGroupIndex;
          }

          if (
            firstEntry.group !== "internal" ||
            secondEntry.group !== "internal" ||
            !internalLayerOrder
          ) {
            return 0;
          }

          const firstLayer = getInternalLayer(
            firstEntry.source,
            internalAliases,
          );
          const secondLayer = getInternalLayer(
            secondEntry.source,
            internalAliases,
          );
          const firstLayerIndex = firstLayer
            ? internalLayerOrder.indexOf(firstLayer)
            : -1;
          const secondLayerIndex = secondLayer
            ? internalLayerOrder.indexOf(secondLayer)
            : -1;
          const isFirstKnownLayer = firstLayerIndex !== -1;
          const isSecondKnownLayer = secondLayerIndex !== -1;

          if (isFirstKnownLayer && isSecondKnownLayer) {
            if (firstLayerIndex !== secondLayerIndex) {
              return firstLayerIndex - secondLayerIndex;
            }

            return firstEntry.source.localeCompare(secondEntry.source);
          }

          if (isFirstKnownLayer !== isSecondKnownLayer) {
            return isFirstKnownLayer ? -1 : 1;
          }

          return 0;
        }

        const entryByNode = new Map(
          importEntries.map((entry) => [entry.node, entry]),
        );
        const importBlocks: (typeof importEntries)[] = [];
        let currentBlock: typeof importEntries = [];

        for (const statement of node.body) {
          if (statement.type === "ImportDeclaration") {
            const entry = entryByNode.get(statement);

            if (entry) {
              currentBlock.push(entry);
            }

            continue;
          }

          if (currentBlock.length > 0) {
            importBlocks.push(currentBlock);
            currentBlock = [];
          }
        }

        // Flush the final block when the file ends with imports.
        if (currentBlock.length > 0) {
          importBlocks.push(currentBlock);
        }

        // Keep the furthest group we've seen so imports cannot move back to an earlier group.
        let highestSeenGroupIndex = groups.indexOf(importEntries[0]?.group);
        const reportedOrderBlocks = new Set<typeof importEntries>();

        for (let index = 1; index < importEntries.length; index += 1) {
          const previousImport = importEntries[index - 1];
          const currentImport = importEntries[index];

          const currentGroupIndex = groups.indexOf(currentImport.group);
          const hasUnexpectedOrder =
            currentGroupIndex < highestSeenGroupIndex ||
            compareImportEntries(previousImport, currentImport) > 0;

          if (hasUnexpectedOrder) {
            const currentImportBlock = importBlocks.find((block) =>
              block.includes(currentImport),
            );
            const previousImportBlock = importBlocks.find((block) =>
              block.includes(previousImport),
            );

            if (
              !currentImportBlock ||
              !reportedOrderBlocks.has(currentImportBlock)
            ) {
              if (currentImportBlock) {
                reportedOrderBlocks.add(currentImportBlock);
              }

              if (
                !currentImportBlock ||
                currentImportBlock !== previousImportBlock ||
                currentImportBlock.some(
                  (entry) => entry.node.specifiers.length === 0,
                )
              ) {
                context.report({
                  node: currentImport.node,
                  messageId: "unexpectedGroupOrder",
                });
              } else {
                context.report({
                  node: currentImport.node,
                  messageId: "unexpectedGroupOrder",
                  fix(fixer) {
                    const sortedImports = [...currentImportBlock].sort(
                      compareImportEntries,
                    );

                    const fixedText = buildImportBlockText(sortedImports);

                    return fixer.replaceTextRange(
                      [
                        getImportTextStart(currentImportBlock[0]),
                        currentImportBlock[currentImportBlock.length - 1].node
                          .range![1],
                      ],
                      fixedText,
                    );
                  },
                });
              }
            }
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
