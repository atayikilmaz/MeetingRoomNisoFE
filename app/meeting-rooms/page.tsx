// MeetingRooms.tsx

"use client"
import React, { useState, useEffect } from 'react';
import MeetingRoomCard from "@/components/MeetingRoomCard";
import { getMeetingRooms, createMeetingRoom, deleteMeetingRoom } from '@/lib/api';
import {  withAuth  } from '@/components/WithAuth';

interface MeetingRoom {
  id: number;
  name: string;
}

 function MeetingRooms() {
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetingRooms();
  }, []);

  const fetchMeetingRooms = async () => {
    try {
      setIsLoading(true);
      const rooms = await getMeetingRooms();
      setMeetingRooms(rooms);
      setError(null);
    } catch (err) {
      setError('Failed to fetch meeting rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMeetingRoomHandler = async (id: number) => {
    try {
      await deleteMeetingRoom(id);
      // Filter out the deleted room
      setMeetingRooms(currentRooms => currentRooms.filter(room => room.id !== id));
    } catch (err) {
      console.error('Failed to delete meeting room', err);
      setError('Failed to delete meeting room');
      // Optionally, re-fetch rooms or handle the error state in the UI
    }
  };

  const addMeetingRoom = async () => {
    try {
      const newRoom = await createMeetingRoom(newRoomName);
      setMeetingRooms([...meetingRooms, newRoom]);
      setIsModalOpen(false);
      setNewRoomName('');
    } catch (err) {
      setError('Failed to add meeting room');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-base-200 p-4 flex flex-wrap justify-center relative mt-40 ">
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
        <MeetingRoomCard key={room.id} name={room.name} onDelete={() => deleteMeetingRoomHandler(room.id)} />
      ))}
    </div>
  );
}

export default withAuth(MeetingRooms, ['Admin']);

