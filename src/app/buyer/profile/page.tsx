
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, User, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { updateUserAddress, type Address } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { geocodeAddress } from '@/ai/flows/geocode-address-flow';

function AddressDialog({ user, onAddressUpdated }: { user: any, onAddressUpdated: () => void }) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [fullName, setFullName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.address?.phone || '');
    const [streetAddress, setStreetAddress] = useState(user?.address?.streetAddress || '');
    const [city, setCity] = useState(user?.address?.city || '');
    const [district, setDistrict] = useState(user?.address?.district || '');
    const [country, setCountry] = useState(user?.address?.country || '');
    const [pincode, setPincode] = useState(user?.address?.pincode || '');
    const [latitude, setLatitude] = useState<number | undefined>(user?.address?.latitude);
    const [longitude, setLongitude] = useState<number | undefined>(user?.address?.longitude);
    const [isLocating, setIsLocating] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            setFullName(user.name);
            setPhone(user.address?.phone || '');
            setStreetAddress(user.address?.streetAddress || '');
            setCity(user.address?.city || '');
            setDistrict(user.address?.district || '');
            setCountry(user.address?.country || '');
            setPincode(user.address?.pincode || '');
            setLatitude(user.address?.latitude);
            setLongitude(user.address?.longitude);
        }
    }, [user, open]);


    const handleGetLocation = () => {
        if (navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setLatitude(lat);
            setLongitude(lon);
            toast({ title: "Location captured! Fetching address..." });

            try {
                const geocoded = await geocodeAddress({ latitude: lat, longitude: lon });
                setStreetAddress(geocoded.streetAddress);
                setCity(geocoded.city);
                setDistrict(geocoded.district);
                setCountry(geocoded.country);
                setPincode(geocoded.pincode);
                toast({ title: "Address automatically filled!" });
            } catch(err) {
                console.error(err);
                toast({ title: "Could not auto-fill address", description: "Please fill the details manually.", variant: "destructive" });
            } finally {
                setIsLocating(false);
            }
            },
            (error) => {
            console.error("Geolocation error:", error);
            toast({ title: "Could not get location", description: "Please ensure location services are enabled.", variant: "destructive" });
            setIsLocating(false);
            }
        );
        } else {
        toast({ title: "Geolocation not supported", description: "Your browser does not support geolocation.", variant: "destructive" });
        }
    };

    const handleSaveAddress = async () => {
        if (!fullName || !phone || !streetAddress || !city || !district || !country || !pincode) {
            toast({ title: "All fields are required", description: "Please fill in all address details.", variant: "destructive"});
            return;
        }
        setIsSaving(true);
        try {
            const addressToSave: Address = {
                fullName, phone, streetAddress, city, district, country, pincode
            };
            if (typeof latitude === 'number' && typeof longitude === 'number') {
                addressToSave.latitude = latitude;
                addressToSave.longitude = longitude;
            }

            await updateUserAddress(user.uid, addressToSave);
            toast({ title: 'Address Saved!', description: 'Your default shipping address has been updated.' });
            onAddressUpdated();
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to save address.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button variant="outline">
                    <Edit className="mr-2" />
                    {user?.address ? 'Edit Address' : 'Add Address'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Shipping Address</DialogTitle>
                    <DialogDescription>
                        Update your default shipping address. This will be used to pre-fill the form at checkout.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="streetAddress">Street Address</Label>
                        <Input id="streetAddress" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district">District</Label>
                            <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                        <Button variant="outline" onClick={handleGetLocation} disabled={isLocating}>
                            {isLocating ? <Loader2 className="mr-2 animate-spin" /> : <MapPin className="mr-2" />}
                            Use My Location
                        </Button>
                        {latitude && longitude && <span className="text-sm text-green-500">Location captured!</span>}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveAddress} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                        Save Address
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function BuyerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  
  // This is a bit of a hack to force a re-render when the user object is updated
  // after saving the address. A more robust solution might use a global state manager.
  const [userVersion, setUserVersion] = useState(0);

  const handleAddressUpdate = () => {
    // This will trigger a re-fetch of data by bumping the dependency
    setUserVersion(v => v + 1);
    // Ideally, the user object in useAuth would be refreshed without a full page reload.
    // For now, this is a simple way to reflect changes.
    window.location.reload(); 
  }

  return (
    <div className="container py-12 space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and view your order history.</p>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User />
                    Personal Information
                </CardTitle>
                <CardDescription>Your default shipping address and contact details.</CardDescription>
            </CardHeader>
            <CardContent>
                {authLoading ? (
                    <Loader2 className="animate-spin" />
                ) : user?.address ? (
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p className="font-bold text-lg text-foreground">{user.address.fullName}</p>
                        <p>{user.email}</p>
                        <p>{user.address.phone}</p>
                        <p>{user.address.streetAddress}</p>
                        <p>{user.address.city}, {user.address.district} - {user.address.pincode}</p>
                        <p>{user.address.country}</p>
                    </div>
                ) : (
                    <p className="text-muted-foreground">You haven't set a default shipping address yet.</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-end">
                {user && <AddressDialog user={user} onAddressUpdated={handleAddressUpdate} />}
            </CardFooter>
        </Card>
    </div>
  );
}
