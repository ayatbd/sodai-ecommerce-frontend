import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { useLoginMutation } from '../../services/authApi';
import { useNavigateView } from '../../hooks/useNavigateView';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RTK Query login mutation
  const [loginMutation, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex.rivera@aura-studio.com',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      // POST /api/v1/auth/login
      const result = await loginMutation({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      }).unwrap();

      if (result.success && result.token && result.user) {
        // Update Redux state
        dispatch(
          setCredentials({
            user: result.user,
            token: result.token,
            rememberMe: data.rememberMe,
          })
        );

        dispatch(
          addToast({
            title: 'Welcome Back!',
            description: `Signed in as ${result.user.name}`,
            type: 'success',
          })
        );

        // Success redirect to shop
        navigate('shop');
      } else {
        setErrorMessage(result.message || 'Authentication failed. Please try again.');
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.message || err?.error || 'Invalid email or password. Please verify your credentials.';
      setErrorMessage(errorMsg);
    }
  };

  const handleAutofill = (type: 'customer' | 'admin') => {
    if (type === 'customer') {
      setValue('email', 'alex.rivera@aura-studio.com');
      setValue('password', 'password123');
    } else {
      setValue('email', 'admin@aura-studio.com');
      setValue('password', 'admin123');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white font-mono text-xl font-bold shadow-md dark:bg-neutral-100 dark:text-neutral-950">
            AU
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Welcome to AURA
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to access your curated orders, address book, and wishlist.
          </p>
        </div>

        {/* Existing Session Notice */}
        {isAuthenticated && currentUser && (
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/60 shadow-xs text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-neutral-700 dark:text-neutral-300">
                Currently signed in as <strong className="text-neutral-950 dark:text-white">{currentUser.name}</strong>
              </span>
            </div>
            <button
              onClick={() => navigate('shop')}
              className="font-semibold text-neutral-900 hover:underline dark:text-neutral-100 flex items-center gap-1"
            >
              Go to Shop <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Login Card */}
        <Card className="border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-lg dark:border-neutral-800 dark:bg-neutral-900/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to continue to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error State Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3 rounded-lg border border-red-200 bg-red-50/80 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <Input
                id="login-email"
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                autoComplete="email"
                prefixIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Password Field with Visibility Toggle */}
              <div className="space-y-1">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  prefixIcon={<Lock className="h-4 w-4" />}
                  suffixIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              {/* Remember Me & Forgot Password Links */}
              <div className="flex items-center justify-between pt-1">
                <Checkbox
                  id="login-remember-me"
                  label="Remember me"
                  {...register('rememberMe')}
                />
                <button
                  type="button"
                  onClick={() => navigate('forgot-password')}
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-2 font-semibold shadow-md"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
                {!isLoading && <ArrowRight className="h-4 w-4 ml-1.5" />}
              </Button>
            </form>

            {/* Quick Demo Credentials Autofill */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Quick Demo Accounts
                </span>
                <Sparkles className="h-3 w-3 text-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAutofill('customer')}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-left transition-all"
                >
                  <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                    Customer
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate">Alex Rivera</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('admin')}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-left transition-all"
                >
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate">Alexa Vance</p>
                </button>
              </div>
            </div>

            {/* Social Login Section */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-400 dark:bg-neutral-900">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  dispatch(
                    addToast({
                      title: 'Social SSO Demo',
                      description: 'Google Single Sign-On configured for production domains.',
                      type: 'info',
                    })
                  );
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => {
                  dispatch(
                    addToast({
                      title: 'Apple ID Demo',
                      description: 'Apple Sign-In configured with Touch ID / Face ID.',
                      type: 'info',
                    })
                  );
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <svg className="h-4 w-4 fill-current text-neutral-900 dark:text-neutral-100" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.95 1.07.08 2.14-.54 2.79-1.29z" />
                </svg>
                Apple
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center border-t border-neutral-100 dark:border-neutral-800 py-4 bg-neutral-50/50 dark:bg-neutral-850/50 rounded-b-xl">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Don't have an AURA account?{' '}
              <button
                type="button"
                onClick={() => navigate('register')}
                className="font-semibold text-neutral-950 dark:text-white underline-offset-4 hover:underline ml-1"
              >
                Create an account
              </button>
            </p>
          </CardFooter>
        </Card>

        {/* Security Assurance Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>256-Bit SSL Encrypted & Secured Session</span>
        </div>
      </div>
    </div>
  );
}
