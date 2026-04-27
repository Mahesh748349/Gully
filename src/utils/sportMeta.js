const sportMeta = {
  Cricket: { icon: "🏏", tint: "#E8F0FF" },
  Football: { icon: "⚽", tint: "#EAFBF1" },
  Badminton: { icon: "🏸", tint: "#FFF3E8" },
  Basketball: { icon: "🏀", tint: "#FFF0EB" },
  Volleyball: { icon: "🏐", tint: "#F4EEFF" },
};

export const getSportMeta = (sport) => sportMeta[sport] || { icon: "🎯", tint: "#EEF2FF" };
