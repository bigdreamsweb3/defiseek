'use client';

import type { SidebarTrigger } from '@/components/ui/sidebar';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { SidebarLeftIcon } from './icons';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <BetterTooltip content={open ? "Collapse Sidebar" : "Expand Sidebar"} align="start">
      <Button
        onClick={toggleSidebar}
        variant="ghost"
        size="sm"
        className="md:px-2 md:h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
      >
        <SidebarLeftIcon className="h-4 w-4" />
      </Button>
    </BetterTooltip>
  );
}
