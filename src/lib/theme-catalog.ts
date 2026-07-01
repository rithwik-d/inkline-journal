import type { Theme } from "@/lib/types";

export const themeCatalog = [
  {
    slug: "grief",
    name: "Grief",
    count: 28,
    gradient: ["#E8C5C0", "#C2956B"] as [string, string],
    description: "Losses we carry, named and unnamed.",
    longDescription:
      "Grief is rarely linear. These stories sit with loss and refuse the pressure to resolve it neatly.",
  },
  {
    slug: "family",
    name: "Family",
    count: 41,
    gradient: ["#F1D9CC", "#C9B99A"] as [string, string],
    description: "Inheritance, distance, return.",
    longDescription:
      "What gets passed down, what gets left, what gets renamed. The people who made us, and what we are still making of them.",
  },
  {
    slug: "identity",
    name: "Identity",
    count: 37,
    gradient: ["#D7E3CE", "#7D9B76"] as [string, string],
    description: "Becoming, unbecoming, naming yourself.",
    longDescription:
      "Coming into a self. Letting one go. The quiet rebellions and the loud ones.",
  },
  {
    slug: "healing",
    name: "Healing",
    count: 33,
    gradient: ["#E8E1D5", "#A8C0A0"] as [string, string],
    description: "The long, ordinary work of repair.",
    longDescription:
      "Not the inspirational arc. The slow, uneven, deeply specific work of getting better.",
  },
  {
    slug: "migration",
    name: "Migration",
    count: 19,
    gradient: ["#F5E6D3", "#C2654A"] as [string, string],
    description: "Leaving, arriving, the in-between.",
    longDescription:
      "The places we left and the ones we tried to make home. The languages that fit and the ones that did not.",
  },
  {
    slug: "first-love",
    name: "First Love",
    count: 24,
    gradient: ["#F8E8EE", "#E88AAB"] as [string, string],
    description: "The shape it left in you.",
    longDescription:
      "Not nostalgic. Just true. The first time someone changed the temperature of a room you were in.",
  },
  {
    slug: "friendship",
    name: "Friendship",
    count: 22,
    gradient: ["#E8C07A", "#A0522D"] as [string, string],
    description: "The chosen ones, the ones who left.",
    longDescription:
      "The friendships that held. The ones that quietly dissolved. The ones that came back, different.",
  },
  {
    slug: "failure",
    name: "Failure",
    count: 15,
    gradient: ["#DCD4C7", "#6B5849"] as [string, string],
    description: "Quiet collapses, what they taught.",
    longDescription:
      "Not as a stepping stone. As a thing that happened. As something to be honest about.",
  },
  {
    slug: "motherhood",
    name: "Motherhood",
    count: 18,
    gradient: ["#F4D5C5", "#C45C7C"] as [string, string],
    description: "Becoming someone's person.",
    longDescription:
      "All the parts of it. The wonder, the boredom, the rage, the grace.",
  },
  {
    slug: "faith",
    name: "Faith",
    count: 11,
    gradient: ["#EDE5D2", "#8B7355"] as [string, string],
    description: "What you keep believing in, anyway.",
    longDescription:
      "Religious, secular, complicated. The things we hold on to when we cannot explain why.",
  },
];

export function getThemeBySlug(slug: string) {
  return themeCatalog.find((theme) => theme.slug === slug);
}

export const themeFallbackList: Theme[] = themeCatalog.map((theme, index) => ({
  slug: theme.slug,
  name: theme.name,
  description: theme.description,
  longDescription: theme.longDescription,
  gradientFrom: theme.gradient[0],
  gradientTo: theme.gradient[1],
  sortOrder: index + 1,
}));
