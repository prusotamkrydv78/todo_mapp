'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
});

export function ConditionalChatWidget() {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth/');

  if (isAuthRoute) {
    return null;
  }

  return <ChatWidget />;
}
