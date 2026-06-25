import { SCENE_TYPES } from "./rules.js";

export const cleanupPromptLibrary = {
  global_rules: [
    "Preserve the original room, furniture, perspective, lighting, camera angle, walls, windows, doors, and fixed objects.",
    "Only clean, organize, declutter, and lightly restyle within the same scene.",
    "Do not invent major furniture or change the identity of the room.",
    "Hide loose clutter in visible storage anchors when possible, such as drawers, shelves, bins, cupboards, baskets, or trays.",
    "Keep useful daily objects visible, but make them look intentionally placed.",
    "Make the cleaned result realistic, practical, and lived-in, not staged or overly decorative.",
    "Group similar items together and remove visual noise from main walking, working, and resting zones.",
    "Keep the transformation believable for a real home."
  ],
  categories: [
    {
      id: "desk_workstation",
      name: "Desk / workstation",
      scene_pattern: "Work surface clutter with cables, laptop, monitor, papers, notebooks, chargers, bottles, pouches, stationery, and personal items.",
      prompt_template: "Clean and organize this desk/workstation in a {style_or_mood} style. Preserve the same desk, monitor or laptop position, chair, wall, lighting, camera angle, and room geometry. Remove loose visual clutter from the main work surface, bundle and route cables neatly, stack active documents in one tray, keep only daily-use tools visible, and move small personal items into drawers, trays, or storage boxes. The result should look like the same real workstation after a practical clean-up, not a redesigned office.",
      organization_rules: [
        "Keep the center work zone open.",
        "Group papers into one document tray or neat stack.",
        "Route cables behind the monitor, along the desk edge, or into a cable box.",
        "Put small items into a tray, drawer, pouch, or lidded container.",
        "Keep laptop, monitor, keyboard, mouse, and one useful notebook visible."
      ],
      keep: ["laptop", "monitor", "keyboard", "mouse", "one active notebook", "one pen cup or small tray"],
      remove_or_hide: ["trash", "old receipts", "random wrappers", "extra bottles", "unused loose items"],
      move_to_storage: ["backup cables", "chargers", "stationery overflow", "older papers", "personal accessories"],
      style_variants: ["minimal", "professional", "cozy", "bright", "natural"],
      must_preserve: ["desk shape", "screen positions", "chair location", "wall and floor", "camera angle", "lighting direction"]
    },
    {
      id: "cabinet_shelf_storage",
      name: "Cabinet / shelf / storage unit",
      scene_pattern: "Open shelves or cabinets with books, boxes, bottles, folded items, bags, mixed storage, and uneven stacks.",
      prompt_template: "Clean and organize this cabinet, shelf, or storage unit in a {style_or_mood} style. Preserve the exact shelf structure, cabinet frame, wall, perspective, lighting, and camera angle. Group similar items by shelf, straighten books and boxes, move loose or duplicate items into labeled bins, keep useful display or daily-use items visible, and make shelf spacing look practical and balanced. Do not replace the storage unit or add large new furniture.",
      organization_rules: [
        "Assign one purpose per shelf where possible.",
        "Keep heavier bins or boxes on lower shelves.",
        "Keep daily-use items at eye level.",
        "Straighten vertical items and reduce uneven piles.",
        "Use labels or simple bins for mixed loose storage."
      ],
      keep: ["useful books", "daily-use boxes", "neat containers", "frequent-use supplies"],
      remove_or_hide: ["broken packaging", "expired items", "random loose clutter", "duplicates"],
      move_to_storage: ["low-priority books", "rare-use supplies", "seasonal items", "overflow toiletries", "spare bags"],
      style_variants: ["orderly", "minimal", "warm", "bright", "natural"],
      must_preserve: ["shelf positions", "cabinet size", "wall color", "visible fixed storage", "camera angle", "lighting"]
    },
    {
      id: "clothes_wardrobe",
      name: "Clothes area / wardrobe / hanging clothes",
      scene_pattern: "Clothes hanging, folded piles, wardrobe shelves, laundry, accessories, bags, shoes, and mixed seasonal clothing.",
      prompt_template: "Clean and organize this clothes area or wardrobe in a {style_or_mood} style. Preserve the same wardrobe, hanging rail, shelves, floor area, wall, doors, lighting, and camera angle. Hang current clothes neatly, fold visible piles into clean stacks, move off-season or bulky clothing into labeled bins or vacuum bags, keep daily outfits easy to reach, and remove laundry or worn-out accessories from the visible area. The result should look like the same closet after a realistic sort, not a showroom redesign.",
      organization_rules: [
        "Keep in-season and daily clothes in the easiest reach zone.",
        "Move off-season clothing into labeled bins or vacuum bags.",
        "Fold stacks evenly and keep only a few visible piles.",
        "Create one donate/repair exit bag outside the prime zone.",
        "Keep hangers aligned and separate clothing types."
      ],
      keep: ["in-season clothes", "daily outfits", "light layers", "frequent accessories", "usable shoes"],
      remove_or_hide: ["laundry piles", "worn-out accessories", "broken hangers", "clothes that do not fit"],
      move_to_storage: ["off-season clothes", "bulky jackets", "special occasion clothes", "extra accessories"],
      style_variants: ["minimal", "boutique-like", "bright", "calm", "natural"],
      must_preserve: ["wardrobe frame", "hanging rail", "shelf positions", "doors", "floor area", "camera angle"]
    },
    {
      id: "floor_clutter",
      name: "Floor clutter",
      scene_pattern: "Loose bags, boxes, clothes, toys, papers, cables, bottles, and personal items blocking floor or walking paths.",
      prompt_template: "Clean this floor clutter in a {style_or_mood} style while preserving the same room, floor, furniture positions, wall, lighting, and camera angle. Clear the walking path, move bags and boxes to existing storage edges, group loose items into baskets or bins, remove trash, and leave the floor open and safe. Do not change the room layout or add large furniture.",
      organization_rules: [
        "Open the main walking path first.",
        "Move bags and boxes against an existing wall or into storage.",
        "Group loose items into baskets by category.",
        "Remove trash and packaging.",
        "Keep only one intentional floor object if needed."
      ],
      keep: ["rug", "fixed furniture", "one useful basket", "intentional floor item"],
      remove_or_hide: ["trash", "loose packaging", "random floor piles", "unused bottles"],
      move_to_storage: ["bags", "boxes", "clothes", "toys", "cables", "papers"],
      style_variants: ["open", "calm", "bright", "natural", "simple"],
      must_preserve: ["floor material", "furniture positions", "walls", "doorways", "camera angle", "lighting"]
    },
    {
      id: "hall_living_room",
      name: "Hall / living room",
      scene_pattern: "Shared living space with mixed bags, cushions, clothes, papers, remotes, toys, cables, shoes, and everyday clutter.",
      prompt_template: "Clean and organize this hall or living room in a {style_or_mood} style. Preserve the same sofa, chairs, tables, TV unit, walls, windows, doors, lighting, perspective, and camera angle. Clear the main seating and walking areas, group remote controls and daily-use items into trays, move bags and shoes to storage edges, hide cables, and keep the room looking like a real lived-in home that has just been tidied.",
      organization_rules: [
        "Clear seating surfaces and walkways.",
        "Use trays for remotes and small daily-use items.",
        "Move bags, shoes, and loose clothes to entry or storage zones.",
        "Keep cushions and throws neat but natural.",
        "Hide cables along walls or behind furniture."
      ],
      keep: ["sofa", "chairs", "coffee table", "one tray", "neat cushions", "useful decor"],
      remove_or_hide: ["trash", "extra packaging", "random clothes", "old papers"],
      move_to_storage: ["bags", "shoes", "toys", "cables", "extra blankets", "loose personal items"],
      style_variants: ["cozy", "bright", "natural", "minimal", "family-friendly"],
      must_preserve: ["sofa location", "tables", "TV unit", "windows", "doors", "camera angle", "lighting"]
    },
    {
      id: "bedroom",
      name: "Bedroom",
      scene_pattern: "Bedside clutter, clothes on bed or floor, bags, toiletries, books, chargers, laundry, pillows, and personal items.",
      prompt_template: "Clean and organize this bedroom in a {style_or_mood} style. Preserve the same bed, mattress, headboard, side tables, wardrobe, windows, walls, lighting, and camera angle. Make the bed neatly, clear clothes from the bed and floor, place daily bedside items on a tray or drawer, move laundry to a basket, and store bags or accessories in existing wardrobe or under-bed storage. Keep the result realistic and restful, not hotel-staged.",
      organization_rules: [
        "Make the bed first so it becomes the calm visual anchor.",
        "Move clothes to wardrobe, laundry basket, or folded stack.",
        "Limit bedside surfaces to daily-use items.",
        "Use one tray or drawer for chargers, books, and personal items.",
        "Keep floor edges clear."
      ],
      keep: ["bed", "pillows", "one bedside book", "lamp", "daily charger", "laundry basket"],
      remove_or_hide: ["floor clothes", "random packaging", "old bottles", "unused personal items"],
      move_to_storage: ["bags", "extra clothes", "toiletries", "books", "accessories", "chargers"],
      style_variants: ["calm", "cozy", "bright", "minimal", "soft natural"],
      must_preserve: ["bed position", "side table position", "wardrobe", "windows", "walls", "camera angle", "lighting"]
    },
    {
      id: "table_top_surface",
      name: "Table / top surface",
      scene_pattern: "Dining table, side table, counter-like top, or flat surface covered with papers, dishes, bottles, bags, books, and loose items.",
      prompt_template: "Clean and organize this table or top surface in a {style_or_mood} style. Preserve the same table, surrounding furniture, walls, lighting, camera angle, and room identity. Clear loose clutter from the tabletop, group papers into one stack or tray, move dishes and bottles away, keep only one or two useful visible objects, and make the surface look ready to use while staying realistic.",
      organization_rules: [
        "Clear the center of the surface.",
        "Group papers into one stack or tray.",
        "Move dishes, bottles, and food items to kitchen or storage.",
        "Keep only one intentional daily-use object visible.",
        "Use nearby storage rather than adding new furniture."
      ],
      keep: ["table", "one tray", "one active notebook", "useful decor", "daily-use item"],
      remove_or_hide: ["trash", "dishes", "empty bottles", "random packaging", "old papers"],
      move_to_storage: ["books", "bags", "papers", "toiletries", "small accessories"],
      style_variants: ["clear", "minimal", "warm", "bright", "natural"],
      must_preserve: ["table size", "table position", "chairs", "surrounding furniture", "camera angle", "lighting"]
    },
    {
      id: "balcony_terrace",
      name: "Balcony / terrace",
      scene_pattern: "Outdoor or semi-outdoor area with plants, buckets, tools, laundry, boxes, bottles, floor clutter, and weathered storage.",
      prompt_template: "Clean and organize this balcony or terrace in a {style_or_mood} style. Preserve the same railing, floor, walls, doors, windows, plants, lighting, weather conditions, perspective, and camera angle. Clear loose floor clutter, group plant care tools together, move buckets and boxes to one edge, remove trash, and keep the area open and usable. Do not redesign the balcony or add major outdoor furniture.",
      organization_rules: [
        "Keep the walking path and railing area clear.",
        "Group plant care tools and pots together.",
        "Move buckets and boxes to one side or existing storage.",
        "Remove trash, broken pots, and empty containers.",
        "Keep plants visible but neatly arranged."
      ],
      keep: ["plants", "railing", "outdoor floor", "one tool container", "usable pots"],
      remove_or_hide: ["broken pots", "empty bottles", "trash", "random packaging"],
      move_to_storage: ["buckets", "tools", "soil bags", "extra pots", "cleaning supplies"],
      style_variants: ["fresh", "natural", "bright", "simple", "green"],
      must_preserve: ["railing", "floor", "wall", "door/window", "plants", "camera angle", "lighting"]
    },
    {
      id: "kitchen_counter",
      name: "Kitchen counter",
      scene_pattern: "Kitchen counter or sink area with dishes, bottles, utensils, food packets, appliances, cleaning supplies, and mixed containers.",
      prompt_template: "Clean and organize this kitchen counter in a {style_or_mood} style. Preserve the same counter, cabinets, sink, appliances, backsplash, lighting, perspective, and camera angle. Clear dirty dishes and food packets, group utensils and bottles by use, keep only daily appliances visible, move cleaning supplies to a side caddy or under-sink storage, and make the counter look hygienic, practical, and realistic.",
      organization_rules: [
        "Clear the food prep zone.",
        "Move dirty dishes to sink or drying rack.",
        "Group bottles, utensils, and spices by use.",
        "Keep only daily appliances visible.",
        "Store cleaning supplies under sink or in one caddy."
      ],
      keep: ["sink", "daily appliance", "small drying rack", "one utensil holder", "useful spice group"],
      remove_or_hide: ["dirty dishes", "food wrappers", "empty containers", "trash"],
      move_to_storage: ["extra utensils", "cleaning supplies", "food packets", "spare bottles", "rare-use appliances"],
      style_variants: ["clean", "bright", "hygienic", "natural", "simple"],
      must_preserve: ["counter shape", "cabinet positions", "sink", "appliances", "backsplash", "camera angle", "lighting"]
    },
    {
      id: "general_new_category",
      name: "General new category",
      scene_pattern: "Any cluttered home interior that does not clearly match the existing categories.",
      prompt_template: "Clean and organize this home interior in a {style_or_mood} style. Preserve the same room, furniture, walls, windows, doors, fixed objects, lighting, perspective, and camera angle. Identify the main clutter groups, move loose items to the nearest logical storage anchors, clear walking and working areas, keep only useful visible objects, and make the result look believable, practical, and tidy without changing the room identity.",
      organization_rules: [
        "Match the scene to the closest existing category first.",
        "If no category fits, identify the main room function and clean around that function.",
        "Keep fixed furniture and architecture unchanged.",
        "Group clutter by category before placing it.",
        "Use existing storage anchors before imagining new containers."
      ],
      keep: ["fixed furniture", "useful daily objects", "room-defining items", "one neat tray or container"],
      remove_or_hide: ["trash", "broken items", "loose random clutter", "duplicates"],
      move_to_storage: ["papers", "bags", "cables", "clothes", "personal items", "overflow objects"],
      style_variants: ["realistic", "minimal", "cozy", "bright", "natural"],
      must_preserve: ["room geometry", "furniture positions", "walls", "windows", "doors", "camera angle", "lighting"]
    }
  ],
  expandable_template: {
    matching_rule: "Match new images to the closest category by room function, dominant clutter type, and visible storage anchors before creating a new category.",
    fallback_rule: "If no category clearly fits, use the General new category template and record the new scene pattern for later review.",
    how_to_add_new_category: "Append a new category object with the same fields: id, name, scene_pattern, prompt_template, organization_rules, keep, remove_or_hide, move_to_storage, style_variants, and must_preserve. Do not rewrite existing category objects unless their general behavior is wrong."
  }
};

