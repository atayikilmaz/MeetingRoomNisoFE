
// ModalComponent.tsx
import React, { useState, useEffect } from 'react';
import ParticipantInputComponent from '@/components/CalendarParticipantInput';
import TimeSlotSelectComponent from '@/components/TimeSlotSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "add" | "edit" | "delete" | "view";
  event: any;
  titleInputRef: React.RefObject<HTMLInputElement>;
  participantsInputRef: React.RefObject<HTMLInputElement>;
  roomInputRef: React.RefObject<HTMLSelectElement>;
  startInputRef: React.RefObject<HTMLInputElement>;
  endInputRef: React.RefObject<HTMLInputElement>;
  onEdit: () => void;
  onDelete: () => void;
  meetingRooms: { id: number; name: string }[];
  participantInput: string;
  setParticipantInput: React.Dispatch<React.SetStateAction<string>>;
  handleParticipantInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParticipantKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  filteredUsers: any[];
  handleParticipantSelect: (user: any) => void;
  selectedUserIndex: number;
  availableSlots: { startTime: string; endTime: string }[];
  selectedStartTime: string;
  setSelectedStartTime: (time: string) => void;
  selectedEndTime: string;
  setSelectedEndTime: (time: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  fetchAvailableTimeSlots: (date: string) => void;
  existingMeetings: { start: string; end: string; roomId: string }[];
  isLoading: boolean;
  
}

const ModalComponent: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  event,
  titleInputRef,
  participantsInputRef,
  roomInputRef,
  startInputRef,
  endInputRef,
  onEdit,
  onDelete,
  meetingRooms,
  participantInput,
  setParticipantInput,
  handleParticipantInputChange,
  handleParticipantKeyDown,
  filteredUsers,
  handleParticipantSelect,
  selectedUserIndex,
  availableSlots,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndTime,
  setSelectedEndTime,
  selectedDate,
  setSelectedDate,
  fetchAvailableTimeSlots,
  existingMeetings,
  isLoading,
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      if (titleInputRef.current)
        titleInputRef.current.value = event.title || "";
      if (roomInputRef.current)
        roomInputRef.current.value = event.meetingRoom || "";
      if (startInputRef.current) startInputRef.current.value = event.start;
      if (endInputRef.current) endInputRef.current.value = event.end;
      
      // Update this line to correctly set the participant input
      setParticipantInput(event.participants?.join(", ") || "");
      console.log("event paricc"+event.participants);
      
    }
  }, [event, action, setParticipantInput]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const isViewMode = action === "view";
  const isDeleteMode = action === "delete";

  const handleConfirm = () => {
    if (action === "delete" || validateForm()) {
      onConfirm();
    }
  };

  const validateForm = () => {
    if (!titleInputRef.current?.value) {
      setError("Event title is required");
      return false;
    }
    if (!participantInput) {
      setError("At least one participant is required");
      return false;
    }
    if (!roomInputRef.current?.value) {
      setError("Meeting room must be selected");
      return false;
    }
    if (!selectedDate) {
      setError("Date must be selected");
      return false;
    }
    if (!selectedStartTime || !selectedEndTime) {
      setError("Start and end times must be selected");
      return false;
    }
    setError(null);
    return true;
  };

  return (
    <div className="modal modal-open text-slate-200">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {action === "add"
            ? "Add New Event"
            : action === "edit"
            ? "Edit Event"
            : action === "delete"
            ? "Delete Event"
            : "View Event"}
        </h3>
        {error && (
          <div className="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}
        {!isDeleteMode && (
          <div className="space-y-4 mt-4">
            <input
              type="text"
              placeholder="Event Title"
              className="input input-bordered w-full"
              ref={titleInputRef}
              disabled={isViewMode}
            />
            <ParticipantInputComponent
              participantInput={participantInput}
              handleParticipantInputChange={handleParticipantInputChange}
              handleParticipantKeyDown={handleParticipantKeyDown}
              filteredUsers={filteredUsers}
              handleParticipantSelect={handleParticipantSelect}
              selectedUserIndex={selectedUserIndex}
              disabled={isViewMode}
            />
            <div className="relative">
              <select
                className="select select-bordered w-full"
                ref={roomInputRef}
                disabled={isViewMode}
                onChange={(e) => {
                  const selectedRoomId = e.target.value;
                  const selectedRoom = meetingRooms.find(
                    (room) => room.id.toString() === selectedRoomId
                  );
                  if (selectedRoom) {
                    fetchAvailableTimeSlots(selectedDate);
                  }
                }}
              >
                {event?.meetingRoom ? null : (
                  <option value="">Select a meeting room</option>
                )}
                {meetingRooms.map((room) => (
                  <option key={room.id} value={room.id.toString()}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="date"
              className="input input-bordered w-full"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedStartTime('');
                setSelectedEndTime('');
              }}
              disabled={isViewMode}
            />
            <TimeSlotSelectComponent
  availableSlots={availableSlots}
  selectedStartTime={selectedStartTime}
  setSelectedStartTime={setSelectedStartTime}
  selectedEndTime={selectedEndTime}
  setSelectedEndTime={setSelectedEndTime}
  existingMeetings={existingMeetings}
  isRoomSelected={!!roomInputRef.current?.value}
  selectedRoom={roomInputRef.current?.value || ''}
  disabled={isViewMode}
  isNewMeeting={action === 'add'} // Add this line
/>
          </div>
        )}
        {isDeleteMode && (
          <p className="py-4">
            Are you sure you want to delete &quot;{event?.title}&quot;?
          </p>
        )}
        <div className="modal-action justify-between">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          {isViewMode ? (
            <div className="flex flex-wrap space-x-2">
              <button className="btn btn-primary" onClick={onEdit}>
                Edit
              </button>
              <button className="btn btn-error" onClick={onDelete}>
                Delete
              </button>
            </div>
          ) : (
            <button 
      className="btn btn-error" 
      onClick={handleConfirm}
      disabled={isLoading || (action !== "delete" && !validateForm())}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : null}
      {action === "add"
        ? "Add"
        : action === "edit"
        ? "Update"
        : "Delete"}
    </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;