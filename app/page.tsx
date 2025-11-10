'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      // If logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // If not logged in, redirect to signup page
      router.push('/signup');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="text-xl text-white">Loading...</div>
    </div>
  );
}
