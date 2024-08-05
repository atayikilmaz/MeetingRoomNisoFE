"use client";

import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
}

interface Props {
  participantsInputRef: React.RefObject<HTMLInputElement>;
}

const ParticipantInputComponent: React.FC<Props> = ({ participantsInputRef }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Replace this with your actual API call
      const response = await fetch('/api/users');
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleParticipantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setParticipantInput(value);

    const lastCommaIndex = value.lastIndexOf(",");
    const searchTerm = lastCommaIndex !== -1 ? value.slice(lastCommaIndex + 1).trim() : value.trim();

    if (searchTerm) {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }

    setSelectedUserIndex(-1);
  };

  const handleParticipantSelect = (user: User) => {
    const currentInput = participantsInputRef.current?.value || "";
    const lastCommaIndex = currentInput.lastIndexOf(",");
    const newValue =
      lastCommaIndex !== -1
        ? currentInput.slice(0, lastCommaIndex + 1) + " " + user.name + ", "
        : user.name + ", ";

    if (participantsInputRef.current) {
      participantsInputRef.current.value = newValue;
    }
    setParticipantInput(newValue);
    setFilteredUsers([]);
    setSelectedUserIndex(-1);
  };

  const handleParticipantKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedUserIndex((prev) =>
        prev < filteredUsers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedUserIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedUserIndex >= 0 && selectedUserIndex < filteredUsers.length) {
        handleParticipantSelect(filteredUsers[selectedUserIndex]);
      }
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Participants (comma-separated)"
        className="input input-bordered w-full"
        value={participantInput}
        onChange={handleParticipantInputChange}
        onKeyDown={handleParticipantKeyDown}
        ref={participantsInputRef}
      />
      {filteredUsers.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-700 rounded-md border-slate-700 mt-1 max-h-60 overflow-auto">
          {filteredUsers.map((user, index) => (
            <li
              key={user.id}
              className={`p-2 hover:bg-gray-800 cursor-pointer ${
                index === selectedUserIndex ? 'bg-gray-800' : ''
              }`}
              onClick={() => handleParticipantSelect(user)}
            >
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParticipantInputComponent;