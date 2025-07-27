
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
    getAvailableDeliveryPersonnel, 
    createSellerInvite,
    getSentInvitesForSeller,
    type SellerInvite
} from '@/lib/firestore';
import { useAuth, type User } from '@/hooks/use-auth';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


export default function FindStaffPage() {
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<SellerInvite[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [availablePersonnel, fetchedSentInvites] = await Promise.all([
        getAvailableDeliveryPersonnel(),
        getSentInvitesForSeller(user.uid),
      ]);
      setPersonnel(availablePersonnel);
      setSentInvites(fetchedSentInvites);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load delivery personnel. Please try again.',
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
  }, [user]);

  const handleSendInvite = async (deliveryPerson: User) => {
    if (!user) return;
    setIsSubmitting(deliveryPerson.uid);
    try {
      await createSellerInvite({
        sellerId: user.uid,
        sellerName: user.name,
        deliveryPersonId: deliveryPerson.uid,
        deliveryPersonName: deliveryPerson.name,
      });
      toast({
        title: 'Invite Sent!',
        description: `An invitation has been sent to ${deliveryPerson.name}.`,
      });
      // Refetch invites to update UI state
      const newSentInvites = await getSentInvitesForSeller(user.uid);
      setSentInvites(newSentInvites);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to send invite. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(null);
    }
  };

  const getInviteStatusForPerson = (deliveryPersonId: string) => {
    const invite = sentInvites.find(i => i.deliveryPersonId === deliveryPersonId);
    return invite?.status; // 'pending', 'accepted', 'rejected', or undefined
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
        <h1 className="text-2xl font-bold font-headline">Find Delivery Staff</h1>
        <p className="text-muted-foreground">Browse and invite available personnel to join your delivery team.</p>
      </div>
      {personnel.length === 0 ? (
        <div className="text-center py-20 rounded-lg border-2 border-dashed">
            <h2 className="text-xl font-semibold">No Available Staff</h2>
            <p className="text-muted-foreground mt-2">There are currently no delivery personnel available to invite.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personnel.map((person) => {
            const status = getInviteStatusForPerson(person.uid);
            return (
                <Card key={person.uid} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback>{person.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{person.name}</CardTitle>
                        <CardDescription>{person.email}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-end">
                    {status === 'pending' ? (
                        <Button variant="outline" disabled>
                        <CheckCircle className="mr-2" />
                        Invite Sent
                        </Button>
                    ) : status === 'accepted' ? (
                        <Button variant="secondary" disabled className="bg-green-600/90 text-primary-foreground hover:bg-green-600/90">
                        <CheckCircle className="mr-2" />
                        On Your Team
                        </Button>
                    ) : ( // Covers 'rejected', 'left', or null
                        <Button
                        onClick={() => handleSendInvite(person)}
                        disabled={isSubmitting === person.uid}
                        className="bg-primary hover:bg-primary/90"
                        >
                        {isSubmitting === person.uid ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2" />
                        )}
                        {status === 'rejected' ? 'Send Invite Again' : 'Send Invite'}
                        </Button>
                    )}
                </CardContent>
                </Card>
            );
            })}
        </div>
      )}
    </div>
  );
}
