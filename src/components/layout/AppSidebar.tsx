import { useState } from "react";
import { 
  LayoutDashboard, 
  Recycle, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Users,
  MapPin,
  LogOut
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getNavigationItems = (role: string) => {
  const baseItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  ];

  if (role === 'admin') {
    return [
      ...baseItems,
      { title: "Collections", url: "/collections", icon: Recycle },
      { title: "Complaints", url: "/complaints", icon: MessageSquare },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Users", url: "/users", icon: Users },
      { title: "Wards", url: "/wards", icon: MapPin },
      { title: "Settings", url: "/settings", icon: Settings },
    ];
  } else if (role === 'collector') {
    return [
      ...baseItems,
      { title: "Collections", url: "/collections", icon: Recycle },
      { title: "Routes", url: "/routes", icon: MapPin },
      { title: "Settings", url: "/settings", icon: Settings },
    ];
  } else {
    return [
      ...baseItems,
      { title: "Complaints", url: "/complaints", icon: MessageSquare },
      { title: "Settings", url: "/settings", icon: Settings },
    ];
  }
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { userProfile, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const items = userProfile ? getNavigationItems(userProfile.role) : [];
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-2 border-primary" 
      : "hover:bg-sidebar-accent/50 transition-quick";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                <img src={logoImage} alt="WSMS Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">WSMS</h2>
                <p className="text-xs text-sidebar-foreground/60">Clean City Companion</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto p-1">
              <img src={logoImage} alt="WSMS Logo" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium">
              Navigation
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-5 h-5 transition-quick" />
                      {!collapsed && <span className="transition-quick">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile & Sign Out */}
      <SidebarFooter>
        <div className="p-3 border-t border-sidebar-border">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userProfile?.profile_image_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userProfile?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {userProfile?.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">
                    {userProfile?.role}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Avatar className="w-8 h-8 mx-auto">
                <AvatarImage src={userProfile?.profile_image_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userProfile?.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="w-8 h-8 p-0 mx-auto hover:bg-sidebar-accent"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}