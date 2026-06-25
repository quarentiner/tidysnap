import { pointsByAction, SCENE_TYPES } from "../data/rules.js";

export function buildRecommendations({ sceneType, season }) {
  if (sceneType === SCENE_TYPES.WARDROBE) {
    return wardrobeActions(season);
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    return bookshelfActions();
  }

  return clutterActions();
}

export function getSuggestedBinLabels({ sceneType, season }) {
  if (sceneType === SCENE_TYPES.WARDROBE) {
    return wardrobeStorage(season).labels;
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    return ["Currently reading", "Keep visible", "Store / archive", "Donate"];
  }

  return ["Daily tools", "Cables and chargers", "Paper to scan", "Donate or discard"];
}

export function getOptionalAccessories({ sceneType, season }) {
  if (sceneType === SCENE_TYPES.WARDROBE) {
    return wardrobeStorage(season).accessories;
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    return ["Bookends", "Shelf labels", "Archive box", "Dust cloth"];
  }

  return ["Small drawer trays", "Cable ties", "Clear bins", "Reusable labels"];
}

export function getVisibleItems({ sceneType, season }) {
  if (sceneType === SCENE_TYPES.WARDROBE) {
    return wardrobeStorage(season).keep;
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    return ["Currently reading books", "High-priority books", "Better-reviewed favorites", "Reference books"];
  }

  return ["Daily-use items", "Active papers", "Current tools", "One catch-all tray"];
}

export function getBeforeAfterPreview({ sceneType }) {
  if (sceneType === SCENE_TYPES.WARDROBE) {
    return {
      before: "Mixed clothes and accessories compete for the same easy-reach space.",
      after: "Current-season clothes stay visible while off-season pieces move into labeled storage."
    };
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    return {
      before: "Books sit in one flat priority level.",
      after: "Reading, visible, archive, and donate groups make the shelf easier to scan."
    };
  }

  return {
    before: "Loose items spread across the main surface.",
    after: "Daily items stay out while duplicates, cables, and old papers leave the work area."
  };
}

export function getOrganizerPlan({ sceneType, season }) {
  if (sceneType === SCENE_TYPES.WARDROBE) {
    const storage = wardrobeStorage(season);
    return {
      title: "Closet organizer map",
      zones: [
        {
          name: "Prime zone",
          place: "Front rail or eye-level shelf",
          use: `Keep ${joinShortList(storage.keep)} here.`
        },
        {
          name: "Storage zone",
          place: "Top shelf, bottom shelf, or back corner",
          use: `Put labeled bins for ${joinShortList(storage.store)} here.`
        },
        {
          name: "Exit zone",
          place: "One bag or basket near the cupboard door",
          use: "Drop donate, repair, and no-fit clothes here."
        }
      ],
      finalLook: "The front of the cupboard should show one clear daily-use section. Off-season clothes should sit in labeled bins away from the main reach area."
    };
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    return {
      title: "Shelf organizer map",
      zones: [
        {
          name: "Reading zone",
          place: "Eye-level shelf, left side",
          use: "Keep currently reading books and one notebook here."
        },
        {
          name: "Visible library",
          place: "Middle shelves",
          use: "Group favorite, useful, and better-reviewed books by topic."
        },
        {
          name: "Archive / exit zone",
          place: "Top shelf, bottom shelf, or one archive box",
          use: "Move low-priority, duplicate, damaged, or finished books here."
        }
      ],
      finalLook: "The shelf should read from left to right: current reading, useful visible books, archive storage, then donate pile."
    };
  }

  return {
    title: "Clutter organizer map",
    zones: [
      {
        name: "Work zone",
        place: "Center of the desk or main surface",
        use: "Keep this mostly empty, with only daily-use items."
      },
      {
        name: "Small-item zone",
        place: "Left side tray, drawer tray, or shallow bin",
        use: "Group cables, chargers, stationery, and tiny loose items."
      },
      {
        name: "Exit zone",
        place: "Box beside the surface",
        use: "Move old papers, duplicates, broken items, and unknown items out."
      }
    ],
    finalLook: "The cleaned space should have an open center, one small tray for active items, and labeled bins away from the main work surface."
  };
}

