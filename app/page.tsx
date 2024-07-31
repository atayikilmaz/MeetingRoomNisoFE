"use client"

import Link from 'next/link';
import meetingImage from '../img/hero.png';
import Image from 'next/image'
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="hero bg-slate-700 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse ">
        <div className='bg-gray-100 rounded-lg'>
          <Image
            src={meetingImage}
            className="max-w-md rounded-lg shadow-2xl p-4"
            alt="Meeting Room"
          />
        </div>
        <div className='text-gray-100'>
          <h1 className="text-5xl font-bold">MeetingRooms</h1>
          <p className="py-6">
            A beautifully simple, blazing-fast calendar app for all your various event-based and meeting needs. Streamline your scheduling process and make room meeting a breeze.
          </p>
          <Link 
            href={user ? "/calendar" : "/login"} 
            className="btn btn-primary"
          >
            {user ? "Go To Your Calendar" : "Get Started"}
          </Link>
        </div>
      </div>
    </div>
  );
}