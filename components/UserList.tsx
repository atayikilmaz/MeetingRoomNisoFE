"use client"

import { useState, useEffect } from 'react';

// Define the User type
type User = {
  id: number;
  name: string;
  role: string;
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/getUsers')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Function to delete a user
  const deleteUser = (userId: number) => {
    fetch(`http://localhost:3000/deleteUser/${userId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } else {
          console.error('Failed to delete user');
        }
      })
      .catch(error => console.error('Error deleting user:', error));
  };

  // Function to change a user's role
  const changeUserRole = (userId: number, newRole: string) => {
    fetch(`http://localhost:3000/updateUserRole/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
    })
      .then(response => {
        if (response.ok) {
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          ));
        } else {
          console.error('Failed to update user role');
        }
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
              <th scope="col" className="py-3 px-6">
                Name
              </th>
              <th scope="col" className="py-3 px-6">
                Role
              </th>
              <th scope="col" className="py-3 px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-400">
                <td className="py-4 px-6">
                  {user.name}
                </td>
                <td className="py-4 px-6">
                  {user.role}
                </td>
                <td className="py-4 px-6">
                  <button
                    className="btn btn-xs btn-error mr-2 hover:bg-red-700"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-xs btn-warning hover:bg-yellow-600"
                    onClick={() => changeUserRole(user.id, user.role === 'User' ? 'Admin' : 'User')}
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