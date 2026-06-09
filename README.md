# eslint-plugin-layered-imports

ESLint plugin for organizing imports into readable groups, useful for FSD and other layered frontend architectures.

## Why?

Layered frontend architectures help teams manage dependencies, but import sections can quickly become noisy and inconsistent.

This plugin aims to make imports easier to scan by grouping them by source type and enforcing readable spacing between groups.

## Example

```ts
import React from "react";
import { clsx } from "clsx";

import { userApi } from "@/entities/user";
import { Button } from "@/shared/ui";

import styles from "./style.module.css";
import { helper } from "../lib/helper";
```

## Roadmap

- [ ] Add `import-spacing` rule
- [ ] Support configurable layer order
- [ ] Add auto-fix support
- [ ] Add FSD-friendly preset
