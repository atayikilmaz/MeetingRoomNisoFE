"use client"

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
  
    try {
      await login(email, password);
      setMessage('Login successful!');
      router.push('/calendar'); 
    } catch (error) {
      setIsLoading(false);
      setMessage('Login failed. Please try again.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-700">
      <form className="w-full max-w-md bg-base-200 p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="input input-bordered w-full"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="input input-bordered w-full"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between pt-4">
          <Link className="btn btn-warning" href="/register">
            Register
          </Link>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        {message && <p className="mt-4 text-center text-gray-200">{message}</p>}
      </form>
    </main>
  );
}