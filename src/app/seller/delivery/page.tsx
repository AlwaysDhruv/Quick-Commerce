
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getDeliveryRequestsForSeller,
  approveDeliveryRequest,
  updateDeliveryRequestStatus,
  getDeliveryTeamForSeller,
  type DeliveryRequest,
} from '@/lib/firestore';
import { useAuth, type User } from '@/hooks/use-auth';
import { Loader2, Check, X, Mail, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function SellerDeliveryPage() {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [allRequests, deliveryTeam] = await Promise.all([
        getDeliveryRequestsForSeller(user.uid),
        getDeliveryTeamForSeller(user.uid),
      ]);
      setRequests(allRequests.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      setTeam(deliveryTeam);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load delivery data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleApprove = async (request: DeliveryRequest) => {
    setIsProcessing(request.id);
    try {
      await approveDeliveryRequest(request);
      toast({
        title: 'Request Approved!',
        description: `${request.deliveryPersonName} has been added to your team.`,
      });
      fetchData(); // Refresh all data
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to approve request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (request: DeliveryRequest) => {
    setIsProcessing(request.id);
    try {
      await updateDeliveryRequestStatus(request.id, 'rejected');
      toast({
        title: 'Request Rejected',
      });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to reject request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(null);
    }
  };
  
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Delivery Management</h1>
        <p className="text-muted-foreground">Manage your delivery team and incoming requests.</p>
      </div>

       <Tabs defaultValue="requests">
        <TabsList>
            <TabsTrigger value="requests">
                <Mail className="mr-2" />
                Requests
                {pendingRequests.length > 0 && <Badge className="ml-2">{pendingRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="team">
                <Users className="mr-2" />
                My Team
            </TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
            <Card>
                <CardHeader>
                <CardTitle>Incoming Delivery Requests</CardTitle>
                <CardDescription>Review and respond to requests from delivery personnel to join your shop.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading ? (
                        <TableRow>
                        <TableCell colSpan={4} className="text-center">
                            <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />
                        </TableCell>
                        </TableRow>
                    ) : requests.length === 0 ? (
                        <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                            You have no incoming requests.
                        </TableCell>
                        </TableRow>
                    ) : (
                        requests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.deliveryPersonName}</TableCell>
                            <TableCell>{format(req.createdAt.toDate(), 'PPP')}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    req.status === 'pending' ? 'secondary' :
                                    req.status === 'approved' ? 'default' :
                                    'destructive'
                                }>{req.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            {req.status === 'pending' && (
                                <div className="flex gap-2 justify-end">
                                <Button
                                    size="sm"
                                    onClick={() => handleApprove(req)}
                                    disabled={isProcessing === req.id}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check />}
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(req)}
                                    disabled={isProcessing === req.id}
                                >
                                     {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X />}
                                    Reject
                                </Button>
                                </div>
                            )}
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="team">
             <Card>
                <CardHeader>
                <CardTitle>Your Delivery Team</CardTitle>
                <CardDescription>A list of all delivery personnel currently working with your shop.</CardDescription>
                </CardHeader>
                <CardContent>
                 <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading ? (
                        <TableRow>
                        <TableCell colSpan={2} className="text-center">
                            <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />
                        </TableCell>
                        </TableRow>
                    ) : team.length === 0 ? (
                        <TableRow>
                        <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                            You have no one on your delivery team yet.
                        </TableCell>
                        </TableRow>
                    ) : (
                        team.map((member) => (
                        <TableRow key={member.uid}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        </Tabs>

    </div>
  );
}

