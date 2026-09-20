import { PlayIcon } from "@sanity/icons/Play";
import { defineArrayMember, defineField, defineType } from "sanity";
import { anchorField, asideField, eyebrowField, hiddenField, toneField } from "./shared";

/* A full-width episode player. Each episode is either a video uploaded
   here or a YouTube / Vimeo link, with a still image standing in until
   someone presses play. Visitors page between them with << >>. */
export const episodeReel = defineType({
  name: "episodeReel",
  title: "Episode reel",
  type: "object",
  icon: PlayIcon,
  description: "Full-width video player with << >> between episodes.",
  fields: [
    eyebrowField,
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: "Optional. Left empty, the player fills the section on its own.",
    }),
    asideField,
    defineField({
      name: "episodes",
      title: "Episodes",
      type: "array",
      description: "Each one gets its own frame; visitors move between them with << >>.",
      of: [
        defineArrayMember({
          type: "object",
          name: "episode",
          title: "Episode",
          fields: [
            defineField({
              name: "title",
              title: "Episode name",
              type: "string",
              description: "Printed between the << >> buttons, e.g. Episodes, or Episode 01.",
              validation: (rule) => rule.required().max(48),
            }),
            defineField({
              name: "videoUrl",
              title: "YouTube or Vimeo link",
              type: "url",
              description:
                "Paste the link from the address bar. Nothing loads from them until a visitor presses play.",
              validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "videoFile",
              title: "Or upload a video",
              type: "file",
              description: "An MP4 works everywhere. Used instead of the link above if both are set.",
              options: { accept: "video/*" },
            }),
            defineField({
              name: "poster",
              title: "Still image",
              type: "image",
              description:
                "Shown until someone presses play. Strongly recommended — it is what search engines and slow connections see.",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alternative text",
                  type: "string",
                  description: "Describe the shot for screen readers.",
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title", media: "poster", url: "videoUrl", file: "videoFile.asset" },
            prepare: ({ title, media, url, file }) => ({
              title: title || "Untitled episode",
              subtitle: file ? "Uploaded video" : url ? "Linked video" : "Still image only",
              media,
            }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(12),
    }),
    defineField({
      name: "autoplay",
      title: "Play uploaded videos automatically",
      type: "boolean",
      initialValue: false,
      description:
        "Plays muted and on a loop, like a showreel. Visitors can still pause it, and anyone who asks their device for reduced motion sees the still image instead. Linked videos always wait for a press.",
    }),
    toneField("teal"),
    anchorField,
    hiddenField,
  ],
  preview: {
    select: { title: "title", eyebrow: "eyebrow", count: "episodes.length", media: "episodes.0.poster" },
    prepare: ({ title, eyebrow, count, media }) => ({
      title: title || "Episode reel",
      subtitle: [`${count ?? 0} episode${count === 1 ? "" : "s"}`, eyebrow].filter(Boolean).join(" · "),
      media: media ?? PlayIcon,
    }),
  },
});
