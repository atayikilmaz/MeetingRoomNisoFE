// components/Navbar.tsx
import Link from 'next/link';

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 fixed top-0 left-0 right-0 z-[100] py-5">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">MeetingRooms</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/calendar">Calendar</Link></li>
          <li><Link href="/meeting-rooms">Meeting Rooms</Link></li>
          <li><Link href="/manage-user">Manage User</Link></li>
          <li><Link href="/login">Login</Link></li>
          <li><Link href="/register">Register</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;