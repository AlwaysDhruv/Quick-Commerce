
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { updateUserAddress, type Address } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { geocodeAddress } from '@/ai/flows/geocode-address-flow';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function RegisterAddressPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [country, setCountry] = useState('');
    const [pincode, setPincode] = useState('');
    const [latitude, setLatitude] = useState<number | undefined>();
    const [longitude, setLongitude] = useState<number | undefined>();
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            setFullName(user.name || '');
            setPhone(user.phone || '');
        }
    }, [user, loading]);

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
        if (!user) return;
        if (!fullName || !phone || !streetAddress || !city || !district || !country || !pincode) {
            toast({ title: "All fields are required", description: "Please fill in all address details.", variant: "destructive"});
            return;
        }
        setIsSaving(true);
        try {
            const addressToSave: Address = {
                fullName, phone, streetAddress, city, district, country, pincode,
            };
            
            // Only include lat/lng if they are defined
            if (typeof latitude === 'number' && typeof longitude === 'number') {
                addressToSave.latitude = latitude;
                addressToSave.longitude = longitude;
            }
            
            await updateUserAddress(user.uid, addressToSave);
            toast({ title: 'Address Saved!', description: 'Your default shipping address has been set.' });
            router.push('/buyer');
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to save address.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }

    const handleSkip = () => {
        router.push('/buyer');
    };

    if (loading) {
        return (
            <div className="container flex min-h-screen flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container flex min-h-screen flex-col items-center justify-center py-12">
            <div className="mb-8">
              <Logo />
            </div>
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Add Your Shipping Address</CardTitle>
                    <CardDescription>
                        Welcome! Let's get your address set up. This will be used for future orders.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 py-4">
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
                </CardContent>
                <CardFooter className="flex justify-between">
                     <Button variant="link" onClick={handleSkip}>Skip for now</Button>
                    <Button onClick={handleSaveAddress} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 animate-spin" />}
                        Save Address & Continue
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
