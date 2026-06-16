<p align="center">
  <img src="https://raw.githubusercontent.com/electrohyun/eslint-plugin-layered-imports/main/assets/logo.png" alt="eslint-plugin-layered-imports logo" width="180" />
</p>

<h1 align="center" style="border-bottom: none;">
    <code>eslint-plugin-layered-imports</code>
</h1>

<p align="center">
  FSD와 같은 레이어드 프론트엔드 아키텍처에서 import를 읽기 쉬운 그룹으로 정리하기 위한 ESLint 플러그인입니다.
</p>

<p align="center">
  <a href="./README.md">🌐 English</a> |
  🇰🇷 한국어 |
  <a href="./README.ja.md">🇯🇵 日本語</a> |
  <a href="./README.zh-CN.md">🇨🇳 简体中文</a>
</p>

## Why?

레이어드 프론트엔드 아키텍처는 팀이 의존성을 관리하는 데 도움을 주지만, import 영역은 금방 복잡하고 일관성 없게 변할 수 있습니다.

이 플러그인은 import를 출처 유형별로 그룹화하고, 그룹 사이에 읽기 쉬운 빈 줄 규칙을 적용하여 import를 더 쉽게 훑어볼 수 있도록 만드는 것을 목표로 합니다.

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

### FSD 프리셋으로 빠르게 시작하기

레이어드 프론트엔드 프로젝트에 적합한 기본 설정으로 플러그인을 활성화하려면 FSD 친화적인 프리셋을 사용할 수 있습니다.

이 프리셋은 `@/` import를 내부 import로 처리하고, 최상위 그룹을 `builtin`, `external`, `internal`, `relative` 순서로 정렬합니다. 또한 내부 import는 일반적인 FSD 레이어 순서인 `app`, `pages`, `widgets`, `features`, `entities`, `shared` 순서로 정렬합니다.

```js
import layeredImports from "eslint-plugin-layered-imports";

export default [layeredImports.configs.fsd];
```

이 프리셋은 아래 기본 옵션으로 규칙을 활성화한 것과 같습니다.

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

프리셋 뒤에 다른 config 객체를 추가하면 기본값을 재정의할 수 있습니다.

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

### Manual flat config 설정

FSD 프리셋을 사용하지 않거나 모든 옵션을 직접 설정하고 싶다면 수동 설정을 사용할 수 있습니다.

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

옵션을 함께 사용하는 예시는 다음과 같습니다.

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

서로 다른 import 그룹 사이에 빈 줄을 요구합니다.

기본 그룹은 다음과 같습니다.

- `builtin`: `node:path` 또는 `fs`와 같은 Node.js 내장 모듈
- `external`: `react` 또는 `clsx`와 같은 npm 패키지 import
- `internal`: `@/shared/ui`와 같은 프로젝트 내부 alias import
- `relative`: `./helper` 또는 `../lib/helper`와 같은 상대 경로 import

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

`internalLayerOrder`를 사용하면 내부 import를 레이어 기준으로 정렬할 수도 있습니다.

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

| Option               | Type                                                         | Default                                           | Description                                      |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------ |
| `internalAliases`    | `string[]`                                                   | `["@/"]`                                          | 내부 import로 처리할 출처 prefix입니다.          |
| `groups`             | `Array<"builtin" \| "external" \| "internal" \| "relative">` | `["builtin", "external", "internal", "relative"]` | 최상위 import 그룹 순서입니다.                   |
| `internalLayerOrder` | `string[]`                                                   | `undefined`                                       | `internal` 그룹 안에서 사용할 선택적 순서입니다. |

##### `internalAliases`

Type: `string[]`

Default: `["@/"]`

어떤 import 출처 prefix를 `internal` 그룹으로 처리할지 설정합니다.

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

설정된 alias는 prefix로 매칭됩니다. `@tanstack/react-query`와 같은 scoped package가 외부 패키지로 유지될 수 있도록, 넓은 `@` prefix 대신 `@/` 또는 `@app/`처럼 구체적인 prefix를 사용하는 것을 권장합니다.

##### `groups`

Type: `Array<"builtin" | "external" | "internal" | "relative">`

Default: `["builtin", "external", "internal", "relative"]`

기대하는 import 그룹 순서를 설정합니다. 배열에는 각 그룹이 정확히 한 번씩 포함되어야 합니다.

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

설정상 뒤에 와야 하는 그룹이 앞에 와야 하는 그룹보다 먼저 나타나면 import가 보고됩니다.

##### `internalLayerOrder`

Type: `string[]`

Default: `undefined`

`internal` 그룹 안에서 사용할 선택적 순서를 설정합니다. 이 규칙은 매칭된 `internalAliases` prefix를 제거한 뒤, 첫 번째 경로 segment를 내부 레이어로 읽고, 알려진 레이어를 이 배열의 순서에 따라 정렬합니다.

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

예를 들어 `@/shared/ui/button`은 `shared` 레이어로 처리됩니다. 알려진 레이어는 알 수 없는 내부 경로보다 앞에 정렬됩니다. 알 수 없는 내부 경로끼리는 기존에 작성된 순서를 유지합니다. 같은 알려진 레이어 안의 import는 import 경로 기준으로 정렬됩니다.

#### Autofix behavior

이 규칙은 안전하게 수정할 수 있는 import 그룹 순서 위반을 자동 수정할 수 있습니다. import들이 하나의 연속된 import 블록 안에 있을 때, `--fix`는 설정된 `groups` 순서에 맞게 import를 재정렬하고 그룹 사이의 빈 줄을 일관되게 정리합니다.

```bash
npx eslint . --fix
```

```ts
import helper from "./helper";
import React from "react";
```

위 코드는 다음과 같이 수정됩니다.

```ts
import React from "react";

import helper from "./helper";
```

자동 수정은 안전성을 위해 보수적으로 동작합니다.

- import가 아닌 구문을 넘어 import를 이동하지 않습니다.
- `import "./setup";`처럼 값을 가져오지 않고 실행 효과만 발생시키는 side-effect import가 포함된 import 블록은 재정렬하지 않습니다.
- import 바로 위에 붙어 있는 주석은 해당 import와 함께 이동합니다.
- 같은 그룹 안의 import는 `internalLayerOrder`가 내부 import에 설정된 경우를 제외하면 기존 순서를 유지합니다.

#### Limitations

- 이 규칙은 정적 `import` 선언만 관리합니다.
- 하나의 import 선언 안에 있는 named specifier는 정렬하지 않습니다.
- `internalLayerOrder`는 매칭되는 내부 alias 뒤의 첫 번째 경로 segment를 읽습니다. 예를 들어 `@/shared/ui/button`은 `shared` 레이어로 처리됩니다.
- 알 수 없는 내부 레이어는 알려진 레이어 뒤에 배치되며, 기존에 작성된 순서를 유지합니다.

## Roadmap

- [x] `import-spacing` 규칙 추가
- [x] 설정 가능한 import 그룹 순서 지원
- [x] 자동 수정 지원 추가
- [x] FSD 친화적인 프리셋 추가
- [x] 선택적 내부 레이어 정렬 지원
