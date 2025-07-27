
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ConfirmationResult } from 'firebase/auth';

const emailFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const phoneFormSchema = z.object({
    phone: z.string().min(10, { message: 'Please enter a valid phone number with country code.' }),
});

const otpFormSchema = z.object({
    otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
});


function EmailSignInForm() {
    const { login } = useAuth();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof emailFormSchema>>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: {
        email: '',
        password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof emailFormSchema>) {
        try {
        const userCredential = await login(values.email, values.password);
        if (userCredential) {
            toast({
            title: 'Login Successful',
            description: "Welcome back!",
            });
            // The redirect is now handled by the login function in AuthProvider
        }
        } catch (error: any) {
        console.error(error);
        let description = 'An unexpected error occurred.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            description = 'Invalid email or password. Please try again.';
        } else if (error.message) {
            description = error.message;
        }
        toast({
            title: 'Login Failed',
            description: description,
            variant: 'destructive',
        });
        }
    }

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="name@example.com" {...field} disabled={form.formState.isSubmitting} />
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
                        <Input type="password" placeholder="••••••••" {...field} disabled={form.formState.isSubmitting} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>
        </Form>
    )
}

function PhoneSignInForm() {
    const { signInWithPhone, verifyOtp } = useAuth();
    const { toast } = useToast();
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
        resolver: zodResolver(phoneFormSchema),
        defaultValues: { phone: '' }
    });

     const otpForm = useForm<z.infer<typeof otpFormSchema>>({
        resolver: zodResolver(otpFormSchema),
        defaultValues: { otp: '' }
    });

    const handleSendOtp = async (values: z.infer<typeof phoneFormSchema>) => {
        setIsSendingOtp(true);
        try {
            const result = await signInWithPhone(values.phone);
            setConfirmationResult(result);
            toast({
                title: 'OTP Sent!',
                description: 'Check your phone for the verification code.',
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Failed to Send OTP',
                description: error.message || 'Please check the phone number and try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSendingOtp(false);
        }
    }

    const handleVerifyOtp = async (values: z.infer<typeof otpFormSchema>) => {
        if (!confirmationResult) return;
        setIsVerifyingOtp(true);
        try {
            const userCredential = await verifyOtp(confirmationResult, values.otp);
             if (userCredential) {
                toast({
                    title: 'Login Successful!',
                    description: 'Welcome back!',
                });
             }
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Invalid OTP',
                description: 'The code you entered is incorrect. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsVerifyingOtp(false);
        }
    }


    if (confirmationResult) {
        return (
             <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
                    <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Enter OTP</FormLabel>
                        <FormControl>
                            <Input placeholder="123456" {...field} disabled={isVerifyingOtp} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setConfirmationResult(null)}>Back</Button>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isVerifyingOtp}>
                            {isVerifyingOtp ? 'Verifying...' : 'Verify OTP & Sign In'}
                        </Button>
                    </div>
                </form>
            </Form>
        )
    }

    return (
        <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-6">
                <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <Input placeholder="+1 123 456 7890" {...field} disabled={isSendingOtp} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSendingOtp}>
                {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                </Button>
            </form>
        </Form>
    )

}


export default function LoginPage() {
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">Sign in with Email</TabsTrigger>
                    <TabsTrigger value="phone">Sign in with Phone</TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="pt-6">
                    <EmailSignInForm />
                </TabsContent>
                <TabsContent value="phone" className="pt-6">
                   <PhoneSignInForm />
                </TabsContent>
            </Tabs>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline text-accent">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      {/* This invisible div is required for Firebase phone auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
