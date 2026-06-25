const cityProfiles = {
  "New York": { hemisphere: "north", climate: "temperate" },
  "Los Angeles": { hemisphere: "north", climate: "mild" },
  London: { hemisphere: "north", climate: "temperate" },
  Mumbai: { hemisphere: "north", climate: "warm" },
  Sydney: { hemisphere: "south", climate: "temperate" },
  Singapore: { hemisphere: "equator", climate: "warm" }
};

export function getSeasonForCity(city = "New York", now = new Date()) {
  const profile = cityProfiles[city] || cityProfiles["New York"];
  const month = now.getMonth() + 1;
  const season = getSeason(profile.hemisphere, month);

  if (profile.climate === "warm") {
    return {
      city,
      season: "warm",
      recommendation: `Warm-weather rules for ${city}: keep light daily clothes easy to reach.`
    };
  }

  if (season === "summer") {
    return {
      city,
      season,
      recommendation: `Summer rules for ${city}: keep T-shirts and light layers visible.`
    };
  }

  if (season === "winter") {
    return {
      city,
      season,
      recommendation: `Winter rules for ${city}: keep warm layers visible and store light extras.`
    };
  }

  return {
    city,
    season,
    recommendation: `${titleCase(season)} rules for ${city}: keep current-season basics visible.`
  };
}

function getSeason(hemisphere, month) {
  if (hemisphere === "equator") {
    return "warm";
  }

  const northSeason = monthToNorthSeason(month);
  if (hemisphere === "south") {
    return flipSeason(northSeason);
  }
  return northSeason;
}

function monthToNorthSeason(month) {
  if ([12, 1, 2].includes(month)) {
    return "winter";
  }
  if ([3, 4, 5].includes(month)) {
    return "spring";
  }
  if ([6, 7, 8].includes(month)) {
    return "summer";
  }
  return "fall";
}

function flipSeason(season) {
  const flipped = {
    winter: "summer",
    spring: "fall",
    summer: "winter",
    fall: "spring"
  };
  return flipped[season] || season;
}

function titleCase(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
