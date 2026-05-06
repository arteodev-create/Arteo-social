import React from 'react';
import { 
  Heart, 
  ChatCircle, 
  Repeat, 
  Export, 
  DotsThree, 
  BookmarkSimple,
  ShareNetwork,
  Quotes,
  Link,
  Sparkle,
  Trash,
  PencilSimpleLine,
  Flag,
  Brain,
  Lightning,
  CursorClick,
  ArrowLeft,
  Plus,
  Books,
  PushPin,
  SealCheck,
  MagnifyingGlass,
  Check,
  Gear,
  Sliders,
  Diamond,
  BugBeetle,
  CaretRight,
  Clock,
  FileText,
  Info,
  SidebarSimple,
  ClockCountdown,
  Smiley,
  EnvelopeSimple,
  PaperPlaneTilt,
  X,
  CaretDown,
  TrendUp,
  Butterfly
} from '@phosphor-icons/react';
import { cn } from '@shared/lib';

/**
 * Arteo Platinum Icon System
 * Powered by Phosphor Icons for a soft, rounded, and premium aesthetic.
 */

interface IconProps {
  size?: number;
  className?: string;
  fill?: "none" | "currentColor";
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}

export const Icons = {
  Heart: ({ size = 20, className, fill = "none", weight }: IconProps) => (
    <Heart 
      size={size} 
      weight={fill === "currentColor" ? "fill" : (weight || "regular")}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Reply: ({ size = 20, className, weight }: IconProps) => (
    <ChatCircle 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Repost: ({ size = 20, className, weight }: IconProps) => (
    <Repeat 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Share: ({ size = 20, className, weight }: IconProps) => (
    <Export 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Bookmark: ({ size = 20, className, fill = "none", weight }: IconProps) => (
    <BookmarkSimple 
      size={size} 
      weight={fill === "currentColor" ? "fill" : (weight || "regular")}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  More: ({ size = 20, className, weight }: IconProps) => (
    <DotsThree 
      size={size} 
      weight={weight || "bold"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  ShareNetwork: ({ size = 20, className, weight }: IconProps) => (
    <ShareNetwork 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Quote: ({ size = 20, className, weight }: IconProps) => (
    <Quotes 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Link: ({ size = 20, className, weight }: IconProps) => (
    <Link 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Sparkles: ({ size = 20, className, weight }: IconProps) => (
    <Sparkle 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Trash: ({ size = 20, className, weight }: IconProps) => (
    <Trash 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Edit: ({ size = 20, className, weight }: IconProps) => (
    <PencilSimpleLine 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Flag: ({ size = 20, className, weight }: IconProps) => (
    <Flag 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Brain: ({ size = 20, className, weight }: IconProps) => (
    <Brain 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Activity: ({ size = 20, className, weight }: IconProps) => (
    <TrendUp 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Check: ({ size = 20, className, weight }: IconProps) => (
    <Check 
      size={size} 
      weight={weight || "bold"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Settings: ({ size = 20, className, weight }: IconProps) => (
    <Gear 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Lightning: ({ size = 20, className, weight }: IconProps) => (
    <Lightning 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Selection: ({ size = 20, className, weight }: IconProps) => (
    <CursorClick 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Arrow: ({ size = 20, className, weight }: IconProps) => (
    <ArrowLeft 
      size={size} 
      weight={weight || "light"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Plus: ({ size = 20, className, weight }: IconProps) => (
    <Plus 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Books: ({ size = 20, className, weight }: IconProps) => (
    <Books 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  PushPin: ({ size = 20, className, weight }: IconProps) => (
    <PushPin 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  SealCheck: ({ size = 20, className, weight }: IconProps) => (
    <SealCheck 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Search: ({ size = 20, className, weight }: IconProps) => (
    <MagnifyingGlass 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Algorithm: ({ size = 20, className }: IconProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 256 256" 
      fill="currentColor" 
      className={cn("transition-all duration-300 pointer-events-none", className)}
    >
      <path d="M128,100.17a108.42,108.42,0,0,0-8-12.64V56a8,8,0,0,1,16,0V87.53A108.42,108.42,0,0,0,128,100.17ZM232.7,50.48C229,45.7,221.84,40,209,40c-16.85,0-38.46,11.28-57.81,30.16A140.07,140.07,0,0,0,136,87.53V180a8,8,0,0,1-16,0V87.53a140.07,140.07,0,0,0-15.15-17.37C85.49,51.28,63.88,40,47,40,34.16,40,27,45.7,23.3,50.48c-6.82,8.77-12.18,24.08-.21,71.2,6.05,23.83,19.51,33,30.63,36.42A44,44,0,0,0,128,205.27a44,44,0,0,0,74.28-47.17c11.12-3.4,24.57-12.59,30.63-36.42C239.63,95.24,244.85,66.1,232.7,50.48Z" />
    </svg>
  ),
  Majestic: ({ size = 20, className }: IconProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 256 256" 
      fill="currentColor" 
      className={cn("transition-all duration-300 pointer-events-none", className)}
    >
      <path d="M128,24 L216,112 L128,200 L40,112 Z M128,52 L68,112 L128,172 L188,112 Z" />
      <circle cx="128" cy="112" r="12" />
    </svg>
  ),
  Sliders: ({ size = 20, className, weight }: IconProps) => (
    <Sliders 
      size={size} 
      weight={weight || "regular"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Diamond: ({ size = 20, className, weight }: IconProps) => (
    <Diamond 
      size={size} 
      weight={weight || "bold"}
      className={cn("transition-all duration-300 pointer-events-none", className)} 
    />
  ),
  Boost: ({ size = 20, className, weight = "bold" }: IconProps) => (
    <BugBeetle size={size} className={cn("transition-all duration-300 pointer-events-none", className)} weight={weight} />
  ),
  Sidebar: ({ size = 20, className, weight = "bold" }: IconProps) => (
    <SidebarSimple size={size} className={cn("transition-all duration-300 pointer-events-none", className)} weight={weight} />
  ),
  CaretRight: ({ size = 20, className, weight }: IconProps) => (
    <CaretRight size={size} weight={weight || "bold"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  Clock: ({ size = 20, className, weight }: IconProps) => (
    <Clock size={size} weight={weight || "regular"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  FileText: ({ size = 20, className, weight }: IconProps) => (
    <FileText size={size} weight={weight || "regular"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  Info: ({ size = 20, className, weight }: IconProps) => (
    <Info size={size} weight={weight || "regular"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  Bird: ({ size = 20, className }: IconProps) => (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 256 256" className={cn("transition-all duration-300 pointer-events-none", className)}>
      <path d="M236.44,73.34,213.21,57.86A60,60,0,0,0,156,16h-.29C122.79,16.16,96,43.47,96,76.89V96.63L11.63,197.88l-.1.12A16,16,0,0,0,24,224h88A104.11,104.11,0,0,0,216,120V100.28l20.44-13.62a8,8,0,0,0,0-13.32ZM126.15,133.12l-60,72a8,8,0,1,1-12.29-10.24l60-72a8,8,0,1,1,12.29,10.24ZM164,80a12,12,0,1,1,12-12A12,12,0,0,1,164,80Z"></path>
    </svg>
  ),
  Butterfly: ({ size = 20, className, weight }: IconProps) => (
    <Butterfly size={size} weight={weight || "regular"} className={className} />
  ),
  Timer: ({ size = 20, className, weight }: IconProps) => (
    <ClockCountdown size={size} weight={weight || "regular"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  Smiley: ({ size = 20, className, weight }: IconProps) => (
    <Smiley size={size} weight={weight || "regular"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  DM: ({ size = 20, className, weight }: IconProps) => (
    <EnvelopeSimple size={size} weight={weight || "regular"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  PaperPlaneTilt: ({ size = 20, className, weight }: IconProps) => (
    <PaperPlaneTilt size={size} weight={weight || "regular"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  Loading: ({ size = 20, className }: IconProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("animate-spin transition-all duration-300 pointer-events-none", className)}
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeDasharray="31.415, 31.415"
        strokeDashoffset="0"
        className="opacity-20"
      />
      <path 
        d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5936 2.37241 15.0931 3.03681 16.4217" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
    </svg>
  ),
  Close: ({ size = 20, className, weight }: IconProps) => (
    <X size={size} weight={weight || "bold"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  CaretDown: ({ size = 20, className, weight }: IconProps) => (
    <CaretDown size={size} weight={weight || "bold"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
  Trending: ({ size = 20, className, weight }: IconProps) => (
    <TrendUp size={size} weight={weight || "regular"} className={cn("transition-all duration-300 pointer-events-none", className)} />
  ),
};
