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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getUsers()
      .then(data => {
        console.log('Fetched users:', data);
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  useEffect(() => {
    const results = users.filter(user =>
      getDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const getDisplayName = (user: User) => {
    return user.name || user.userName || user.email.split('@')[0] || 'Unknown';
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId)
      .then(() => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setIsDeleteModalOpen(false);
      })
      .catch(error => console.error('Error deleting user:', error));
  };

  const handleChangeUserRole = (userId: string, newRole: string) => {
    changeUserRole(userId, newRole)
      .then(() => {
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setIsChangeRoleModalOpen(false);
      })
      .catch(error => console.error('Error updating user role:', error));
  };

  return (
    <div className="container mx-auto px-24 py-4">
      <h2 className="text-4xl font-extrabold mt-4 text-center mb-10 text-slate-100">User List</h2>
      
      {/* Search input */}
      <div className="flex mb-4 mx-32">
        <div className="form-control flex-grow mr-2">
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </div>

      <div className="overflow-x-auto shadow-md sm:rounded-lg rounded border-base-200 border-4 border-b-0">
        <table className="table w-full text-sm text-left text-gray-400 dark:text-gray-400 rounded-full">
          <thead className="text-base text-gray-200 uppercase dark:text-gray-200 rounded-t-lg">
            <tr>
              <th scope="col" className="py-3 px-6">Name</th>
              <th scope="col" className="py-3 px-6">Email</th>
              <th scope="col" className="py-3 px-6">Role</th>
              <th scope="col" className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="text-base border-b-4 border-base-200 dark:bg-gray-800">
                <td className="py-4 px-6">{getDisplayName(user)}</td>
                <td className="py-4 px-6">{user.email}</td>
                <td className="py-4 px-6">{user.role}</td>
                <td className="py-4 px-6">
                  <div className='flex flex-col md:flex-row text-center sm:text-left'>
                    <button
                      className="btn btn-sm btn-warning mb-2 md:mr-2"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsChangeRoleModalOpen(true);
                      }}
                    >
                      Change Role
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">Are you sure you want to delete {getDisplayName(selectedUser)}?</p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={() => handleDeleteUser(selectedUser.id)}
              >
                Confirm
              </button>
              <button
                className="btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Confirmation Modal */}
      {isChangeRoleModalOpen && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Role Change</h3>
            <p className="py-4">Are you sure you want to change the role of {getDisplayName(selectedUser)}?</p>
            <div className="modal-action">
              <button
                className="btn btn-warning"
                onClick={() => handleChangeUserRole(selectedUser.id, selectedUser.role === 'User' ? 'Admin' : 'User')}
              >
                Confirm
              </button>
              <button
                className="btn"
                onClick={() => setIsChangeRoleModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}