export function getPhotoGuidance({ confidence = 0, imageMeta = {} }) {
  const needsWiderPhoto = confidence <= 0.55 || imageMeta.unsupportedPreview || !imageMeta.width || !imageMeta.height;

  if (!needsWiderPhoto) {
    return {
      needsBetterPhoto: false,
      title: "",
      tips: []
    };
  }

  return {
    needsBetterPhoto: true,
    title: "Need a wider photo for a smarter organizer plan",
    tips: [
      "Step back and include the full cupboard, shelf, desk, or storage area.",
      "Show the top, bottom, sides, and floor area if possible.",
      "Take the photo in good light and avoid close-up item-only shots.",
      "Use JPG or PNG when possible so the preview can show."
    ]
  };
}

export function getSpatialOrganizationPlan({ sceneType, season }) {
  if (sceneType === SCENE_TYPES.WARDROBE) {
    const storage = wardrobeStorage(season);
    return {
      detected_issues: [
        "Daily clothes and off-season clothes are mixed in the same access zone.",
        "Accessories and repair/donate items do not have a clear exit point.",
        "Prime cupboard space is being used by items that should be binned or vacuum packed."
      ],
      organization_plan: [
        {
          step_number: 1,
          action: `Clear ${joinShortList(storage.keep)} from mixed piles and loose stacks.`,
          destination: "Move them to the front rail, first drawer, or eye-level shelf.",
          reason: "These are current-use items, so they should be visible and reachable without moving other clothes."
        },
        {
          step_number: 2,
          action: `Clear ${joinShortList(storage.store)} from the main cupboard opening.`,
          destination: "Move them to labeled off-season bins on the top shelf, bottom shelf, or back corner.",
          reason: "Off-season clothes do not need daily access, so bins free the best space for this week's outfits."
        },
        {
          step_number: 3,
          action: "Clear worn-out accessories, no-fit clothes, single socks, and broken hangers.",
          destination: "Move them to one exit bag beside the cupboard for donate, repair, or discard.",
          reason: "An exit bag prevents dead items from returning to the cupboard and makes the clean-up finishable."
        }
      ],
      estimated_time_minutes: 15
    };
  }

  if (sceneType === SCENE_TYPES.BOOKSHELF) {
    return {
      detected_issues: [
        "Current reading books are not separated from finished or low-priority books.",
        "Useful books and archive books are competing for the same visible shelf space.",
        "Duplicate, damaged, or low-relevance books need an exit path."
      ],
      organization_plan: [
        {
          step_number: 1,
          action: "Clear currently reading books and high-priority reference books from mixed shelf areas.",
          destination: "Move them to the left side of the eye-level shelf.",
          reason: "Current books should be the fastest to reach and easiest to return."
        },
        {
          step_number: 2,
          action: "Clear finished books, low-priority books, and rarely used manuals from prime shelf space.",
          destination: "Move them to the top shelf, bottom shelf, or one labeled archive box.",
          reason: "Archive books should stay findable without blocking books used this week."
        },
        {
          step_number: 3,
          action: "Clear duplicate, damaged, and low-relevance books from the shelf.",
          destination: "Move them to a donate bag, repair pile, or outbox.",
          reason: "Removing weak books makes the shelf easier to scan and gives important books room to breathe."
        }
      ],
      estimated_time_minutes: 15
    };
  }

  return {
    detected_issues: [
      "The main surface has loose items without a clear home.",
      "Small electronics, cables, papers, and daily tools are mixed together.",
      "Trash, duplicates, or low-use items are still occupying the active work zone."
    ],
    organization_plan: [
      {
        step_number: 1,
        action: "Clear daily-use tools, active papers, and one current notebook from the loose pile.",
        destination: "Move them to the center work zone and one side tray.",
        reason: "Daily items should stay visible, but the center needs enough open space to work."
      },
      {
        step_number: 2,
        action: "Clear cables, chargers, backup supplies, and small accessories from the desk surface.",
        destination: "Move them to a drawer tray, clear bin, or lower shelf labeled by category.",
        reason: "Small items create visual noise unless they are grouped and stored near the place they are used."
      },
      {
        step_number: 3,
        action: "Clear old papers, duplicate tools, broken items, and mystery items.",
        destination: "Move them to trash/recycle, scan pile, donate box, or the room where they belong.",
        reason: "The fastest clean-up is to remove items that do not support the room's main purpose."
      }
    ],
    estimated_time_minutes: 15
  };
}

