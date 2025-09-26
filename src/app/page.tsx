'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* You can add a loader here if needed */}
    </div>
  );
}
