
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2, GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.16c1.56 0 2.95.54 4.04 1.58l3.1-3.1C17.45 1.99 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.59l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" />
    </svg>
);


export default function LoginPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const signUpForm = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { email: "", password: "" },
    });

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const getFriendlyAuthError = (errorCode: string) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email address already exists. Please log in or use a different email.';
            case 'auth/weak-password':
                return 'The password is too weak. It must be at least 6 characters long.';
            case 'auth/popup-closed-by-user':
                return 'The sign-in window was closed. Please try again.';
             case 'auth/account-exists-with-different-credential':
                return 'An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.';
            case 'auth/invalid-api-key':
            case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
                 return 'Configuration error: The Firebase API key is invalid. Please ensure your environment variables are set up correctly.';
            case 'auth/unauthorized-domain':
                return 'This domain is not authorized for authentication. Please add it to the list of authorized domains in your Firebase console.';
            default:
                console.error('Unhandled Auth Error:', errorCode);
                return 'An unexpected error occurred. Please try again later.';
        }
    }

    const handleSignUp = async (data: SignUpFormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, data.email, data.password);
            toast({ title: "Account Created!", description: "You have been successfully signed up." });
            router.push('/dashboard');
        } catch (err: any) {
            setError(getFriendlyAuthError(err.code));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogin = async (data: LoginFormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast({ title: "Logged In Successfully!", description: "Welcome back." });
            router.push('/dashboard');
        } catch (err: any) {
             setError(getFriendlyAuthError(err.code));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast({ title: "Logged In Successfully!", description: "Welcome!" });
            router.push('/dashboard');
        } catch(err: any) {
            setError(getFriendlyAuthError(err.code));
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handlePasswordReset = async () => {
        setError(null);
        const email = loginForm.getValues("email");
        if (!email) {
            loginForm.setError("email", { type: "manual", message: "Please enter your email to reset the password." });
            return;
        }

        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast({ title: "Password Reset Email Sent", description: "Please check your inbox (and spam folder) for a link to reset your password." });
        } catch(err: any) {
            setError(getFriendlyAuthError(err.code));
        } finally {
            setIsSubmitting(false);
        }
    }

    const switchTabs = () => {
        setError(null);
        setShowPassword(false);
    }
    
    const renderPasswordInput = (form: any, field: any) => (
        <div className="relative">
            <Input 
                type={showPassword ? "text" : "password"} 
                placeholder={form.formState.defaultValues.password === "" ? "••••••••" : "Must be at least 6 characters"}
                {...field}
                disabled={isSubmitting}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
            >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
        </div>
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl">A2G Smart Notes</CardTitle>
                    <CardDescription>Your digital partner for pharmacy success.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full" onValueChange={switchTabs}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login" className="mt-4">
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                                     {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Login Failed</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input placeholder="you@example.com" {...field} disabled={isSubmitting} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Password</FormLabel>
                                                <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handlePasswordReset} disabled={isSubmitting}>Forgot Password?</Button>
                                            </div>
                                            <FormControl>{renderPasswordInput(loginForm, field)}</FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Login
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                        <TabsContent value="signup" className="mt-4">
                           <Form {...signUpForm}>
                                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                                     {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Sign Up Failed</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <FormField control={signUpForm.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input placeholder="you@example.com" {...field} disabled={isSubmitting} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={signUpForm.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>{renderPasswordInput(signUpForm, field)}</FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Account
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                        Google
                    </Button>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                        Sign in with Google requires pop-ups. Please disable your pop-up blocker if you have issues.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

    
