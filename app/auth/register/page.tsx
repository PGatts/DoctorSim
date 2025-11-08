'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed');
        return;
      }

      // Redirect to login after successful registration
      router.push('/auth/login?registered=true');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 to-green-200 px-4">
      <div className="dialog-box bg-white p-8 rounded-lg max-w-md w-full shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900" style={{ fontFamily: 'var(--font-pixel)' }}>
          Doctor Sim
        </h1>
        <h2 className="text-xl text-center mb-8 text-gray-900">Create Account</h2>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-900">
              Full Name
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-4 py-3 border-3 border-black rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder:text-gray-500"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-900">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-3 border-3 border-black rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder:text-gray-500"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-900">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-4 py-3 border-3 border-black rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder:text-gray-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2 text-gray-900">
              Confirm Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-3 border-3 border-black rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder:text-gray-500"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="pixel-button w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-900">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-green-600 hover:text-green-800 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

