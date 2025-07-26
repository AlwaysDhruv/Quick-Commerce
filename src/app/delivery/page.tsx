'use client';

import { useAuth } from '@/hooks/use-auth';

export default function DeliveryDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">This is your delivery dashboard.</p>
        </div>
      </div>
       <div className="text-center py-20 rounded-lg border-2 border-dashed">
            <h2 className="text-xl font-semibold">Ready for deliveries!</h2>
            <p className="text-muted-foreground mt-2">Assigned orders will appear here.</p>
        </div>
    </div>
  );
}
