
'use client';

import { useAuth, type User } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Store, Truck, LogOut, Loader2, Mail, Check, X } from 'lucide-react';
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
import { createLeaveRequest, getPendingLeaveRequestForDeliveryPerson, type LeaveRequest, getInvitesForDeliveryPerson, type SellerInvite, approveSellerInvite, updateSellerInviteStatus } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';


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

function Invitations({ user, onAction }: { user: User, onAction: () => void }) {
    const [invites, setInvites] = useState<SellerInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchInvites = async () => {
        setIsLoading(true);
        const fetchedInvites = await getInvitesForDeliveryPerson(user.uid);
        setInvites(fetchedInvites);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchInvites();
    }, [user]);

    const handleAccept = async (invite: SellerInvite) => {
        setIsProcessing(invite.id);
        try {
            await approveSellerInvite(invite);
            toast({
                title: 'Joined Team!',
                description: `You are now part of ${invite.sellerName}'s delivery team.`
            });
            onAction(); // This should trigger a refetch and user state update
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to accept invitation.',
                variant: 'destructive'
            });
        } finally {
            setIsProcessing(null);
        }
    }
    
    const handleReject = async (invite: SellerInvite) => {
         setIsProcessing(invite.id);
        try {
            await updateSellerInviteStatus(invite.id, 'rejected');
            toast({
                title: 'Invitation Rejected',
            });
            fetchInvites(); // Just refetch invites
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to reject invitation.',
                variant: 'destructive'
            });
        } finally {
            setIsProcessing(null);
        }
    }

    if (isLoading) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
    if (invites.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail />
                    Shop Invitations
                    <Badge>{invites.length}</Badge>
                </CardTitle>
                <CardDescription>Sellers have invited you to join their team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {invites.map(invite => (
                    <div key={invite.id} className="flex items-center justify-between rounded-md border p-4">
                        <div>
                            <p className="font-semibold">{invite.sellerName}'s Shop</p>
                            <p className="text-sm text-muted-foreground">Sent on {format(invite.createdAt.toDate(), 'PPP')}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(invite)} disabled={!!isProcessing}>
                                {isProcessing === invite.id ? <Loader2 className="animate-spin" /> : <Check />}
                                Accept
                            </Button>
                             <Button size="sm" variant="destructive" onClick={() => handleReject(invite)} disabled={!!isProcessing}>
                                {isProcessing === invite.id ? <Loader2 className="animate-spin" /> : <X />}
                                Reject
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}


export default function DeliveryDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [pendingLeaveRequest, setPendingLeaveRequest] = useState<LeaveRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This function will be passed down to child components to trigger a data refresh
  const refetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    const request = await getPendingLeaveRequestForDeliveryPerson(user.uid);
    setPendingLeaveRequest(request);
    // Note: The parent AuthProvider will handle user object updates
    setIsLoading(false);
  }

  useEffect(() => {
    if (!authLoading && user) {
        refetchData();
    } else if (!authLoading) {
        setIsLoading(false);
    }
  }, [user, authLoading]);

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
                        onLeaveRequestSent={refetchData}
                    />
                )}
            </CardFooter>
        </Card>
      ) : (
         <div className="space-y-8">
            <Invitations user={user!} onAction={() => window.location.reload()} />
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
         </div>
      )}
    </div>
  );
}
