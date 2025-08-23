'use client';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { UserButton, useUser } from '@civic/auth/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function SidebarUserNav() {
  const { setTheme, theme } = useTheme();
  const { user } = useUser();

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <UserButton />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10 w-full">
              <div className="flex items-center gap-3 w-full">
                <Image
                  src={`https://avatar.vercel.sh/${user?.email ?? 'user'}`}
                  alt={user?.email ?? 'User Avatar'}
                  width={24}
                  height={24}
                  className="rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user?.name || user?.email || 'User'}
                  </div>
                  <div className="text-xs text-sidebar-foreground/60 truncate">
                    {user?.email}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 flex-shrink-0 ml-auto transition-transform duration-200" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            side="top"
            align="end"
            className="w-64 p-2"
            sideOffset={8}
          >
            {/* User Info Section */}
            <div className="px-3 py-2 border-b border-border/50 mb-2">
              <div className="flex items-center gap-3">
                <Image
                  src={`https://avatar.vercel.sh/${user?.email ?? 'user'}`}
                  alt={user?.email ?? 'User Avatar'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <DropdownMenuItem className="gap-3 px-3 py-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="gap-3 px-3 py-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            {/* Theme Toggle */}
            <DropdownMenuItem 
              className="gap-3 px-3 py-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setTheme(theme === 'dark' ? 'light' : 'dark');
              }}
            >
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />
              <span>{`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            {/* Logout Section */}
            <div className="px-3 py-2">
              <div className="w-full">
                <UserButton />
              </div>
            </div>
            
            {/* Alternative Logout Option */}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-3 px-3 py-2 cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
              onSelect={(e) => {
                e.preventDefault();
                window.location.href = '/logout';
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
