'use client';

import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaGithub } from 'react-icons/fa';

const LoginPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      // Send login request to the backend
      const response = await axios.post('http://localhost:5000/api/auth/login', data);
      
      // Store the token from the response
      localStorage.setItem('token', response.data.token);
      
      toast.success('Logged in successfully!');
      
      // Redirect to the feed page
      router.push('/feed');
    } catch (error: any) {
      // Display an error message if login fails
      toast.error(error.response?.data?.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <Toaster position="top-center" />
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Welcome back to Dev-Ex</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
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
              {...register('password', { required: 'Password is required' })}
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
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <div className='relative my-4'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-gray-800 px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>
        <a href='http://localhost:5000/api/auth/github'>
          <Button variant='default' className='w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-700'>
            <FaGithub className="mr-2 h-4 w-4" /> 
            GitHub
          </Button>
        </a>
        <p className="text-sm text-center text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;