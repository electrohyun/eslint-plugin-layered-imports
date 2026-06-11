import { RuleTester } from "eslint";
import rule from "./import-spacing";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

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

const validSameInternalGroup = [
  'import { userApi } from "@/entities/user";',
  'import { Button } from "@/shared/ui";',
].join("\n");

const validSameRelativeGroup = [
  'import helper from "./helper";',
  'import util from "../util";',
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
      code: validSameInternalGroup,
    },
    {
      code: validSameRelativeGroup,
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
  ],
});
