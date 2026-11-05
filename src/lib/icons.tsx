import type { ComponentType } from "react";
import {
  Anchor, Award, BarChart3, BookOpen, Bookmark, Briefcase, Building2, Calendar, Check, CheckCircle2,
  Church, Clock, Cloud, Cpu, Crown, Compass, DollarSign, Flag, Flame, Gem, Gift, Globe, GraduationCap,
  Handshake, Heart, HelpCircle, Home, Info, Key, Lightbulb, Link2, Lock, Mail, MapPin, Megaphone, MessageCircle,
  Mic, Music, Newspaper, PenTool, Phone, PieChart, Play, Rocket, Scale, Search, Shield, Sparkles, Star, Sun,
  Target, ThumbsUp, TrendingUp, Trophy, Users, Video, Wallet, Wifi, Zap, AlertTriangle, ArrowRight,
  Camera, Coins, Landmark, Leaf, Library, Quote, Radio, Smile, Wrench,
} from "lucide-react";

type IconComp = ComponentType<{ className?: string; size?: number }>;

// Curated icon set offered in the editor. Keys are what get saved in a post.
export const ICONS: Record<string, IconComp> = {
  Anchor, Award, BarChart3, BookOpen, Bookmark, Briefcase, Building2, Calendar, Check, CheckCircle2,
  Church, Clock, Cloud, Cpu, Crown, Compass, DollarSign, Flag, Flame, Gem, Gift, Globe, GraduationCap,
  Handshake, Heart, HelpCircle, Home, Info, Key, Lightbulb, Link2, Lock, Mail, MapPin, Megaphone, MessageCircle,
  Mic, Music, Newspaper, PenTool, Phone, PieChart, Play, Rocket, Scale, Search, Shield, Sparkles, Star, Sun,
  Target, ThumbsUp, TrendingUp, Trophy, Users, Video, Wallet, Wifi, Zap, AlertTriangle, ArrowRight,
  Camera, Coins, Landmark, Leaf, Library, Quote, Radio, Smile, Wrench,
};

export const ICON_NAMES = Object.keys(ICONS);

// A saved icon is either the name of an icon above, or any text/emoji the author typed.
export function Icon({ name, className, size = 20 }: { name?: string; className?: string; size?: number }) {
  if (!name) return null;
  const Comp = ICONS[name];
  if (Comp) return <Comp className={className} size={size} />;
  return (
    <span className={className} style={{ fontSize: size, lineHeight: 1 }} aria-hidden>
      {name}
    </span>
  );
}
