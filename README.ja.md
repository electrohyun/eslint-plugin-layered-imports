<p align="center">
  <img src="https://raw.githubusercontent.com/electrohyun/eslint-plugin-layered-imports/main/assets/logo.png" alt="eslint-plugin-layered-imports logo" width="180" />
</p>

<h1 align="center" style="border-bottom: none;">
    <code>eslint-plugin-layered-imports</code>
</h1>

<p align="center">
  FSD などのレイヤードフロントエンドアーキテクチャで、import を読みやすいグループに整理するための ESLint プラグインです。
</p>

<p align="center">
  <a href="./README.md">🌐 English</a> |
  <a href="./README.ko.md">🇰🇷 한국어</a> |
  🇯🇵 日本語 |
  <a href="./README.zh-CN.md">🇨🇳 简体中文</a>
</p>

## Why?

レイヤードフロントエンドアーキテクチャは、チームが依存関係を管理するうえで役立ちます。しかし、import セクションはすぐに複雑になり、一貫性を失いやすくなります。

このプラグインは、import をインポート元の種類ごとにグループ化し、グループ間に読みやすい空行ルールを適用することで、import をより把握しやすくすることを目指しています。

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

### FSD プリセットで素早く始める

レイヤードフロントエンドプロジェクトに適したデフォルト設定でプラグインを有効化するには、FSD 向けのプリセットを使用できます。

このプリセットは `@/` import を内部 import として扱い、トップレベルのグループを `builtin`, `external`, `internal`, `relative` の順に並べます。また、内部 import は一般的な FSD レイヤー順である `app`, `pages`, `widgets`, `features`, `entities`, `shared` の順に並べます。

```js
import layeredImports from "eslint-plugin-layered-imports";

export default [layeredImports.configs.fsd];
```

このプリセットは、以下のデフォルトオプションでルールを有効化することと同等です。

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

プリセットの後ろに別の config オブジェクトを追加することで、デフォルト設定を上書きできます。

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

### Manual flat config 設定

FSD プリセットを使用しない場合や、すべてのオプションを自分で設定したい場合は、手動設定を使用できます。

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

オプションを指定する例は次のとおりです。

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

異なる import グループの間に空行を要求します。

デフォルトのグループは次のとおりです。

- `builtin`: `node:path` や `fs` などの Node.js 組み込みモジュール
- `external`: `react` や `clsx` などの npm パッケージ import
- `internal`: `@/shared/ui` などのプロジェクト内部 alias import
- `relative`: `./helper` や `../lib/helper` などの相対パス import

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

`internalLayerOrder` を使用すると、内部 import をレイヤー順に並べることもできます。

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

| Option               | Type                                                         | Default                                           | Description                                        |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------- |
| `internalAliases`    | `string[]`                                                   | `["@/"]`                                          | 内部 import として扱うインポート元の prefix です。 |
| `groups`             | `Array<"builtin" \| "external" \| "internal" \| "relative">` | `["builtin", "external", "internal", "relative"]` | トップレベルの import グループ順です。             |
| `internalLayerOrder` | `string[]`                                                   | `undefined`                                       | `internal` グループ内で使用する任意の順序です。    |

##### `internalAliases`

Type: `string[]`

Default: `["@/"]`

どの import 元の prefix を `internal` グループとして扱うかを設定します。

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

設定された alias は prefix としてマッチします。`@tanstack/react-query` のような scoped package が外部パッケージとして扱われるように、広すぎる `@` prefix ではなく、`@/` や `@app/` のような具体的な prefix を使うことをおすすめします。

##### `groups`

Type: `Array<"builtin" | "external" | "internal" | "relative">`

Default: `["builtin", "external", "internal", "relative"]`

期待される import グループの順序を設定します。配列には各グループを正確に 1 回ずつ含める必要があります。

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

設定上あとに来るべきグループが、先に来るべきグループより前に現れた場合、その import が報告されます。

##### `internalLayerOrder`

Type: `string[]`

Default: `undefined`

`internal` グループ内で使用する任意の順序を設定します。このルールは、マッチした `internalAliases` prefix を取り除いたあと、最初のパス segment を内部レイヤーとして読み取り、既知のレイヤーをこの配列の順序に従って並べます。

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

たとえば、`@/shared/ui/button` は `shared` レイヤーとして扱われます。既知のレイヤーは、未知の内部パスより前に並べられます。未知の内部パス同士は、既存の記述順を維持します。同じ既知のレイヤー内の import は、import パスを基準に並べられます。

#### Autofix behavior

このルールは、安全に修正できる import グループ順の違反を自動修正できます。import が同じ連続した import ブロック内にある場合、`--fix` は設定された `groups` の順序に従って import を並べ替え、グループ間の空行を一貫した形に整えます。

```bash
npx eslint . --fix
```

```ts
import helper from "./helper";
import React from "react";
```

上のコードは次のように修正されます。

```ts
import React from "react";

import helper from "./helper";
```

自動修正は、安全性のために保守的に動作します。

- import ではない文をまたいで import を移動しません。
- `import "./setup";` のように値を取り込まず、実行時の効果だけを持つ side-effect import を含む import ブロックは並べ替えません。
- import の直前に付いているコメントは、その import と一緒に移動します。
- 同じグループ内の import は、内部 import に `internalLayerOrder` が設定されている場合を除き、既存の順序を維持します。

#### Limitations

- このルールは静的な `import` 宣言のみを扱います。
- 1 つの import 宣言内にある named specifier は並べ替えません。
- `internalLayerOrder` は、マッチした内部 alias の後ろにある最初のパス segment を読み取ります。たとえば、`@/shared/ui/button` は `shared` レイヤーとして扱われます。
- 未知の内部レイヤーは既知のレイヤーの後ろに配置され、既存の記述順を維持します。
