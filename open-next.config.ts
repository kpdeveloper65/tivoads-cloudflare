import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  default: {
    override: {
      wrapper: "cloudflare-pages",
      converter: "edge",
    },
  },
  middleware: {
    external: ["jose", "@panva/hkdf"],
  },
});