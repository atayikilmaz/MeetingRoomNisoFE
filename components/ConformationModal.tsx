"use client"
import React, { useState, useEffect } from 'react';
import MeetingRoomCard from "@/components/MeetingRoomCard";
import { getMeetingRooms, createMeetingRoom, deleteMeetingRoom } from '@/lib/api';
import { withAuth } from '@/components/WithAuth';

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
      setMeetingRooms(currentRooms => currentRooms.filter(room => room.id !== id));
    } catch (err) {
      console.error('Failed to delete meeting room', err);
      setError('Failed to delete meeting room');
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
    <div className="bg-base-200 p-4 flex flex-col items-center relative mt-40 mx-2 rounded-lg min-h-20">
      <div className="w-full flex justify-end mb-4">
        <button 
          className="btn btn-primary text-2xl"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>
      </div>
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
      {meetingRooms.length === 0 ? (
        <div className="text-center text-gray-500">No meeting rooms created</div>
      ) : (
        <div className="w-full flex flex-wrap justify-center">
          {meetingRooms.map((room) => (
            <MeetingRoomCard key={room.id} name={room.name} onDelete={() => deleteMeetingRoomHandler(room.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(MeetingRooms, ['Admin']);