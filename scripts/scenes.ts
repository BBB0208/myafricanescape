/* The two extra frames each listing gets in the seed, keyed by its main
   scene — so the << >> buttons have something to page through until real
   photos are uploaded. Shared by seed.ts and migrate-redesign.ts. */
export const MORE_SCENES: Record<string, [string, string]> = {
  skyline: ["river", "desert"],
  riad: ["desert", "savanna"],
  coast: ["lake", "savanna"],
  savanna: ["vineyard", "coast"],
  vineyard: ["savanna", "river"],
  desert: ["riad", "skyline"],
  river: ["skyline", "lake"],
  lake: ["coast", "river"],
};
