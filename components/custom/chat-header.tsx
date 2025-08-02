'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import Image from 'next/image';
import { SidebarToggle } from '@/components/custom/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { PlusIcon } from './icons';
import { useSidebar } from '../ui/sidebar';

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 w-full border-b border-border/50">
      <div className="flex items-center gap-2 w-full">
        <SidebarToggle />

        <div className='flex justify-between w-full md:w-fit gap-2'>
          {(!open || windowWidth < 768) && (
            <div className="flex items-center gap-2">

              <Image
                src="/images/defiseek_logo.png"
                alt="DeFiSeek Logo"
                width={24}
                height={24}
                className="w-6 h-6 cursor-pointer rounded-full"
              />

              <span className="font-semibold text-sm block">
                DeFiSeek
              </span>
            </div>
          )}

          {(!open || windowWidth < 768) && (
            <div className="block">
              <BetterTooltip content="New Chat" align="start">
                <Button
                  variant="ghost"
                  className="p-2 h-fit"
                  onClick={() => {
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </BetterTooltip>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
