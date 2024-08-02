"use client"


import React, { useState, useRef, useEffect } from 'react';
import CalendarComponent from '@/components/Calendar';
import ModalComponent from '@/components/CalendarModal';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting, getMeetingRooms, getUsers, fetchAvailableSlots } from '@/lib/api';
import { withAuth } from '@/components/WithAuth';


interface MeetingEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  participants: string[];
  meetingRoom: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"add" | "edit" | "delete" | "view">("add");
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const participantsInputRef = useRef<HTMLInputElement>(null);
  const roomInputRef = useRef<HTMLSelectElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const [meetingRooms, setMeetingRooms] = useState<
    { id: number; name: string }[]
  >([]);
  const [users, setUsers] = useState<any[]>([]);
  const [participantInput, setParticipantInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
  const [availableSlots, setAvailableSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [existingMeetings, setExistingMeetings] = useState<{ start: string; end: string }[]>([]);

  useEffect(() => {
    fetchMeetings();
    fetchMeetingRooms();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedDate && isModalOpen) {
      console.log("Fetching available time slots");
      fetchAvailableTimeSlots(selectedDate);
    }
  }, [selectedDate, isModalOpen]);

  const fetchMeetings = async () => {
    try {
      const meetings = await getMeetings();
      const formattedMeetings = meetings.map((meeting: any) => ({
        id: meeting.id,
        title: meeting.name,
        start: meeting.startDateTime,
        end: meeting.endDateTime,
        allDay: false
      }));
      setEvents(formattedMeetings);
      
      // Set existingMeetings
      setExistingMeetings(meetings.map((meeting: any) => ({
        start: meeting.startDateTime,
        end: meeting.endDateTime
      })));
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const fetchMeetingRooms = async () => {
    try {
      const rooms = await getMeetingRooms();
      setMeetingRooms(rooms);
    } catch (error) {
      console.error("Error fetching meeting rooms:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAvailableTimeSlots = async (date: string) => {
    console.log("fetchAvailableTimeSlots called with date:", date);
    const roomId = roomInputRef.current?.value;
    if (roomId) {
      try {
        console.log("Fetching slots for room:", roomId);
        const slots = await fetchAvailableSlots(roomId, date);
        console.log("Fetched slots:", slots);
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      }
    } else {
      console.log("No room selected");
      setAvailableSlots([]);
    }
  };

  const handleDateSelect = async (selectInfo: any) => {
    const start = new Date(selectInfo.start.getTime() + 86400000); // add one day
    const end = new Date(start.getTime() - 1);

    const newEvent: MeetingEvent = {
      id: 0, // or some other default value
      title: '',
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      participants: [],
      meetingRoom: '',
    };

    setSelectedEvent(newEvent);
    setModalAction("add");
    setIsModalOpen(true);

    // Set the selected date
    const selectedDate = start.toISOString().split('T')[0];
    setSelectedDate(selectedDate);

    // Reset other modal state
    resetModalState(newEvent);
  };

  const handleEventClick = (clickInfo: any) => {
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
      start: event.start.toISOString().split('T')[0],
      end: event.end.toISOString().split('T')[0],
      allDay: event.allDay,
      participants: event.extendedProps.participants,
      meetingRoom: roomId ? roomId.toString() : "",
    };
    setSelectedEvent(selectedEvent);
    setModalAction("view");
    setIsModalOpen(true);
    resetModalState(selectedEvent);
  };

  const handleEventChange = async (changeInfo: any) => {
    try {
      const id = Number(changeInfo.event.id);
      const updatedEvent = {
        name: changeInfo.event.title,
        startDateTime: changeInfo.event.start.toISOString(),
        endDateTime: changeInfo.event.end.toISOString(),
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
      try {
        // Validate date and time inputs
        if (!selectedDate || !selectedStartTime || !selectedEndTime) {
          console.error("Missing date or time:", { selectedDate, selectedStartTime, selectedEndTime });
          throw new Error("Date and time must be selected");
        }

        const start = new Date(selectedStartTime);
        const end = new Date(selectedEndTime);

        // Check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error("Invalid date or time:", { start, end });
          throw new Error("Invalid date or time");
        }

        // Check if end time is after start time
        if (end <= start) {
          console.error("End time is not after start time:", { start, end });
          throw new Error("End time must be after start time");
        }

        // Handle participants
        const participantNames = participantsInputRef.current?.value
          ? participantsInputRef.current.value
              .split(",")
              .map((name) => name.trim())
              .filter((name) => name !== "")
          : [];

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

        console.log("Meeting data:", meetingData);

        if (modalAction === "edit" && selectedEvent) {
          const id = Number(selectedEvent.id);
          await updateMeeting(id, meetingData);
        } else {
          await createMeeting(meetingData);
        }
        fetchMeetings();
      } catch (error) {
        console.error("Error saving meeting:", error);
        return; // Exit the function early if there's an error
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
        const selectedUser = filteredUsers[selectedUserIndex];
        setParticipantInput((prev) => {
          if (prev.includes(selectedUser.name)) {
            return prev;
          }
          return `${prev}${prev ? ", " : ""}${selectedUser.name}`;
        });
        setFilteredUsers([]);
        setSelectedUserIndex(-1);
      }
    }
  };

  const handleParticipantSelect = (user: any) => {
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

  return (
    <div className="p-2 mx-2 sm:p-4 mt-32 bg-base-200 rounded-lg sm:mx-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden text-black container mx-auto p-2 sm:p-4">
        <div className="calendar-container h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)] lg:h-[calc(100vh-20rem)]">
          <CalendarComponent
            events={events}
            handleDateSelect={handleDateSelect}
            handleEventClick={handleEventClick}
            handleEventChange={handleEventChange}
          />
        </div>
        <ModalComponent
          isOpen={isModalOpen}
          onClose={handleModalClose}
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
          availableSlots={availableSlots}
          selectedStartTime={selectedStartTime}
          setSelectedStartTime={setSelectedStartTime}
          selectedEndTime={selectedEndTime}
          setSelectedEndTime={setSelectedEndTime}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          fetchAvailableTimeSlots={fetchAvailableTimeSlots}
          existingMeetings={existingMeetings}
        />
      </div>
    </div>
  );
};

export default withAuth(Calendar, ["Admin", "User"]); 
