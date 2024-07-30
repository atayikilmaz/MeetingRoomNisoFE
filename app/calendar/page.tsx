"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { withAuth } from "@/components/WithAuth";


import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventChangeArg,
} from "@fullcalendar/core";
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingRooms,
  getUsers,
} from "@/lib/api";

interface MeetingEvent extends Omit<EventInput, "start" | "end"> {
  start: string;
  end: string;
  participants?: string[];
  meetingRoom?: string;
}

interface User {
  id: string;
  name: string;
}

const InteractiveCalendar: React.FC = () => {
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<
    "add" | "edit" | "delete" | "view"
  >("add");
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const participantsInputRef = useRef<HTMLInputElement>(null);
  const roomInputRef = useRef<HTMLSelectElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const [meetingRooms, setMeetingRooms] = useState<
    { id: number; name: string }[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [participantInput, setParticipantInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    fetchMeetings();
    fetchMeetingRooms();
    fetchUsers();
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16); // Format to "YYYY-MM-DDTHH:MM"
    setMinDate(formattedDate);
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const meetingsData = await getMeetings();
      setEvents(
        meetingsData.map((meeting: any) => ({
          id: meeting.id,
          title: meeting.name,
          start: meeting.startDateTime,
          end: meeting.endDateTime,
          participants: meeting.participants,
          meetingRoom: meeting.meetingRoom,
        }))
      );
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const fetchMeetingRooms = async () => {
    try {
      const roomsData = await getMeetingRooms();
      setMeetingRooms(roomsData);
    } catch (error) {
      console.error("Error fetching meeting rooms:", error);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const start = selectInfo.start;
    const end = selectInfo.end;

    const newEvent = {
      start: toLocalISOString(start),
      end: toLocalISOString(new Date(end.getTime() - 1)),
      allDay: selectInfo.allDay,
    };
    setSelectedEvent(newEvent);
    setModalAction("add");
    setIsModalOpen(true);
    resetModalState(newEvent);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    let roomId = event.extendedProps.meetingRoomId;

    if (roomId === undefined && event.extendedProps.meetingRoom) {
      const room = meetingRooms.find(
        (room) => room.name === event.extendedProps.meetingRoom
      );
      roomId = room ? room.id : null;
    }

    const selectedEvent = {
      id: event.id,
      title: event.title,
      start: toLocalISOString(event.start!),
      end: toLocalISOString(new Date(event.end!.getTime() - 1)),
      allDay: event.allDay,
      participants: event.extendedProps.participants,
      meetingRoom: roomId ? roomId.toString() : "",
    };
    setSelectedEvent(selectedEvent);
    setModalAction("view");
    setIsModalOpen(true);
    resetModalState(selectedEvent);
  };

  const handleEventChange = async (changeInfo: EventChangeArg) => {
    try {
      const id = Number(changeInfo.event.id);
      const updatedEvent = {
        name: changeInfo.event.title,
        startDateTime: changeInfo.event.start?.toISOString(),
        endDateTime: changeInfo.event.end?.toISOString(),
        meetingRoomId: changeInfo.event.extendedProps.meetingRoomId,
        participantIds: changeInfo.event.extendedProps.participants, // Keep as strings
      };
      await updateMeeting(id, updatedEvent);
      fetchMeetings();
    } catch (error) {
      console.error("Error updating meeting:", error);
    }
  };

 

  const handleModalConfirm = async () => {
    if ((modalAction === "add" || modalAction === "edit") && titleInputRef.current) {
      const start = fromLocalISOString(startInputRef.current?.value || "");
      let end = fromLocalISOString(endInputRef.current?.value || "");
      end = new Date(end.getTime() + 1);
  
      // Split the participant input and trim each name
      const participantNames = participantsInputRef.current?.value
        ? participantsInputRef.current.value
            .split(",")
            .map((name) => name.trim())
            .filter((name) => name !== "")
        : [];
  
      // Map names to IDs, filtering out any that don't match
      const participantIds = participantNames
        .map((name) => {
          const user = users.find((u) => u.name === name);
          return user ? user.id : null;
        })
        .filter((id): id is string => id !== null);
  
      const meetingData = {
        name: titleInputRef.current.value,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        meetingRoomId: Number(roomInputRef.current?.value || 0),
        participantIds: participantIds,
      };
  
      try {
        if (modalAction === "edit" && selectedEvent) {
          const id = Number(selectedEvent.id);
          await updateMeeting(id, meetingData);
        } else {
          await createMeeting(meetingData);
        }
        fetchMeetings();
      } catch (error) {
        console.error("Error saving meeting:", error);
      }
    } else if (modalAction === "delete" && selectedEvent) {
      try {
        await deleteMeeting(Number(selectedEvent.id));
        fetchMeetings();
      } catch (error) {
        console.error("Error deleting meeting:", error);
      }
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setParticipantInput("");
    setFilteredUsers([]);
    setSelectedUserIndex(-1);
    if (participantsInputRef.current) {
      participantsInputRef.current.value = "";
    }
  };

  const resetModalState = (event: MeetingEvent | null) => {
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
    } else {
      if (titleInputRef.current) titleInputRef.current.value = "";
      if (participantsInputRef.current) participantsInputRef.current.value = "";
      if (roomInputRef.current) roomInputRef.current.value = "";
      if (startInputRef.current) startInputRef.current.value = "";
      if (endInputRef.current) endInputRef.current.value = "";
    }
    setParticipantInput(event?.participants?.join(", ") || "");
    setFilteredUsers([]);
    setSelectedUserIndex(-1);
  };

  const handleParticipantInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setParticipantInput(value);
  
    const lastCommaIndex = value.lastIndexOf(",");
  
    const searchTerm =
      lastCommaIndex !== -1
        ? value.slice(lastCommaIndex + 1).trim()
        : value.trim();
  
    if (searchTerm) {
      const filtered = users.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
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

  const handleParticipantKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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
    <div className=" p-2 mx-2 sm:p-4 mt-32 bg-base-200 rounded-lg  sm:mx-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden text-black container mx-auto p-2 sm:p-4">
        <div className="calendar-container h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)] lg:h-[calc(100vh-20rem)]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            longPressDelay={300}
            initialView="dayGridMonth"
            editable={true}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            validRange={{
              start: startOfYear,
              end: endOfYear,
            }}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventChange={handleEventChange}
            height="auto"
            aspectRatio={1.35}
          />
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
          action={modalAction}
          event={selectedEvent}
          titleInputRef={titleInputRef}
          participantsInputRef={participantsInputRef}
          roomInputRef={roomInputRef}
          startInputRef={startInputRef}
          endInputRef={endInputRef}
          onEdit={() => setModalAction("edit")}
          onDelete={() => setModalAction("delete")}
          meetingRooms={meetingRooms}
          participantInput={participantInput}
          handleParticipantInputChange={handleParticipantInputChange}
          handleParticipantKeyDown={handleParticipantKeyDown}
          filteredUsers={filteredUsers}
          handleParticipantSelect={handleParticipantSelect}
          selectedUserIndex={selectedUserIndex}
        />
      </div>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "add" | "edit" | "delete" | "view";
  event: MeetingEvent | null;
  titleInputRef: React.RefObject<HTMLInputElement>;
  participantsInputRef: React.RefObject<HTMLInputElement>;
  roomInputRef: React.RefObject<HTMLSelectElement>;
  startInputRef: React.RefObject<HTMLInputElement>;
  endInputRef: React.RefObject<HTMLInputElement>;
  onEdit: () => void;
  onDelete: () => void;
  meetingRooms: { id: number; name: string }[];
  participantInput: string;
  handleParticipantInputChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleParticipantKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  filteredUsers: User[];
  handleParticipantSelect: (user: User) => void;
  selectedUserIndex: number;
}

const Modal: React.FC<ModalProps> = ({
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
  handleParticipantInputChange,
  handleParticipantKeyDown,
  filteredUsers,
  handleParticipantSelect,
  selectedUserIndex,
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
            <div className="relative">
              <input
                type="text"
                placeholder="Participants (comma-separated)"
                className="input input-bordered w-full"
                ref={participantsInputRef}
                readOnly={isViewMode}
                onChange={handleParticipantInputChange}
                onKeyDown={handleParticipantKeyDown}
                value={participantInput}
              />
              {filteredUsers.length > 0 && (
                <ul className="absolute z-10 w-full bg-gray-700  rounded-md border-slate-700 mt-1 max-h-60  overflow-auto">
                  {filteredUsers.map((user, index) => (
                    <li
                      key={user.id}
                      className={`p-2 hover:bg-gray-800  cursor-pointer ${
                        index === selectedUserIndex ? "bg-gray-800" : ""
                      }`}
                      onClick={() => handleParticipantSelect(user)}
                    >
                      {user.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative">
              <select
                className={`select select-bordered w-full ${
                  isViewMode ? "custom-disabled" : ""
                }`}
                ref={roomInputRef}
                disabled={isViewMode}
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
              <style jsx>{`
                .custom-disabled {
                  opacity: 1;
                  color: #a7adba;
                  cursor: default;
                  pointer-events: none;
                }
              `}</style>
            </div>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              ref={startInputRef}
              readOnly={isViewMode}
            />
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              ref={endInputRef}
              readOnly={isViewMode}
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
            <>
              <div className="flex flex-wrap space-x-2">
                <button className="btn btn-primary" onClick={onEdit}>
                  Edit
                </button>
                <button className="btn btn-error" onClick={onDelete}>
                  Delete
                </button>
              </div>
            </>
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

function toLocalISOString(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, -1);
  return localISOTime.slice(0, 16);
}

function fromLocalISOString(isoString: string): Date {
  return new Date(isoString);
}

export default withAuth(InteractiveCalendar, ["User", "Admin"]);
