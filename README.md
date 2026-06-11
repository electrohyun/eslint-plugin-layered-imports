# eslint-plugin-layered-imports

ESLint plugin for organizing imports into readable groups, useful for FSD and other layered frontend architectures.

## Why?

Layered frontend architectures help teams manage dependencies, but import sections can quickly become noisy and inconsistent.

This plugin aims to make imports easier to scan by grouping them by source type and enforcing readable spacing between groups.

## Example

```ts
import path from "node:path";

import React from "react";
import { clsx } from "clsx";

import { userApi } from "@/entities/user";
import { Button } from "@/shared/ui";

import styles from "./style.module.css";
import { helper } from "../lib/helper";
```

## Usage

```js
import layeredImports from "@electrohyun/eslint-plugin-layered-imports";

export default [
  {
    plugins: {
      "layered-imports": layeredImports,
    },
    rules: {
      "layered-imports/import-spacing": "error",
    },
  },
];
```

## Rules

### `import-spacing`

Requires a blank line between different import groups.

The initial groups are:

- `builtin`: Node.js built-in modules such as `node:path` or `fs`
- `external`: npm package imports such as `react` or `clsx`
- `internal`: project-local alias imports such as `@/shared/ui`
- `relative`: relative imports such as `./helper` or `../lib/helper`

#### Options

##### `internalAliases`

Type: `string[]`

Default: `["@/"]`

Configures which import source prefixes should be treated as the `internal` group.

```js
export default [
  {
    plugins: {
      "layered-imports": layeredImports,
    },
    rules: {
      "layered-imports/import-spacing": ["error", {
        internalAliases: ["@/", "~/", "@app/"],
      }],
    },
  },
];
```

Configured aliases are matched as prefixes. Use specific prefixes such as `@/` or `@app/` instead of a broad `@` prefix so scoped packages such as `@tanstack/react-query` remain external.

##### `groups`

Type: `Array<"builtin" | "external" | "internal" | "relative">`

Default: `["builtin", "external", "internal", "relative"]`

Configures the expected order of import groups. The array must include each group exactly once.

```js
export default [
  {
    plugins: {
      "layered-imports": layeredImports,
    },
    rules: {
      "layered-imports/import-spacing": ["error", {
        groups: ["builtin", "external", "internal", "relative"],
      }],
    },
  },
];
```

Imports are reported when a later group appears before an earlier configured group. This option does not move imports automatically.

## Roadmap

- [x] Add `import-spacing` rule
- [x] Support configurable import group order
- [x] Add auto-fix support
- [ ] Add FSD-friendly preset
