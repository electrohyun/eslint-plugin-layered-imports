import { Linter, RuleTester } from "eslint";
import { describe, expect, it } from "vitest";
import rule from "./import-spacing";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

const schemaValidationCode = 'import React from "react";';

function verifyWithOptions(options: unknown): void {
  const linter = new Linter();

  linter.verify(schemaValidationCode, {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      "layered-imports": {
        rules: {
          "import-spacing": rule,
        },
      },
    },
    rules: {
      "layered-imports/import-spacing": ["error", options],
    },
  });
}

const validExternalToInternal = [
  'import React from "react";',
  "",
  'import { Button } from "@/shared/ui";',
].join("\n");

const validAllInitialGroups = [
  'import path from "node:path";',
  "",
  'import React from "react";',
  "",
  'import { Button } from "@/shared/ui";',
  "",
  'import helper from "./helper";',
].join("\n");

const validSameBuiltinGroup = [
  'import path from "node:path";',
  'import fs from "fs";',
].join("\n");

const validBuiltinToExternal = [
  'import path from "node:path";',
  "",
  'import React from "react";',
].join("\n");

const invalidExternalToInternal = [
  'import React from "react";',
  'import { Button } from "@/shared/ui";',
].join("\n");

const invalidBuiltinToExternal = [
  'import path from "node:path";',
  'import React from "react";',
].join("\n");

const invalidInternalToRelative = [
  'import { Button } from "@/shared/ui";',
  'import helper from "./helper";',
].join("\n");

const validInternalToRelative = [
  'import { Button } from "@/shared/ui";',
  "",
  'import helper from "./helper";',
].join("\n");

const validSameExternalGroup = [
  'import React from "react";',
  'import { clsx } from "clsx";',
].join("\n");

const validUnconfiguredAliasStaysExternal = [
  'import React from "react";',
  'import { Button } from "~/shared/ui";',
].join("\n");

const validSameInternalGroup = [
  'import { userApi } from "@/entities/user";',
  'import { Button } from "@/shared/ui";',
].join("\n");

const validSameRelativeGroup = [
  'import helper from "./helper";',
  'import util from "../util";',
].join("\n");

const invalidCustomAliasExternalToInternal = [
  'import React from "react";',
  'import { Button } from "~/shared/ui";',
].join("\n");

const validCustomAliasExternalToInternal = [
  'import React from "react";',
  "",
  'import { Button } from "~/shared/ui";',
].join("\n");

const invalidRelativeToExternalOrder = [
  'import helper from "./helper";',
  "",
  'import React from "react";',
].join("\n");

const validCustomRelativeToExternalOrder = [
  'import helper from "./helper";',
  "",
  'import React from "react";',
].join("\n");

const invalidCustomExternalToInternalOrder = [
  'import React from "react";',
  "",
  'import { Button } from "@/shared/ui";',
].join("\n");

ruleTester.run("import-spacing", rule, {
  valid: [
    {
      code: validExternalToInternal,
    },
    {
      code: validAllInitialGroups,
    },
    {
      code: validSameBuiltinGroup,
    },
    {
      code: validSameExternalGroup,
    },
    {
      code: validUnconfiguredAliasStaysExternal,
    },
    {
      code: validSameInternalGroup,
    },
    {
      code: validSameRelativeGroup,
    },
    {
      code: validCustomRelativeToExternalOrder,
      options: [
        {
          groups: ["relative", "external", "internal", "builtin"],
        },
      ],
    },
  ],

  invalid: [
    {
      code: invalidBuiltinToExternal,
      output: validBuiltinToExternal,
      errors: [{ messageId: "missingBlankLine" }],
    },
    {
      code: invalidExternalToInternal,
      output: validExternalToInternal,
      errors: [{ messageId: "missingBlankLine" }],
    },
    {
      code: invalidInternalToRelative,
      output: validInternalToRelative,
      errors: [{ messageId: "missingBlankLine" }],
    },
    {
      code: invalidCustomAliasExternalToInternal,
      options: [{ internalAliases: ["~/"] }],
      output: validCustomAliasExternalToInternal,
      errors: [{ messageId: "missingBlankLine" }],
    },
    {
      code: invalidRelativeToExternalOrder,
      errors: [{ messageId: "unexpectedGroupOrder" }],
    },
    {
      code: invalidCustomExternalToInternalOrder,
      options: [
        {
          groups: ["internal", "external", "builtin", "relative"],
        },
      ],
      errors: [{ messageId: "unexpectedGroupOrder" }],
    },
  ],
});

describe("import-spacing options schema", () => {
  it("rejects internalAliases when it is not an array", () => {
    expect(() => verifyWithOptions({ internalAliases: "~/" })).toThrow(
      /should be array/,
    );
  });

  it("rejects internalAliases when an item is not a string", () => {
    expect(() => verifyWithOptions({ internalAliases: [123] })).toThrow(
      /should be string/,
    );
  });

  it("rejects groups when it is not an array", () => {
    expect(() => verifyWithOptions({ groups: "builtin" })).toThrow(
      /should be array/,
    );
  });

  it("rejects groups when an item is not a known import group", () => {
    expect(() =>
      verifyWithOptions({
        groups: ["builtin", "external", "internal", "unknown"],
      }),
    ).toThrow(/allowed values/);
  });

  it("rejects groups when a group is missing", () => {
    expect(() =>
      verifyWithOptions({ groups: ["builtin", "external", "internal"] }),
    ).toThrow(/fewer than 4 items/);
  });

  it("rejects groups when a group is duplicated", () => {
    expect(() =>
      verifyWithOptions({
        groups: ["builtin", "external", "internal", "internal"],
      }),
    ).toThrow(/duplicate items/);
  });

  it("rejects unknown options", () => {
    expect(() => verifyWithOptions({ unknownOption: true })).toThrow(
      /unknownOption/,
    );
  });
});
