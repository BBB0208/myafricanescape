"use client";

/* The Studio, embedded in the Next.js app at /studio
   (app/studio/[[...tool]]/page.tsx). */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId, studioUrl } from "./sanity/env";
import { resolve } from "./sanity/presentation/resolve";
import { SINGLETONS, schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "my-african-escape",
  title: "My African Escape",
  basePath: studioUrl,
  projectId,
  dataset,

  schema: {
    types: schemaTypes,
    // singletons can't be created from the "new document" menu
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },

  document: {
    // …nor duplicated or deleted
    actions: (input, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : input,
  },

  plugins: [
    presentationTool({
      resolve,
      previewUrl: {
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
