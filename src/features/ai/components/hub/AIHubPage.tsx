"use client";

import Link from "next/link";

const FEATURES = [
  {
    title: "Character Chat",
    description:
      "Converse directly with characters based on their personality up to a specific chapter.",
    icon: "forum",
    accentBg: "bg-primary/10",
    accentText: "text-primary",
    href: "/ai/character-chat",
  },
  {
    title: "Group Chat",
    description:
      "Create crossover scenarios by inviting characters from different novels into one conversation.",
    icon: "groups",
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-500",
    href: "/ai/group-chat",
  },
  {
    title: "Relationship Graph",
    description:
      "Visualize complex character connections, sect affiliations, and hidden betrayals.",
    icon: "hub",
    accentBg: "bg-blue-500/10",
    accentText: "text-blue-500",
    href: "/ai/relationship-graph",
  },
  {
    title: "Event Timeline",
    description:
      "Keep track of chronological events, historical eras, and major narrative arcs.",
    icon: "timeline",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-500",
    href: "/ai/event-timeline",
  },
  {
    title: "Concept Index",
    description:
      "Auto-generated encyclopedia for world-building terms, cultivation realms, and items.",
    icon: "menu_book",
    accentBg: "bg-rose-500/10",
    accentText: "text-rose-500",
    href: "/ai/concept-index",
  },
  {
    title: "Story Q&A",
    description:
      "Ask questions about plot holes, forgotten details, or lore with cited chapter answers.",
    icon: "psychology_alt",
    accentBg: "bg-indigo-500/10",
    accentText: "text-indigo-500",
    href: "/ai/story-qa",
  },
];

export function AIHubPage() {
  return (
    <div className="w-full max-w-[1300px] px-4 md:px-6 lg:px-8 py-10 mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          AI Features Hub
        </h1>
        <p className="text-base text-slate-500 mt-2">
          Enhance your reading experience with advanced AI tools tailored for
          your favorite web novels.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 h-full flex flex-col"
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${feature.accentBg}`}>
                <span
                  className={`material-symbols-outlined text-xl ${feature.accentText}`}
                >
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {feature.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
              {feature.description}
            </p>

            {/* Preview Area Placeholder */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[120px] flex items-center justify-center">
              <span
                className={`material-symbols-outlined text-4xl ${feature.accentText} opacity-20`}
              >
                {feature.icon}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
