
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';
import { Logo } from '@/components/logo';
import type { ConfirmationResult } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['buyer', 'seller', 'delivery'], { required_error: 'You must select a role.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number with country code.' }),
});

const otpSchema = z.object({
    otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, signInWithPhone, verifyOtp } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'buyer',
      phone: '',
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });
  
  const role = useWatch({
    control: form.control,
    name: "role",
  });

  async function onInfoSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setFormData(values); // Save form data to use after OTP verification

    // If the user is a seller or delivery person, use the original registration flow.
    if (values.role !== 'buyer') {
      try {
        await register(values.email, values.password, values.name, values.role, values.phone);
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created.',
        });
        // Redirect is handled by AuthProvider
      } catch (error: any) {
        handleRegistrationError(error);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // For buyers, start the phone verification process.
    try {
        const result = await signInWithPhone(values.phone);
        setConfirmationResult(result);
        setStep('otp');
        toast({
            title: 'OTP Sent!',
            description: 'Check your phone for the verification code.',
        });
    } catch (error: any) {
        console.error("OTP Send Error:", error);
        toast({
            title: 'Failed to Send OTP',
            description: error.message || 'Please check the phone number and try again.',
            variant: 'destructive'
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    if (!confirmationResult || !formData) return;
    setIsSubmitting(true);

    try {
        // This will create the user in Firebase Auth via phone
        const userCredential = await verifyOtp(confirmationResult, values.otp);
        if (userCredential && formData) {
             // Now create the user record in Firestore
            await register(formData.email, formData.password, formData.name, formData.role, formData.phone, true);
            
            toast({
                title: 'Registration Successful!',
                description: 'Your account has been created. Please add your address.',
            });
            router.push('/register/address');
        }
    } catch (error: any) {
        console.error("OTP Verification Error:", error);
         toast({
            title: 'Invalid OTP',
            description: 'The code you entered is incorrect. Please try again.',
            variant: 'destructive'
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  function handleRegistrationError(error: any) {
     console.error(error);
      let description = 'An unexpected error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email address is already in use. Please try another one.';
      } else if (error.message) {
        description = error.message;
      }
      toast({
        title: 'Registration Failed',
        description: description,
        variant: 'destructive',
      });
  }

  // If user is already logged in, redirect them
  React.useEffect(() => {
    if (user) {
      let redirectPath = '/buyer';
        if (user.role === 'seller') {
            redirectPath = '/seller';
        } else if (user.role === 'delivery') {
            redirectPath = '/delivery';
        }
      router.push(redirectPath);
    }
  }, [user, router]);
  
  const renderInfoStep = () => (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-6">
            <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>I want to be a...</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                    disabled={isSubmitting}
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="buyer" />
                      </FormControl>
                      <FormLabel className="font-normal">Buyer</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="seller" />
                      </FormControl>
                      <FormLabel className="font-normal">Seller</FormLabel>
                    </FormItem>
                     <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="delivery" />
                      </FormControl>
                      <FormLabel className="font-normal">Delivery</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isSubmitting}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} disabled={isSubmitting}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number (with country code)</FormLabel>
                    <FormControl>
                    <Input placeholder="+1 123 456 7890" {...field} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : (role === 'buyer' ? 'Send OTP' : 'Create Account')}
          </Button>
        </form>
      </Form>
  );

  const renderOtpStep = () => (
     <Form {...otpForm}>
        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
            <FormField
            control={otpForm.control}
            name="otp"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Enter 6-Digit OTP</FormLabel>
                <FormControl>
                    <Input placeholder="123456" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep('info')}>Back</Button>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : 'Verify & Create Account'}
                </Button>
            </div>
        </form>
    </Form>
  )


  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {step === 'info' ? 'Create an Account' : 'Verify Your Phone'}
          </CardTitle>
          <CardDescription>
            {step === 'info' 
              ? "Join SwiftShopper today. It's free and only takes a minute."
              : `Enter the code sent to ${formData?.phone}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'info' ? renderInfoStep() : renderOtpStep()}
          {step === 'info' && (
            <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline text-accent">
                Sign in
                </Link>
            </div>
          )}
        </CardContent>
      </Card>
       <div id="recaptcha-container"></div>
    </div>
  );
}
