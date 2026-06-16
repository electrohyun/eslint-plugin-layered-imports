<p align="center">
  <img src="https://raw.githubusercontent.com/electrohyun/eslint-plugin-layered-imports/main/assets/logo.png" alt="eslint-plugin-layered-imports logo" width="180" />
</p>

<h1 align="center" style="border-bottom: none;">
    <code>eslint-plugin-layered-imports</code>
</h1>

<p align="center">
  一个 ESLint 插件，用于在 FSD 等分层前端架构中，将 import 整理为更易读的分组。
</p>

<p align="center">
  <a href="./README.md">🌐 English</a> |
  <a href="./README.ko.md">🇰🇷 한국어</a> |
  <a href="./README.ja.md">🇯🇵 日本語</a> |
  🇨🇳 简体中文
</p>

## Why?

分层前端架构可以帮助团队管理依赖关系，但 import 区域很容易变得杂乱且不一致。

这个插件的目标是按照 import 来源类型进行分组，并在不同分组之间强制使用易读的空行规则，让 import 更容易浏览和理解。

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

### 使用 FSD preset 快速开始

如果希望使用适合分层前端项目的默认配置启用插件，可以使用 FSD 友好的 preset。

该 preset 会将 `@/` import 视为内部 import，并按照 `builtin`, `external`, `internal`, `relative` 的顺序排列顶层分组。同时，内部 import 会按照常见的 FSD layer 顺序进行排列：`app`, `pages`, `widgets`, `features`, `entities`, `shared`。

```js
import layeredImports from "eslint-plugin-layered-imports";

export default [layeredImports.configs.fsd];
```

该 preset 等同于使用以下默认选项启用规则：

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

可以在 preset 后添加另一个 config 对象来覆盖默认配置。

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

### Manual flat config 设置

如果不想使用 FSD preset，或者希望自己配置所有选项，可以使用手动配置。

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

带选项的示例如下：

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

要求不同 import 分组之间保留空行。

默认分组如下：

- `builtin`: Node.js 内置模块，例如 `node:path` 或 `fs`
- `external`: npm 包 import，例如 `react` 或 `clsx`
- `internal`: 项目内部 alias import，例如 `@/shared/ui`
- `relative`: 相对路径 import，例如 `./helper` 或 `../lib/helper`

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

使用 `internalLayerOrder` 时，内部 import 也可以按 layer 顺序排列。

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

| Option               | Type                                                         | Default                                           | Description                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------- | ----------------------------------- |
| `internalAliases`    | `string[]`                                                   | `["@/"]`                                          | 被视为内部 import 的来源 prefix。   |
| `groups`             | `Array<"builtin" \| "external" \| "internal" \| "relative">` | `["builtin", "external", "internal", "relative"]` | 顶层 import 分组顺序。              |
| `internalLayerOrder` | `string[]`                                                   | `undefined`                                       | `internal` 分组内部可选的排序规则。 |

##### `internalAliases`

Type: `string[]`

Default: `["@/"]`

配置哪些 import 来源 prefix 应被视为 `internal` 分组。

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

配置的 alias 会按 prefix 进行匹配。建议使用 `@/` 或 `@app/` 这类更具体的 prefix，而不是过宽的 `@` prefix，这样 `@tanstack/react-query` 之类的 scoped package 才会继续被视为外部包。

##### `groups`

Type: `Array<"builtin" | "external" | "internal" | "relative">`

Default: `["builtin", "external", "internal", "relative"]`

配置期望的 import 分组顺序。数组中必须准确包含每个分组一次。

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

当配置中应该靠后的分组出现在应该靠前的分组之前时，对应 import 会被报告。

##### `internalLayerOrder`

Type: `string[]`

Default: `undefined`

配置 `internal` 分组内部可选的排序规则。该规则会移除匹配到的 `internalAliases` prefix，然后读取第一个路径 segment 作为内部 layer，并按照此数组对已知 layer 进行排序。

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

例如，`@/shared/ui/button` 会被视为 `shared` layer。已知 layer 会排在未知内部路径之前。未知内部路径之间会保持原有书写顺序。同一个已知 layer 内的 import 会按 import 路径排序。

#### Autofix behavior

该规则可以自动修复可安全处理的 import 分组顺序违规。当 import 位于同一个连续的 import block 中时，`--fix` 会按照配置的 `groups` 顺序重新排列 import，并统一整理分组之间的空行。

```bash
npx eslint . --fix
```

```ts
import helper from "./helper";
import React from "react";
```

会被修复为：

```ts
import React from "react";

import helper from "./helper";
```

自动修复会出于安全性考虑保持保守。

- 不会跨越非 import 语句移动 import。
- 不会重新排列包含 `import "./setup";` 这类 side-effect import 的 import block，因为它们不导入具体值，只产生执行时副作用。
- 紧贴在 import 上方的注释会和对应 import 一起移动。
- 同一分组内的 import 会保持原有顺序，除非为内部 import 配置了 `internalLayerOrder`。

#### Limitations

- 该规则只处理静态 `import` 声明。
- 不会对单个 import 声明内部的 named specifier 进行排序。
- `internalLayerOrder` 会读取匹配的内部 alias 之后的第一个路径 segment。例如，`@/shared/ui/button` 会被视为 `shared` layer。
- 未知内部 layer 会被放在已知 layer 之后，并保持原有书写顺序。
