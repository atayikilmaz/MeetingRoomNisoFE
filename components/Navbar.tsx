"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
    closeDrawer();
  };

  const closeDrawer = () => {
    const drawerToggle = document.getElementById('my-drawer-3') as HTMLInputElement | null;
    if (drawerToggle) {
      drawerToggle.checked = false; // Close the sidebar
    }
  };

  return (
    <div className="drawer drawer-end">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center pt-10">
        {/* Navbar */}
        <div className="navbar bg-base-200 fixed top-0 left-0 right-0 z-[100] py-5">
          <div className="flex-1">
            <a className="btn btn-ghost normal-case text-xl">MeetingRooms</a>
          </div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal p-0">
              <li><Link href="/" onClick={closeDrawer}>Home</Link></li>
              {user && (
                <li><Link href="/calendar" onClick={closeDrawer}>Calendar</Link></li>
              )}
              {user && user.role === 'Admin' && (
                <>
                  <li><Link href="/meeting-rooms" onClick={closeDrawer}>Meeting Rooms</Link></li>
                  <li><Link href="/manage-users" onClick={closeDrawer}>Manage Users</Link></li>
                </>
              )}
              {user ? (
                <li><button onClick={() => { openLogoutModal(); closeDrawer(); }}>Logout</button></li>
              ) : (
                <>
                  <li><Link href="/login" onClick={closeDrawer}>Login</Link></li>
                  <li><Link href="/register" onClick={closeDrawer}>Register</Link></li>
                </>
              )}
            </ul>
          </div>
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
        </div>
        {/* Page content here */}
        Content
      </div>
      <div className="drawer-side z-[9999]">
        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 text-lg font-bold flex flex-col justify-between">
          <div>
            {/* Sidebar content here */}
            <li><Link href="/" onClick={closeDrawer}>Home</Link></li>
            {user && (
              <li><Link href="/calendar" onClick={closeDrawer}>Calendar</Link></li>
            )}
            {user && user.role === 'Admin' && (
              <>
                <li><Link href="/meeting-rooms" onClick={closeDrawer}>Meeting Rooms</Link></li>
                <li><Link href="/manage-users" onClick={closeDrawer}>Manage Users</Link></li>
              </>
            )}
          </div>
          <div>
            {user ? (
              <li><button onClick={() => { openLogoutModal(); closeDrawer(); }}>Logout</button></li>
            ) : (
              <>
                <li><Link href="/login" onClick={closeDrawer}>Login</Link></li>
                <li><Link href="/register" onClick={closeDrawer}>Register</Link></li>
              </>
            )}
          </div>
        </ul>
      </div>

      {isLogoutModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Logout</h3>
            <p className="py-4">Are you sure you want to log out?</p>
            <div className="modal-action">
              <button className="btn btn-warning" onClick={handleLogout}>Confirm</button>
              <button className="btn" onClick={() => setIsLogoutModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;