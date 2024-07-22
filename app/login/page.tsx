"use client"

import { useState, FormEvent } from 'react';
import Link from 'next/link'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Simulate API call
    try {
      // Replace this with your actual login logic
      console.log('Login with:', email, password);
      // Simulate successful login
      setTimeout(() => {
        setIsLoading(false);
        setMessage('Login successful!');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setMessage('Login failed. Please try again.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <form className="w-full max-w-md" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
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
        <div className="flex items-center justify-between">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>


          <Link className="btn btn-warning" href="/register">
        Register
          </Link>
          
        </div>
        
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </main>
  );
}