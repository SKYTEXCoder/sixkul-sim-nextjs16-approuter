"use client";

/**
 * Ekskul Logo Component
 *
 * Displays extracurricular logo with fallback to category icon on error.
 * Handles 404 and invalid image URLs gracefully.
 *
 * @module components/ekskul/EkskulLogo
 */

import { useState } from "react";
import {
  BookOpen,
  Music,
  Trophy,
  Palette,
  GraduationCap,
  Compass,
  Heart,
  Gamepad2,
  Monitor,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

// ============================================
// Props
// ============================================

interface EkskulLogoProps {
  logoUrl: string | null;
  name: string;
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ============================================
// Icon Mapping
// ============================================

function getCategoryIcon(category: string, name: string): LucideIcon {
  const nameLower = name.toLowerCase();

  // Check name for specific keywords first
  if (nameLower.includes("game") || nameLower.includes("video"))
    return Gamepad2;
  if (
    nameLower.includes("musik") ||
    nameLower.includes("band") ||
    nameLower.includes("drum")
  )
    return Music;
  if (
    nameLower.includes("basket") ||
    nameLower.includes("futsal") ||
    nameLower.includes("voli")
  )
    return Trophy;
  if (nameLower.includes("tenis") || nameLower.includes("bulutangkis"))
    return Dumbbell;
  if (
    nameLower.includes("robotik") ||
    nameLower.includes("komputer") ||
    nameLower.includes("programming")
  )
    return Monitor;
  if (nameLower.includes("pramuka") || nameLower.includes("paskibra"))
    return Compass;
  if (
    nameLower.includes("lukis") ||
    nameLower.includes("seni") ||
    nameLower.includes("tari")
  )
    return Palette;

  // Fall back to category
  switch (category) {
    case "Teknologi":
      return Monitor;
    case "Olahraga":
      return Trophy;
    case "Seni":
      return Palette;
    case "Akademik":
      return GraduationCap;
    case "Kepanduan":
      return Compass;
    case "Sosial":
      return Heart;
    default:
      return BookOpen;
  }
}

// ============================================
// Size Classes
// ============================================

const sizeClasses = {
  sm: {
    container: "h-16 w-16",
    icon: "h-8 w-8",
    img: "h-16 w-16",
  },
  md: {
    container: "h-20 w-20",
    icon: "h-10 w-10",
    img: "h-20 w-20",
  },
  lg: {
    container: "h-24 w-24",
    icon: "h-12 w-12",
    img: "h-24 w-24",
  },
};

// ============================================
// Component
// ============================================

export function EkskulLogo({
  logoUrl,
  name,
  category,
  size = "md",
  className = "",
}: EkskulLogoProps) {
  const [hasError, setHasError] = useState(false);
  const Icon = getCategoryIcon(category, name);
  const sizes = sizeClasses[size];

  // Show icon fallback if no URL, empty URL, or load error
  const showIcon = !logoUrl || logoUrl.trim() === "" || hasError;

  if (showIcon) {
    return (
      <div
        className={`${sizes.container} rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ${className}`}
      >
        <Icon className={`${sizes.icon} text-white`} />
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      className={`${sizes.img} object-contain rounded-lg bg-white/90 p-2 ${className}`}
      onError={() => setHasError(true)}
    />
  );
}

export default EkskulLogo;
