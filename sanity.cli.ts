/* Sanity CLI config — used by `npm run seed` and `npm run typegen`. */

import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "u8ld2tbd",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
});
