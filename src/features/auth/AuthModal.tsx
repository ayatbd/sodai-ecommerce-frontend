import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAuthModalOpen, setAuthModalTab, addToast } from '../../store/slices/uiSlice';
import { setCredentials } from '../../store/slices/authSlice';
import { INITIAL_USER, ADMIN_USER } from '../../services/mockData';
import { Dialog } from '../../components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, User, ShieldCheck, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function AuthModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAuthModalOpen);
  const activeTab = useAppSelector((state) => state.ui.authModalTab);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'alex.rivera@aura-studio.com', password: 'password123' },
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    // Simulated authentication
    const user = data.email.includes('admin') ? ADMIN_USER : { ...INITIAL_USER, email: data.email };
    dispatch(setCredentials({ user, token: 'jwt-auth-token-xyz' }));
    dispatch(setAuthModalOpen(false));
    dispatch(
      addToast({
        title: 'Welcome Back',
        description: `Signed in as ${user.name}`,
        type: 'success',
      })
    );
  };

  const onSignup = async (data: RegisterFormData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'customer' as const,
      createdAt: new Date().toISOString(),
    };
    dispatch(setCredentials({ user: newUser, token: 'jwt-auth-token-xyz' }));
    dispatch(setAuthModalOpen(false));
    dispatch(
      addToast({
        title: 'Account Created',
        description: `Welcome to AURA Studio, ${data.name}!`,
        type: 'success',
      })
    );
  };

  const fillDemoAccount = (type: 'customer' | 'admin') => {
    const user = type === 'admin' ? ADMIN_USER : INITIAL_USER;
    dispatch(setCredentials({ user, token: 'jwt-demo-token-123' }));
    dispatch(setAuthModalOpen(false));
    dispatch(
      addToast({
        title: 'Demo Session Active',
        description: `Loaded profile: ${user.name} (${user.role})`,
        type: 'success',
      })
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => dispatch(setAuthModalOpen(open))}
      maxWidth="md"
      className="p-6"
    >
      <div className="text-center space-y-1 pb-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold mb-2">
          AU
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          AURA Studio Identity
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Sign in to access your orders, saved addresses, and studio privileges.
        </p>
      </div>

      {/* Quick 1-click Demo Fillers */}
      <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Quick Demo Access (1-Click)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('customer')}
            className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-left text-xs hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 transition-colors"
          >
            <p className="font-semibold text-neutral-900 dark:text-white">Alex Rivera</p>
            <p className="text-[10px] text-neutral-400">Customer View</p>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin')}
            className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-left text-xs hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 transition-colors"
          >
            <p className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
              <span>Elena Vance</span>
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
            </p>
            <p className="text-[10px] text-neutral-400">Admin Console View</p>
          </button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => dispatch(setAuthModalTab(val as 'login' | 'register'))}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Create Account</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4 pt-2">
            <Input
              label="Email Address"
              type="email"
              prefixIcon={<Mail className="h-4 w-4" />}
              placeholder="alex.rivera@aura-studio.com"
              {...registerLogin('email')}
              error={loginErrors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              prefixIcon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              {...registerLogin('password')}
              error={loginErrors.password?.message}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  dispatch(setAuthModalOpen(false));
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/forgot-password');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(setAuthModalOpen(false));
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/login');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="font-medium text-neutral-800 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white underline-offset-4 hover:underline"
              >
                Full screen view →
              </button>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoginSubmitting}
            >
              Sign In
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-3 pt-2">
            <Input
              label="Full Name"
              prefixIcon={<User className="h-4 w-4" />}
              placeholder="Alex Rivera"
              {...registerSignup('name')}
              error={signupErrors.name?.message}
            />

            <Input
              label="Email Address"
              type="email"
              prefixIcon={<Mail className="h-4 w-4" />}
              placeholder="alex.rivera@example.com"
              {...registerSignup('email')}
              error={signupErrors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              prefixIcon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              {...registerSignup('password')}
              error={signupErrors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              prefixIcon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              {...registerSignup('confirmPassword')}
              error={signupErrors.confirmPassword?.message}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSignupSubmitting}
            >
              Create Account
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}
