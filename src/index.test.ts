import { describe, expect, it } from "vitest";
import layeredImports from "./index";

describe("plugin configs", () => {
  it("exports an fsd config", () => {
    expect(layeredImports).toHaveProperty("configs.fsd");
  });

  it("registers the plugin in the fsd config", () => {
    expect(layeredImports).toHaveProperty("configs.fsd.plugins", {
      "layered-imports": layeredImports,
    });
  });

  it("enables import-spacing with FSD-friendly defaults", () => {
    expect(layeredImports).toHaveProperty("configs.fsd.rules", {
      "layered-imports/import-spacing": [
        "error",
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
        },
      ],
    });
  });
});
