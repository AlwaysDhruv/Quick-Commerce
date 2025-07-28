
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Palette } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">This is the Admin Dashboard.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Customization</CardTitle>
          <CardDescription>
            Modify the look and feel of the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/theme">
              <Palette className="mr-2" />
              Customize Theme
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
