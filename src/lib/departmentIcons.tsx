import {
  Briefcase,
  Church,
  Clapperboard,
  Cpu,
  GraduationCap,
  Landmark,
  MessageSquareQuote,
  Newspaper,
  PiggyBank,
  Rocket,
  Users,
  type LucideIcon,
} from "lucide-react";

// One icon per department (matched by slug). Unknown departments get a newspaper.
const ICONS: Record<string, LucideIcon> = {
  "faith-ministry": Church,
  "business-enterprise": Briefcase,
  "finance-wealth": PiggyBank,
  "media-communications": Clapperboard,
  "education-knowledge": GraduationCap,
  "technology-innovation": Cpu,
  "leadership-governance": Landmark,
  "people-culture": Users,
  "marketplace-careers": Rocket,
  "opinion-analysis": MessageSquareQuote,
};

export function DeptIcon({ slug, size = 16, className }: { slug: string; size?: number; className?: string }) {
  const Icon = ICONS[slug] ?? Newspaper;
  return <Icon size={size} className={className} />;
}
