import React, { useRef, useEffect } from 'react';

interface Props {
  participantInput: string;
  handleParticipantInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParticipantKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  filteredUsers: any[];
  handleParticipantSelect: (user: any) => void;
  selectedUserIndex: number;
  disabled?: boolean;
}

const ParticipantInputComponent: React.FC<Props> = ({
  participantInput,
  handleParticipantInputChange,
  handleParticipantKeyDown,
  filteredUsers,
  handleParticipantSelect,
  selectedUserIndex,
  disabled
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      input.setSelectionRange(input.value.length, input.value.length);
    }
    console.log("particapnts :: "+participantInput);
    
  }, [participantInput]);

  return (
    <div className="relative">
     <input
  ref={inputRef}
  type="text"
  placeholder="Participants (comma-separated)"
  className="input input-bordered w-full"
  value={participantInput}
  onChange={handleParticipantInputChange}
  onKeyDown={handleParticipantKeyDown}
  disabled={disabled}
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