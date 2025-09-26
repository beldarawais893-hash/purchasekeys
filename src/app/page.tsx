
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const WelcomePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      {/* This page is now a redirector. Content can be a loading spinner or just blank. */}
    </div>
  );
};

export default WelcomePage;
