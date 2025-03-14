"use client";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserInfoProps {
  showBadge?: boolean;
  showAvatar?: boolean;
  showName?: boolean;
  showEmail?: boolean;
  avatarSize?: "sm" | "md" | "lg";
}

export function UserInfo({
  showBadge = true,
  showAvatar = true,
  showName = true,
  showEmail = false,
  avatarSize = "md"
}: UserInfoProps) {
  const { user, isDemoSession } = useAuthStatus();
  
  if (!user) return null;
  
  const avatarSizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }[avatarSize];
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="flex items-center gap-3">
      {showAvatar && (
        <Avatar className={avatarSizeClass}>
          <AvatarImage src={user.image || ""} alt={user.name || "Usuario"} />
          <AvatarFallback className="bg-soul-purple/10 text-soul-purple">
            {getInitials(user.name || user.email || "U")}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col">
        {showName && (
          <div className="flex items-center gap-2">
            <span className="font-medium">{user.name || user.email}</span>
            {showBadge && isDemoSession && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-200">
                Demo
              </Badge>
            )}
          </div>
        )}
        
        {showEmail && user.email && (
          <span className="text-sm text-muted-foreground">{user.email}</span>
        )}
      </div>
    </div>
  );
} 