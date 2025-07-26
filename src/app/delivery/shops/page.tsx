
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAllSellers, createDeliveryRequest, getDeliveryRequestsForDeliveryPerson, type DeliveryRequest } from '@/lib/firestore';
import { useAuth, type User } from '@/hooks/use-auth';
import { Loader2, CheckCircle, Send } from 'lucide-react';

export default function FindShopsPage() {
  const [sellers, setSellers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    if (!user) return;
    try {
      const [allSellers, sentRequests] = await Promise.all([
        getAllSellers(),
        getDeliveryRequestsForDeliveryPerson(user.uid),
      ]);
      setSellers(allSellers);
      setRequests(sentRequests);
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
    fetchData();
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
      setRequests(sentRequests);
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
    const request = requests.find(r => r.sellerId === sellerId);
    return request ? request.status : null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
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
            <Card key={seller.uid}>
              <CardHeader>
                <CardTitle>{seller.name}'s Shop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  {status === 'pending' ? (
                    <Button variant="outline" disabled>
                      <CheckCircle className="mr-2" />
                      Request Sent
                    </Button>
                  ) : status === 'approved' ? (
                     <Button variant="secondary" disabled className="bg-green-500/20 text-green-500">
                      <CheckCircle className="mr-2" />
                      Approved
                    </Button>
                  ) : status === 'rejected' ? (
                     <Button variant="destructive" disabled>
                      Request Rejected
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSendRequest(seller)}
                      disabled={isSubmitting === seller.uid}
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