function wardrobeActions(season) {
  const storage = wardrobeStorage(season);

  return [
    {
      id: "keep-visible",
      type: "keep_visible",
      title: "Keep visible now",
      reason: "Leave only current-season and frequent-use clothes in easy reach.",
      items: storage.keep,
      placement: {
        move: storage.keep,
        where: "Front rail, first drawer, or eye-level shelf.",
        how: "Group by type, then color or use. Put the most-used pieces on the left/front.",
        after: "The first thing you see should be the clothes you can wear this week."
      },
      points: pointsByAction["keep-visible"]
    },
    {
      id: "move-to-bins",
      type: "move_to_bins",
      title: "Move into labeled storage bins",
      reason: "Free prime cupboard space by boxing low-use or off-season pieces.",
      items: storage.store,
      placement: {
        move: storage.store,
        where: "Clear bins on the top shelf, bottom shelf, or back corner.",
        how: "Fold bulky clothes flat, add one label per bin, and keep similar items together.",
        after: "Off-season clothes are still easy to find, but they no longer block daily outfits."
      },
      points: pointsByAction["move-to-bins"]
    },
    {
      id: "remove-or-store",
      type: "remove_donate_store_elsewhere",
      title: "Remove, donate, or store elsewhere",
      reason: "Pull out anything damaged, unused, or blocking daily access.",
      items: ["Worn-out accessories", "Clothes that no longer fit", "Single socks or broken hangers"],
      placement: {
        move: ["Worn-out accessories", "No-fit clothes", "Broken hangers"],
        where: "One exit bag beside the cupboard, not back inside it.",
        how: "Make three small piles: donate, repair, discard. Do not sort beyond that today.",
        after: "The cupboard has fewer dead items and more breathing room around daily clothes."
      },
      points: pointsByAction["remove-or-store"]
    }
  ];
}

function bookshelfActions() {
  return [
    {
      id: "keep-visible",
      type: "keep_visible",
      title: "Keep visible now",
      reason: "Put the most useful and highest-priority books at eye level.",
      items: ["Currently reading", "High-priority reference books", "Better-reviewed favorites"],
      placement: {
        move: ["Currently reading", "High-priority books", "Better-reviewed favorites"],
        where: "Eye-level shelf, starting from the left side.",
        how: "Stand them upright with covers or spines visible. Keep one active-reading gap.",
        after: "The books you actually use are the easiest ones to grab."
      },
      points: pointsByAction["keep-visible"]
    },
    {
      id: "move-to-bins",
      type: "move_to_bins",
      title: "Move into labeled storage bins",
      reason: "Archive books that matter but do not need daily shelf space.",
      items: ["Finished books", "Low-priority books", "Rarely used manuals"],
      placement: {
        move: ["Finished books", "Low-priority books", "Rarely used manuals"],
        where: "Top shelf, bottom shelf, or one labeled archive box.",
        how: "Group by topic or year. Label the box or shelf edge clearly.",
        after: "Important-but-not-current books stay findable without taking prime shelf space."
      },
      points: pointsByAction["move-to-bins"]
    },
    {
      id: "remove-or-store",
      type: "remove_donate_store_elsewhere",
      title: "Remove, donate, or store elsewhere",
      reason: "Clear shelf space by removing duplicates and low-relevance titles.",
      items: ["Duplicate books", "Damaged books", "Books with low current relevance"],
      placement: {
        move: ["Duplicate books", "Damaged books", "Low-relevance books"],
        where: "Donate bag, repair pile, or a separate outbox.",
        how: "Touch each book once. If it is not useful, loved, or needed, move it out.",
        after: "The shelf looks intentional instead of packed edge to edge."
      },
      points: pointsByAction["remove-or-store"]
    }
  ];
}

