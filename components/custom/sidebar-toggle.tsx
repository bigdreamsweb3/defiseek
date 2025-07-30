'use client';

import type { SidebarTrigger } from '@/components/ui/sidebar';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { SidebarLeftIcon } from './icons';
import Image from 'next/image';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <BetterTooltip content="Toggle Sidebar" align="start">
      <Button
        onClick={toggleSidebar}
        variant="ghost"
        className="md:px-2 md:h-fit"
      >

        <SidebarLeftIcon />

      </Button>
    </BetterTooltip>
  );
}
