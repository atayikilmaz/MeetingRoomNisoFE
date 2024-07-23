"use client"



"use client"

import React, { useState } from 'react';
import MeetingRoomCard from "@/components/MeetingRoomCard";

const initialMeetingRooms = [
  { id: 1, name: "Room A" },
  { id: 2, name: "Room B" },
  { id: 3, name: "Room C" },
];

export default function MeetingRooms() {
  const [meetingRooms, setMeetingRooms] = useState(initialMeetingRooms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const deleteMeetingRoom = (id: number) => {
    setMeetingRooms(meetingRooms.filter(room => room.id !== id));
  };

  const addMeetingRoom = () => {
    const newRoom = { id: Math.max(...meetingRooms.map(room => room.id)) + 1, name: newRoomName };
    setMeetingRooms([...meetingRooms, newRoom]);
    setIsModalOpen(false);
    setNewRoomName('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-700 p-4 flex flex-wrap justify-center relative mt-40">
      <button 
        className="btn btn-primary absolute right-4 top-4 text-2xl"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>
      {isModalOpen && (
        <dialog id="my_modal_3" className="modal modal-open">
          <div className="modal-box relative flex flex-col items-center">
            <form method="dialog">
              <button 
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 m-1 text-lg"
                onClick={closeModal}
              >
                ✕
              </button>
            </form>
            <input 
              type="text" 
              value={newRoomName} 
              onChange={(e) => setNewRoomName(e.target.value)} 
              placeholder="Room Name" 
              className="input input-bordered w-full max-w-xs"
            />
            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={addMeetingRoom}
              >
                Add Room
              </button>
            </div>
          </div>
        </dialog>
      )}
      {meetingRooms.map((room) => (
        <MeetingRoomCard key={room.id} name={room.name} onDelete={() => deleteMeetingRoom(room.id)} />
      ))}
    </div>
  );
}