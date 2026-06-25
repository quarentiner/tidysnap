export const SCENE_TYPES = {
  WARDROBE: "wardrobe",
  BOOKSHELF: "bookshelf",
  CLUTTER: "clutter"
};

export const sceneLabels = {
  [SCENE_TYPES.WARDROBE]: "Cupboard / wardrobe",
  [SCENE_TYPES.BOOKSHELF]: "Bookshelf",
  [SCENE_TYPES.CLUTTER]: "General clutter / desk / storage"
};

export const sceneKeywords = {
  [SCENE_TYPES.WARDROBE]: [
    "wardrobe",
    "closet",
    "cupboard",
    "clothes",
    "clothing",
    "shirt",
    "jacket",
    "drawer"
  ],
  [SCENE_TYPES.BOOKSHELF]: [
    "bookshelf",
    "bookcase",
    "books",
    "shelf",
    "library",
    "novel",
    "reading"
  ],
  [SCENE_TYPES.CLUTTER]: [
    "desk",
    "clutter",
    "storage",
    "garage",
    "table",
    "workspace",
    "mess",
    "box"
  ]
};

export const baseSceneScores = {
  [SCENE_TYPES.WARDROBE]: 5,
  [SCENE_TYPES.BOOKSHELF]: 6,
  [SCENE_TYPES.CLUTTER]: 4
};

export const pointsByAction = {
  "keep-visible": 30,
  "move-to-bins": 40,
  "remove-or-store": 30
};
