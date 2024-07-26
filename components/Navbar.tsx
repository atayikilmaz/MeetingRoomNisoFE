// components/Navbar.tsx
"use client"

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-200 fixed top-0 left-0 right-0 z-[100] py-5">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">MeetingRooms</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0">
          <li><Link href="/">Home</Link></li>
          {user && (
            <li><Link href="/calendar">Calendar</Link></li>
          )}
          {user && user.role === 'Admin' && (
            <>
              <li><Link href="/meeting-rooms">Meeting Rooms</Link></li>
              <li><Link href="/manage-users">Manage Users</Link></li>
            </>
          )}
          {user ? (
            <li><button onClick={logout}>Logout</button></li>
          ) : (
            <>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;