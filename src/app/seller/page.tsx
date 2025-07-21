'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/seller/orders');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
        <p>Loading seller dashboard...</p>
    </div>
  );
}
