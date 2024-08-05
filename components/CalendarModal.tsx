"use client";

import React, { useState, useEffect } from 'react';
import ParticipantInputComponent from '@/components/CalendarParticipantInput';
import TimeSlotSelectComponent from '@/components/TimeSlotSelect';

interface User {
  id: number;
  name: string;
}

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
  availableSlots: { startTime: string; endTime: string }[];
  selectedStartTime: string;
  setSelectedStartTime: (time: string) => void;
  selectedEndTime: string;
  setSelectedEndTime: (time: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  fetchAvailableTimeSlots: (date: string) => void;
  existingMeetings: { start: string; end: string }[];
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
  availableSlots,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndTime,
  setSelectedEndTime,
  selectedDate,
  setSelectedDate,
  fetchAvailableTimeSlots,
  existingMeetings,
}) => {
  useEffect(() => {
    if (event) {
      if (titleInputRef.current)
        titleInputRef.current.value = event.title || "";
      if (participantsInputRef.current)
        participantsInputRef.current.value =
          event.participants?.join(", ") || "";
      if (roomInputRef.current)
        roomInputRef.current.value = event.meetingRoom || "";
      if (startInputRef.current) startInputRef.current.value = event.start;
      if (endInputRef.current) endInputRef.current.value = event.end;
    }
  }, [event, action]);

  if (!isOpen) return null;

  const isViewMode = action === "view";
  const isDeleteMode = action === "delete";

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
        {!isDeleteMode && (
          <div className="space-y-4 mt-4">
            <input
              type="text"
              placeholder="Event Title"
              className="input input-bordered w-full"
              ref={titleInputRef}
              readOnly={isViewMode}
            />
            <ParticipantInputComponent
              participantsInputRef={participantsInputRef}
            />
            <div className="relative">
              <select
                className={`select select-bordered w-full ${
                  isViewMode ? "custom-disabled" : ""
                }`}
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
            <button className="btn btn-error" onClick={onConfirm}>
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