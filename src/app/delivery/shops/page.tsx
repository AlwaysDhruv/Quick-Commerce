
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAllSellers, createDeliveryRequest, getDeliveryRequestsForDeliveryPerson, getLeaveRequestsForSeller, type DeliveryRequest, type LeaveRequest } from '@/lib/firestore';
import { useAuth, type User } from '@/hooks/use-auth';
import { Loader2, CheckCircle, Send, XCircle } from 'lucide-react';

export default function FindShopsPage() {
  const [sellers, setSellers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    if (!user) return;
    try {
      const [allSellers, sentDeliveryRequests, sentLeaveRequests] = await Promise.all([
        getAllSellers(),
        getDeliveryRequestsForDeliveryPerson(user.uid),
        getLeaveRequestsForSeller(user.uid),
      ]);
      setSellers(allSellers);
      setDeliveryRequests(sentDeliveryRequests);
      setLeaveRequests(sentLeaveRequests);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load shops. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSendRequest = async (seller: User) => {
    if (!user) return;
    setIsSubmitting(seller.uid);
    try {
      await createDeliveryRequest({
        sellerId: seller.uid,
        sellerName: seller.name,
        deliveryPersonId: user.uid,
        deliveryPersonName: user.name,
      });
      toast({
        title: 'Request Sent!',
        description: `Your request to join ${seller.name}'s shop has been sent.`,
      });
      // Refetch requests to update UI state
      const sentRequests = await getDeliveryRequestsForDeliveryPerson(user.uid);
      setDeliveryRequests(sentRequests);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to send request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(null);
    }
  };

  const getRequestStatusForSeller = (sellerId: string) => {
      const lastDeliveryRequest = deliveryRequests
        .filter(r => r.sellerId === sellerId)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];

      const lastLeaveRequest = leaveRequests
        .filter(r => r.sellerId === sellerId)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];
      
      if (!lastDeliveryRequest) {
        return null; // No request ever sent
      }

      // If a leave request is more recent than a join request, it means the user has left.
      if (lastLeaveRequest && lastLeaveRequest.createdAt.toMillis() > lastDeliveryRequest.createdAt.toMillis()) {
         return 'left';
      }

      return lastDeliveryRequest.status;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user?.associatedSellerId) {
     return (
        <div className="space-y-6 text-center">
             <div>
                <h1 className="text-2xl font-bold font-headline">Find Shops</h1>
                <p className="text-muted-foreground mt-2">You are already part of a team. To join another, you must first leave your current team.</p>
            </div>
             <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>You&apos;re on Team {user.associatedSellerName}!</CardTitle>
                </CardHeader>
             </Card>
        </div>
     )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Find Shops</h1>
        <p className="text-muted-foreground">Browse available seller shops and request to join their delivery team.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => {
          const status = getRequestStatusForSeller(seller.uid);
          return (
            <Card key={seller.uid} className="flex flex-col">
              <CardHeader>
                <CardTitle>{seller.name}'s Shop</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-end justify-end">
                <div className="flex justify-end">
                  {status === 'pending' ? (
                    <Button variant="outline" disabled>
                      <CheckCircle className="mr-2" />
                      Request Sent
                    </Button>
                  ) : status === 'approved' ? (
                     <Button variant="secondary" disabled className="bg-green-600/90 text-primary-foreground hover:bg-green-600/90">
                      <CheckCircle className="mr-2" />
                      Approved
                    </Button>
                  ) : status === 'rejected' ? (
                     <Button
                      onClick={() => handleSendRequest(seller)}
                      disabled={isSubmitting === seller.uid}
                      variant="destructive"
                    >
                      {isSubmitting === seller.uid ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2" />
                      )}
                      Request Rejected - Reapply?
                    </Button>
                  ) : ( // This will cover null (no request yet) and 'left'
                    <Button
                      onClick={() => handleSendRequest(seller)}
                      disabled={isSubmitting === seller.uid}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting === seller.uid ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2" />
                      )}
                      Send Join Request
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
