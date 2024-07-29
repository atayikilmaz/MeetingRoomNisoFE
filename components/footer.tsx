"use client"

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-base-200 text-gray-200 py-6 mt-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Logo and description */}
          <div className="mb-4 md:mb-0 md:w-1/2">
            <Link href="/" className="text-xl font-bold">MeetingRooms</Link>
            <p className="mt-2 text-sm">Streamline your scheduling process and make room management a breeze. Efficient, intuitive, and always at your service.</p>
          </div>

          {/* Quick Links */}
          <nav className="md:w-1/2 text-right">
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="flex flex-wrap justify-end gap-4">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              {user && (
                <li><Link href="/calendar" className="hover:text-primary">Calendar</Link></li>
              )}
              {user && user.role === 'Admin' && (
                <>
                  <li><Link href="/meeting-rooms" className="hover:text-primary">Rooms</Link></li>
                  <li><Link href="/manage-users" className="hover:text-primary">Users</Link></li>
                </>
              )}
              {!user && (
                <>
                  <li><Link href="/login" className="hover:text-primary">Login</Link></li>
                  <li><Link href="/register" className="hover:text-primary">Register</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MeetingRooms. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;