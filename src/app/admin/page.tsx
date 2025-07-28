
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Palette, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">This is the Admin Dashboard. Choose an option below to get started.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon /> Customize Dashboard</CardTitle>
            <CardDescription>
              Modify the content and images of key components, like the homepage hero section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/dashboard-editor">
                Edit Dashboard <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette /> Customize Theme</CardTitle>
            <CardDescription>
              Modify the look and feel of the website by changing the color scheme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/theme">
                Customize Theme <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
