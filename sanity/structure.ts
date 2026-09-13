import { CalendarIcon } from "@sanity/icons/Calendar";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentIcon } from "@sanity/icons/Document";
import { HomeIcon } from "@sanity/icons/Home";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
      S.divider(),
      S.documentTypeListItem("page").title("Pages").icon(DocumentIcon),
      S.listItem()
        .title("Listings")
        .schemaType("property")
        .icon(HomeIcon)
        .child(
          S.documentTypeList("property")
            .title("Listings")
            .defaultOrdering([{ field: "sortOrder", direction: "asc" }]),
        ),
      S.listItem()
        .title("Events")
        .schemaType("event")
        .icon(CalendarIcon)
        .child(
          S.documentTypeList("event")
            .title("Events")
            .defaultOrdering([{ field: "date", direction: "asc" }]),
        ),
    ]);
