"use client"

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { register, verify2FA } from '@/lib/api'; // Update this path
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';


export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [twoFactorToken, setTwoFactorToken] = useState('');
const [isVerifying2FA, setIsVerifying2FA] = useState(false);
const { login, fetchUserRole } = useAuth();


const validatePassword = (password: string) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasNonAlphanumeric = /\W/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push("an uppercase letter");
  }
  if (!hasLowerCase) {
    errors.push("a lowercase letter");
  }
  if (!hasDigit) {
    errors.push("a number");
  }
  if (!hasNonAlphanumeric) {
    errors.push("a special character");
  }

  return errors.length === 0 ? null : errors;
};

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage('');

  const passwordErrors = validatePassword(password);
  if (passwordErrors) {
    setMessage(`Password must contain ${passwordErrors.join(", ")}.`);
    setIsLoading(false);
    return;
  }

  if (password !== confirmPassword) {
    setMessage('Passwords do not match.');
    setIsLoading(false);
    return;
  }

  try {
    await register(email, password, name);
    setMessage('Registration successful! Please check your email for the 2FA code.');
    setIsVerifying2FA(true);
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      const errorMessage = error.message;
      const match = errorMessage.match(/API request failed: 400 (\{.*\})/);
      if (match) {
        try {
          const errorObj = JSON.parse(match[1]);
          if (errorObj[""] && errorObj[""][0]) {
            setMessage(errorObj[""][0]);
          } else {
            setMessage('Registration failed: Please try again.');
          }
        } catch (parseError) {
          setMessage(errorMessage);
        }
      } else {
        setMessage(errorMessage);
      }
    } else {
      setMessage('Registration failed: An unknown error occurred');
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleVerify2FA = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
  
    try {
      const response = await verify2FA(email, twoFactorToken);
      setMessage(response.message || '2FA verification successful!');
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        await login(email, password); // This should update the AuthContext state
        await fetchUserRole(); // This will fetch and set the user's role
      }
      
      router.push('/calendar');
    } catch (error) {
      console.error('2FA verification error:', error);
      if (error instanceof Error) {
        setMessage(`2FA verification failed: ${error.message}`);
      } else {
        setMessage('2FA verification failed: An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-700 mx-2">
{!isVerifying2FA ? (
      <form className="w-full max-w-md bg-base-200 p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
              <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="input input-bordered w-full"
            id="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            required
          />
        </div>
        <div className="mb-4">
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
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="input input-bordered w-full"
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between pt-4">
          <Link className="btn btn-warning" href="/login">
            Login
          </Link>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
        {message && <p className="mt-4 text-center text-gray-200">{message}</p>}
      </form>
  ) : (
    <form className="w-full max-w-md bg-base-200 p-8 rounded-lg shadow-md" onSubmit={handleVerify2FA}>
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="twoFactorToken">
          2FA Token
        </label>
        <input
          className="input input-bordered w-full"
          id="twoFactorToken"
          type="text"
          placeholder="Enter 2FA token"
          value={twoFactorToken}
          onChange={(e) => setTwoFactorToken(e.target.value)}
          required
        />
      </div>
      <div className="flex items-end justify-end pt-4">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify 2FA'}
        </button>
      </div>
    </form>
  )}

</main>
);
}