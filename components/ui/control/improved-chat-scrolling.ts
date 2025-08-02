// useControlledScrollToBottom.ts
import { useRef, useCallback, useState, useEffect } from 'react';

export function useControlledScrollToBottom<T extends HTMLElement>() {
  const messagesContainerRef = useRef<T>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastScrollTop = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current && (shouldAutoScroll || force)) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: force ? 'instant' : 'smooth',
        block: 'end'
      });
    }
  }, [shouldAutoScroll]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
    
    // Detect if user is actively scrolling
    if (Math.abs(scrollTop - lastScrollTop.current) > 10) {
      setIsUserScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to detect when user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 1000);
    }
    
    lastScrollTop.current = scrollTop;
    
    // Update auto-scroll preference based on scroll position
    setShouldAutoScroll(isAtBottom);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  return {
    messagesContainerRef,
    messagesEndRef,
    scrollToBottom,
    shouldAutoScroll,
    isUserScrolling,
    setShouldAutoScroll
  };
}

// Modified Chat component changes (replace your existing hook usage):

// 1. Replace the import:
// import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
// with:
// import { useControlledScrollToBottom } from './useControlledScrollToBottom';

// 2. Replace the hook usage:
// const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
// with:
// const {
//   messagesContainerRef,
//   messagesEndRef,
//   scrollToBottom,
//   shouldAutoScroll,
//   isUserScrolling,
//   setShouldAutoScroll
// } = useControlledScrollToBottom<HTMLDivElement>();

// 3. Add these useEffect hooks after your existing useEffect hooks:

// Auto-scroll only when appropriate
// useEffect(() => {
//   if (messages.length > 0 && shouldAutoScroll && !isUserScrolling) {
//     // Small delay to ensure content is rendered
//     const timer = setTimeout(() => scrollToBottom(), 50);
//     return () => clearTimeout(timer);
//   }
// }, [messages, shouldAutoScroll, isUserScrolling, scrollToBottom]);

// Force scroll to bottom for new conversations
// useEffect(() => {
//   if (messages.length === 1) {
//     scrollToBottom(true);
//     setShouldAutoScroll(true);
//   }
// }, [messages.length, scrollToBottom, setShouldAutoScroll]);

// 4. Add this scroll-to-bottom button before your form element:
{/* Scroll to bottom button - shows when user has scrolled up */}
// {!shouldAutoScroll && (
//   <div className="absolute bottom-20 right-6 z-10">
//     <button
//       onClick={() => {
//         scrollToBottom(true);
//         setShouldAutoScroll(true);
//       }}
//       className="bg-background border border-border rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-cyan-accent"
//       aria-label="Scroll to bottom"
//     >
//       <svg
//         width="20"
//         height="20"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <path d="m18 15-6-6-6 6"/>
//       </svg>
//     </button>
//   </div>
// )}

// 5. Add scroll-smooth class to your messages container:
// className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 scroll-smooth"