const categoryKeywords = {
  desk_workstation: ["desk", "workstation", "laptop", "monitor", "keyboard", "mouse", "charger", "cable", "notebook"],
  cabinet_shelf_storage: ["cabinet", "shelf", "storage", "book", "box", "bottle", "unit", "archive"],
  clothes_wardrobe: ["clothes", "wardrobe", "closet", "hanging", "shirt", "jacket", "sweater", "laundry"],
  floor_clutter: ["floor", "walking", "path", "bag on floor", "boxes on floor", "floor clutter"],
  hall_living_room: ["hall", "living", "sofa", "couch", "tv", "remote", "coffee table", "entry"],
  bedroom: ["bed", "bedroom", "pillow", "mattress", "bedsheet", "side table"],
  table_top_surface: ["table", "top surface", "dining", "surface", "counter-like", "tabletop"],
  balcony_terrace: ["balcony", "terrace", "railing", "plants", "pots", "outdoor"],
  kitchen_counter: ["kitchen", "counter", "sink", "utensil", "dishes", "spice", "food packet", "appliance"]
};

export function getCleanupPromptLibrary() {
  return cleanupPromptLibrary;
}

export function getCleanupPromptForAnalysis({
  sceneType,
  fileName = "",
  spatialPlan = null,
  styleOrMood = "natural, realistic, tidy home"
} = {}) {
  const category = findCleanupCategory({
    categoryId: inferCleanupCategoryId({ sceneType, fileName, spatialPlan })
  });

  return {
    category,
    styleOrMood,
    prompt: renderPrompt(category.prompt_template, styleOrMood),
    globalRules: cleanupPromptLibrary.global_rules,
    expandableTemplate: cleanupPromptLibrary.expandable_template
  };
}

export function inferCleanupCategoryId({ sceneType, fileName = "", spatialPlan = null } = {}) {
  if (sceneType === SCENE_TYPES.WARDROBE) {
    return "clothes_wardrobe";
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    return "cabinet_shelf_storage";
  }

  const searchableText = [
    fileName,
    ...(spatialPlan?.detected_issues || []),
    ...(spatialPlan?.organization_plan || []).flatMap((step) => [
      step.action,
      step.destination,
      step.reason
    ])
  ].join(" ").toLowerCase();

  const matches = Object.entries(categoryKeywords).map(([categoryId, keywords]) => ({
    categoryId,
    score: keywords.reduce((total, keyword) => total + (searchableText.includes(keyword) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score);

  if (matches[0]?.score > 0) {
    return matches[0].categoryId;
  }

  return "general_new_category";
}

export function findCleanupCategory({ categoryId }) {
  return cleanupPromptLibrary.categories.find((category) => category.id === categoryId) ||
    cleanupPromptLibrary.categories.find((category) => category.id === "general_new_category");
}

function renderPrompt(template, styleOrMood) {
  return template.replaceAll("{style_or_mood}", styleOrMood);
}
