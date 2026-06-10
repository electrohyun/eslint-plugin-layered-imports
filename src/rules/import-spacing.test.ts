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

const invalidExternalToInternal = [
  'import React from "react";',
  'import { Button } from "@/shared/ui";',
].join("\n");

const validSameExternalGroup = [
  'import React from "react";',
  'import { clsx } from "clsx";',
].join("\n");

ruleTester.run("import-spacing", rule, {
  valid: [
    {
      code: validExternalToInternal,
    },
    {
      code: validSameExternalGroup,
    },
  ],

  invalid: [
    {
      code: invalidExternalToInternal,
      errors: [{ messageId: "missingBlankLine" }],
    },
  ],
});
