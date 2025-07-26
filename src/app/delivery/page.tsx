
'use client';

import { useAuth, type User } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Store, Truck, LogOut, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from 'react';
import { createLeaveRequest, getPendingLeaveRequestForDeliveryPerson, type LeaveRequest } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';


function LeaveTeamDialog({ user, hasPendingRequest, onLeaveRequestSent }: { user: User, hasPendingRequest: boolean, onLeaveRequestSent: () => void }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleRequest = async () => {
        if (!user.associatedSellerId || !user.associatedSellerName) return;
        setIsSubmitting(true);
        try {
            await createLeaveRequest({
                sellerId: user.associatedSellerId,
                sellerName: user.associatedSellerName,
                deliveryPersonId: user.uid,
                deliveryPersonName: user.name,
            });
            toast({
                title: 'Request Sent',
                description: 'Your request to leave has been sent to the seller.',
            });
            onLeaveRequestSent();
            setOpen(false);
        } catch(error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to send leave request. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={hasPendingRequest}>
                    <LogOut className="mr-2" />
                    {hasPendingRequest ? 'Request Pending' : 'Request to Leave Team'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will stop receiving new orders from <strong>{user.associatedSellerName}</strong>. 
                        This action will send a request to the seller for approval.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRequest} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, send request
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [pendingLeaveRequest, setPendingLeaveRequest] = useState<LeaveRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPendingRequest = async () => {
    if (!user) return;
    setIsLoading(true);
    const request = await getPendingLeaveRequestForDeliveryPerson(user.uid);
    setPendingLeaveRequest(request);
    setIsLoading(false);
  }

  useEffect(() => {
    if (user?.associatedSellerId) {
        checkPendingRequest();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">This is your delivery dashboard.</p>
        </div>
      </div>

      {user?.associatedSellerId ? (
        <Card>
            <CardHeader>
                <CardTitle>You're part of a team!</CardTitle>
                <CardDescription>
                    You are currently assigned to deliver orders for <strong>{user.associatedSellerName}</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/delivery/orders">
                        <Truck className="mr-2" />
                        View Assigned Orders
                    </Link>
                </Button>
            </CardContent>
             <CardFooter className="flex justify-end">
                {isLoading ? <Loader2 className="animate-spin" /> : (
                    <LeaveTeamDialog 
                        user={user} 
                        hasPendingRequest={!!pendingLeaveRequest} 
                        onLeaveRequestSent={checkPendingRequest}
                    />
                )}
            </CardFooter>
        </Card>
      ) : (
         <div className="text-center py-20 rounded-lg border-2 border-dashed">
            <h2 className="text-xl font-semibold">You're a free agent!</h2>
            <p className="text-muted-foreground mt-2">You are not yet associated with any seller's shop.</p>
            <Button asChild className="mt-4">
                <Link href="/delivery/shops">
                    <Store className="mr-2" />
                    Find Shops to Join
                </Link>
            </Button>
        </div>
      )}
    </div>
  );
}
