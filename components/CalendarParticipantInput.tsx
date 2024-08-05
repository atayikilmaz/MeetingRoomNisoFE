"use client";

import React from 'react';

interface User {
  id: string;
  name: string;
}

interface Props {
  participantInput: string;
  handleParticipantInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParticipantKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  filteredUsers: User[];
  handleParticipantSelect: (user: User) => void;
  selectedUserIndex: number;
  participantsInputRef: React.RefObject<HTMLInputElement>;
}

const ParticipantInputComponent: React.FC<Props> = ({
  participantInput,
  handleParticipantInputChange,
  handleParticipantKeyDown,
  filteredUsers,
  handleParticipantSelect,
  selectedUserIndex,
  participantsInputRef,
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Add participants"
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