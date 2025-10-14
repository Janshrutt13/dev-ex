'use client';

import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SignupPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data : any) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', data);
      localStorage.setItem('token', response.data.token);
      toast.success('Account created successfully!');
      router.push('/feed');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <Toaster position="top-center" />
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Create your Dev-Ex Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
            <input
              {...register('username', { required: 'Username is required' })}
              id="username"
              type="text"
              className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username.message as string}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              {...register('email', { required: 'Email is required' })}
              id="email"
              type="email"
              className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message as string}</p>}
          </div>

          {/* Password Field */}
           <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
              id="password"
              type="password"
              className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message as string}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;