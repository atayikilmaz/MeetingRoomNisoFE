"use client"


import React, { useState, useRef, useEffect } from 'react';
import CalendarComponent from '@/components/Calendar';
import ModalComponent from '@/components/CalendarModal';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting, getMeetingRooms, getUsers, fetchAvailableSlots } from '@/lib/api';
import { withAuth } from '@/components/WithAuth';
import { log } from 'console';


interface MeetingEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  participants: string[];
  meetingRoom: string;
}

interface Room {
  id: number;
  name: string;
  // Add other properties if needed
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
  const [existingMeetings, setExistingMeetings] = useState<{ start: string; end: string; roomId: string; id: number}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [roomColors, setRoomColors] = useState<{[key: string]: string}>({});


  useEffect(() => {
    fetchMeetingRooms();
    fetchMeetings();
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
        allDay: false,
        participants: meeting.participants,
        meetingRoom: meeting.meetingRoom,
        meetingRoomId: meeting.meetingRoomId,
        color: roomColors[meeting.meetingRoomId] // Assign color based on room
      }));
      setEvents(formattedMeetings);
      
      // Set existingMeetings
      setExistingMeetings(meetings.map((meeting: any) => ({
        start: meeting.startDateTime,
        end: meeting.endDateTime,
        roomId: meeting.meetingRoomId.toString(),
        id: meeting.id
      })));
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const fetchMeetingRooms = async () => {
    try {
      const rooms: Room[] = await getMeetingRooms();
      setMeetingRooms(rooms);
      
      // Predefined colors - you can add more if needed
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
        '#F7DC6F', '#BB8FCE', '#7FB3D5', '#E59866', '#DAF7A6',
        '#FF9FF3', '#00CED1', '#FFA500', '#20B2AA', '#DDA0DD',
        '#32CD32', '#FF4500', '#1E90FF', '#FFD700', '#8A2BE2'
      ];
  
      const newRoomColors: {[key: number]: string} = {};
  
      rooms.forEach((room: Room) => {
        // Use the room's ID to deterministically select a color
        const colorIndex = room.id % colors.length;
        newRoomColors[room.id] = colors[colorIndex];
      });
  
      setRoomColors(newRoomColors);
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
    const roomId = roomInputRef.current?.value;
    
    if (roomId) {
      try {
        console.log("Fetching slots for room:", roomId);
        const excludeMeetingId = modalAction === "edit" ? selectedEvent?.id : undefined;
        const slots = await fetchAvailableSlots(roomId, date, excludeMeetingId);
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
  
    // Reset time-related states
    setSelectedStartTime('');
    setSelectedEndTime('');
  
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
  
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
  
    const selectedEvent = {
      id: event.id,
      title: event.title,
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      allDay: event.allDay,
      participants: event.extendedProps.participants || [],
      meetingRoom: roomId ? roomId.toString() : "",
    };
    setSelectedEvent(selectedEvent);
    
    setModalAction("view");
    setIsModalOpen(true);
    resetModalState(selectedEvent);
  
    // Set participant input
    setParticipantInput(selectedEvent.participants.join(", "));
  
    // Set selected date, start time, and end time
    setSelectedDate(selectedEvent.start);
    setSelectedStartTime(startDate.toTimeString().slice(0, 5));
    setSelectedEndTime(endDate.toTimeString().slice(0, 5));
  
    // Fetch available time slots for the selected date
    fetchAvailableTimeSlots(selectedEvent.start);
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
      setIsLoading(true);
  
      console.log("Selected modate:", selectedDate);
      console.log("Selected mostart time:", selectedStartTime);
      console.log("Selected moend time:", selectedEndTime);
  
      try {
        // Validate date and time inputs
        if (!selectedDate || !selectedStartTime || !selectedEndTime) {
          console.error("Missing date or time:", { selectedDate, selectedStartTime, selectedEndTime });
          throw new Error("Date and time must be selected");
        }
  
        // Function to parse time string and combine with date
        const parseDateTime = (dateStr: string, timeStr: string): Date => {
          if (timeStr.includes('T')) {
            // If it's already an ISO string, just parse it
            return new Date(timeStr);
          } else {
            // If it's in "HH:MM" format, combine with the date
            const [hours, minutes] = timeStr.split(':');
            const dateTime = new Date(dateStr);
            dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            return dateTime;
          }
        };
  
        const start = parseDateTime(selectedDate, selectedStartTime);
        const end = parseDateTime(selectedDate, selectedEndTime);
  
        console.log("Start time:", start);
        console.log("End time:", end);
  
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
        const participantNames = participantInput
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name !== "");
  
        const participantIds = participantNames
          .map((name) => {
            const user = users.find((u) => u.name === name);
            return user ? user.id : null;
          })
          .filter((id): id is number => id !== null);
  
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
      } finally {
        setIsLoading(false);
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
    setSelectedStartTime('');
    setSelectedEndTime('');
    setSelectedDate('');
    if (participantsInputRef.current) {
      participantsInputRef.current.value = "";
    }
  };

  const resetModalState = (event: MeetingEvent | null) => {
    if (event) {
      if (titleInputRef.current)
        titleInputRef.current.value = event.title || "";
      if (roomInputRef.current)
        roomInputRef.current.value = event.meetingRoom || "";
      if (startInputRef.current) startInputRef.current.value = event.start;
      if (endInputRef.current) endInputRef.current.value = event.end;
  
      // Directly set the participant names
      setParticipantInput(event.participants.join(", "));
    } else {
      if (titleInputRef.current) titleInputRef.current.value = "";
      if (roomInputRef.current) roomInputRef.current.value = "";
      if (startInputRef.current) startInputRef.current.value = "";
      if (endInputRef.current) endInputRef.current.value = "";
      setParticipantInput("");
    }
    setFilteredUsers([]);
    setSelectedUserIndex(-1);
  };

  const handleParticipantInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setParticipantInput(value);  // Add this line to update the state
  
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
        handleParticipantSelect(selectedUser);
      }
    }
  };

  const handleParticipantSelect = (user: any) => {
    setParticipantInput((prevInput) => {
      const parts = prevInput.split(',').map(p => p.trim());
      
      // Replace the last part (partial input) with the selected user's full name
      parts[parts.length - 1] = user.name;
      
      // Filter out any empty parts, join, and add a comma and space at the end
      return parts.filter(p => p !== '').join(', ') + ', ';
    });
    setFilteredUsers([]);
    setSelectedUserIndex(-1);
    
    
  };

  return (
    <div className="p-2 sm:p-4 mt-32 bg-base-200 rounded-xl mx-2 md:mx-32">
    <div className="bg-white shadow-lg rounded-lg overflow-hidden text-black container mx-auto p-2 sm:p-4 ">
      <div className="calendar-container ">
        
        
         <CalendarComponent
            events={events}
            handleDateSelect={handleDateSelect}
            handleEventClick={handleEventClick}
            handleEventChange={handleEventChange}
            roomColors={roomColors} // Pass roomColors to CalendarComponent
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
  setParticipantInput={setParticipantInput}  // Add this line
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
  isLoading={isLoading}
  selectedEventId={selectedEvent?.id || 0}
/>
      </div>
    </div>
  );
};

export default withAuth(Calendar, ["Admin", "User"]); 
