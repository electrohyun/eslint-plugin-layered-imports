<p align="center">
  <img src="https://raw.githubusercontent.com/electrohyun/eslint-plugin-layered-imports/main/assets/logo.png" alt="eslint-plugin-layered-imports logo" width="180" />
</p>

<h1 align="center" style="border-bottom: none;">
    <code>eslint-plugin-layered-imports</code>
</h1>

<p align="center">
  ESLint plugin for organizing imports into readable groups, useful for FSD and other layered frontend architectures.
</p>

<p align="center">
  🌐 English |
  <a href="./README.ko.md">🇰🇷 한국어</a> |
  <a href="./README.ja.md">🇯🇵 日本語</a> |
  <a href="./README.zh-CN.md">🇨🇳 简体中文</a>
</p>

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

## Installation

```bash
pnpm add -D eslint-plugin-layered-imports
```

```bash
npm install -D eslint-plugin-layered-imports
```

## Usage

### Quick start with the FSD preset

Use the FSD-friendly preset to enable the plugin with sensible defaults for layered frontend projects.

The preset treats `@/` imports as internal imports, orders top-level groups as `builtin`, `external`, `internal`, `relative`, and orders internal imports by the common FSD layer order: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.

```js
import layeredImports from "eslint-plugin-layered-imports";

export default [layeredImports.configs.fsd];
```

The preset is equivalent to enabling the rule with these defaults:

```js
{
  internalAliases: ["@/"],
  groups: ["builtin", "external", "internal", "relative"],
  internalLayerOrder: [
    "app",
    "pages",
    "widgets",
    "features",
    "entities",
    "shared",
  ],
}
```

You can override preset defaults by adding another config object after it.

```js
import layeredImports from "eslint-plugin-layered-imports";

export default [
  layeredImports.configs.fsd,
  {
    rules: {
      "layered-imports/import-spacing": [
        "error",
        {
          internalAliases: ["@/", "~/"],
        },
      ],
    },
  },
];
```

### Manual flat config setup

Use manual setup when you do not want the FSD preset or want to configure every option yourself.

```js
import layeredImports from "eslint-plugin-layered-imports";

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

With options:

```js
import layeredImports from "eslint-plugin-layered-imports";

export default [
  {
    plugins: {
      "layered-imports": layeredImports,
    },
    rules: {
      "layered-imports/import-spacing": [
        "error",
        {
          internalAliases: ["@/", "~/"],
          groups: ["builtin", "external", "internal", "relative"],
          internalLayerOrder: ["features", "entities", "shared"],
        },
      ],
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

#### Valid and invalid examples

Invalid:

```ts
import helper from "./helper";
import React from "react";
```

Valid:

```ts
import React from "react";

import helper from "./helper";
```

With `internalLayerOrder`, internal imports can also be ordered by layer.

Invalid:

```ts
import { Button } from "@/shared/ui/button";
import { UserCard } from "@/entities/user";
import { LoginForm } from "@/features/auth";
```

Valid:

```ts
import { LoginForm } from "@/features/auth";
import { UserCard } from "@/entities/user";
import { Button } from "@/shared/ui/button";
```

#### Options

| Option               | Type                                                         | Default                                           | Description                                  |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------- |
| `internalAliases`    | `string[]`                                                   | `["@/"]`                                          | Source prefixes treated as internal imports. |
| `groups`             | `Array<"builtin" \| "external" \| "internal" \| "relative">` | `["builtin", "external", "internal", "relative"]` | Top-level import group order.                |
| `internalLayerOrder` | `string[]`                                                   | `undefined`                                       | Optional order inside the `internal` group.  |

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
      "layered-imports/import-spacing": [
        "error",
        {
          internalAliases: ["@/", "~/", "@app/"],
        },
      ],
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
      "layered-imports/import-spacing": [
        "error",
        {
          groups: ["builtin", "external", "internal", "relative"],
        },
      ],
    },
  },
];
```

Imports are reported when a later group appears before an earlier configured group.

##### `internalLayerOrder`

Type: `string[]`

Default: `undefined`

Configures an optional order inside the `internal` group. The rule removes the matching `internalAliases` prefix, reads the first path segment as the internal layer, and orders known layers by this array.

```js
export default [
  {
    plugins: {
      "layered-imports": layeredImports,
    },
    rules: {
      "layered-imports/import-spacing": [
        "error",
        {
          internalAliases: ["@/"],
          internalLayerOrder: [
            "app",
            "pages",
            "widgets",
            "features",
            "entities",
            "shared",
          ],
        },
      ],
    },
  },
];
```

For example, `@/shared/ui/button` is treated as the `shared` layer. Known layers are ordered before unknown internal paths. Unknown internal paths keep their existing relative order. Imports in the same known layer are sorted by source path.

#### Autofix behavior

The rule can autofix safe import group order violations. When imports are in the same contiguous import block, `--fix` reorders them by the configured `groups` order and normalizes blank lines between groups.

```bash
npx eslint . --fix
```

```ts
import helper from "./helper";
import React from "react";
```

is fixed to:

```ts
import React from "react";

import helper from "./helper";
```

Autofix is intentionally conservative:

- It does not move imports across non-import statements.
- It does not reorder an import block that contains side-effect imports such as `import "./setup";`.
- Leading comments attached to an import move together with that import.
- Imports inside the same group keep their existing relative order unless `internalLayerOrder` is configured for internal imports.

#### Limitations

- The rule only manages static `import` declarations.
- It does not sort named specifiers inside a single import declaration.
- `internalLayerOrder` reads the first path segment after a matching internal alias. For example, `@/shared/ui/button` is treated as the `shared` layer.
- Unknown internal layers are placed after known layers and keep their existing relative order.
