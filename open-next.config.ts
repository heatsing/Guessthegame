import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default (dummy) incremental cache: no R2/D1/DO bindings required.
// Add R2 later if ISR/on-demand revalidation is needed.
export default defineCloudflareConfig();