function clutterActions() {
  return [
    {
      id: "keep-visible",
      type: "keep_visible",
      title: "Keep visible now",
      reason: "Keep only items needed for the next day or current task.",
      items: ["Daily-use tools", "Active notebook or papers", "One small catch-all tray"],
      placement: {
        move: ["Daily-use tools", "Active papers", "One tray"],
        where: "Center work zone and one tray on the side.",
        how: "Keep the center mostly open. Put only daily items in the tray.",
        after: "The main surface has open working space instead of scattered items."
      },
      points: pointsByAction["keep-visible"]
    },
    {
      id: "move-to-bins",
      type: "move_to_bins",
      title: "Move into labeled storage bins",
      reason: "Group loose items by purpose so the surface stays usable.",
      items: ["Cables and chargers", "Backup supplies", "Rarely used accessories"],
      placement: {
        move: ["Cables and chargers", "Backup supplies", "Rarely used accessories"],
        where: "Drawer tray, clear bin, or lower shelf beside the work area.",
        how: "Use one label per group. Coil cables and keep small pieces in pouches.",
        after: "Loose items have a home, and the surface stops collecting random piles."
      },
      points: pointsByAction["move-to-bins"]
    },
    {
      id: "remove-or-store",
      type: "remove_donate_store_elsewhere",
      title: "Remove, donate, or store elsewhere",
      reason: "Take away anything that does not support the room's main use.",
      items: ["Old papers", "Duplicate tools", "Broken or mystery items"],
      placement: {
        move: ["Old papers", "Duplicate tools", "Broken or mystery items"],
        where: "Trash/recycle, scan pile, donate box, or another room where it belongs.",
        how: "Use a 10-minute outbox. Decide only keep, scan, donate, discard.",
        after: "The area looks like a useful work or storage space, not a holding zone."
      },
      points: pointsByAction["remove-or-store"]
    }
  ];
}

function wardrobeStorage(season) {
  if (season.season === "winter") {
    return {
      keep: ["Warm layers", "Sweaters", "Jackets used this week"],
      store: ["T-shirts not used now", "Shorts", "Light summer extras"],
      labels: ["Off-season summer clothes", "Accessories", "Donate / repair"],
      accessories: ["Clear storage bins", "Shelf dividers", "Clip labels", "Vacuum bags for bulky extras"]
    };
  }

  if (season.season === "fall" || season.season === "spring") {
    return {
      keep: ["Light layers", "Everyday tops", "Transitional jackets"],
      store: ["Heavy winter jackets", "Beachwear", "Special-occasion clothes"],
      labels: ["Heavy winter wear", "Summer extras", "Accessories", "Donate / repair"],
      accessories: ["Clear storage bins", "Shelf dividers", "Clip labels", "Vacuum bags"]
    };
  }

  return {
    keep: ["T-shirts", "Light layers", "Daily outfits"],
    store: ["Winter jackets", "Thick sweaters", "Heavy scarves"],
    labels: ["Off-season winter clothes", "Accessories", "Donate / repair"],
    accessories: ["Vacuum bags", "Clear storage bins", "Clip labels", "Slim hangers"]
  };
}

function joinShortList(items) {
  if (items.length <= 2) {
    return items.join(" and ");
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}
