"use client"

import { useState, useEffect } from 'react';
import { getUsers, deleteUser, changeUserRole } from '@/lib/api'; // Update this import path as needed

// Define the User type
type User = {
  id: string;
  userName?: string;
  name?: string;
  email: string;
  role: string;
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers()
      .then(data => {
        console.log('Fetched users:', data); // Log the fetched data
        setUsers(data);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Function to get the display name
  const getDisplayName = (user: User) => {
    return user.name || user.userName || user.email.split('@')[0] || 'Unknown';
  };

  // Function to delete a user
  const handleDeleteUser = (userId: string) => {
    deleteUser(userId)
      .then(() => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      })
      .catch(error => console.error('Error deleting user:', error));
  };

  // Function to change a user's role
  const handleChangeUserRole = (userId: string, newRole: string) => {
    changeUserRole(userId, newRole)
      .then(() => {
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      })
      .catch(error => console.error('Error updating user role:', error));
  };

  return (
    <div className="container mx-auto px-4 py-4 ">
      <h2 className="text-4xl font-extrabold mb-4 mt-4 text-center pb-6">User List</h2>
      <div className="overflow-x-auto shadow-md sm:rounded-lg ">
        <table className="table w-full text-sm text-left text-gray-500 dark:text-gray-400  rounded-full ">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-t-lg">
            <tr>
              <th scope="col" className="py-3 px-6">Name</th>
              <th scope="col" className="py-3 px-6">Email</th>
              <th scope="col" className="py-3 px-6">Role</th>
              <th scope="col" className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-400">
                <td className="py-4 px-6">{getDisplayName(user)}</td>
                <td className="py-4 px-6">{user.email}</td>
                <td className="py-4 px-6">{user.role}</td>
                <td className="py-4 px-6">
                  <button
                    className="btn btn-xs btn-error mr-2 hover:bg-red-700"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-xs btn-warning hover:bg-yellow-600"
                    onClick={() => handleChangeUserRole(user.id, user.role === 'User' ? 'Admin' : 'User')}
                  >
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}