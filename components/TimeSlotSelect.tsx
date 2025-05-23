"use client"

// TimeSlotSelectComponent.tsx
import React, { useMemo, useEffect, useState } from 'react';

interface Props {
  availableSlots: { startTime: string; endTime: string }[];
  selectedStartTime: string;
  setSelectedStartTime: (time: string) => void;
  selectedEndTime: string;
  setSelectedEndTime: (time: string) => void;
  existingMeetings: { start: string; end: string; roomId: string; id: number}[];
  isRoomSelected: boolean;
  selectedRoom: string;
  disabled?: boolean;
  isNewMeeting: boolean; 
  selectedEventId: number;
}

const TimeSlotSelectComponent: React.FC<Props> = ({
  availableSlots,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndTime,
  setSelectedEndTime,
  existingMeetings,
  isRoomSelected,
  selectedRoom,
  disabled,
  isNewMeeting, 
  selectedEventId,
}) => {

  const [startTimeChanged, setStartTimeChanged] = useState(false);

  const formatTimeInTurkey = (time: string) => {
    try {
      let date;
      if (time.includes('T')) {
        // If it's an ISO string (e.g., "2023-06-15T14:30:00Z")
        date = new Date(time);
      } else if (time.includes(':')) {
        // If it's just a time string (e.g., "14:30")
        const [hours, minutes] = time.split(':');
        date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
      } else {
        // If it's a timestamp
        date = new Date(parseInt(time, 10));
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      return new Intl.DateTimeFormat('tr-TR', {
        timeZone: 'Europe/Istanbul',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Error formatting time:', error, 'Time:', time);
      return 'Invalid Time';
    }
  };

  
  const sortedSlots = useMemo(() => {
    return availableSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [availableSlots]);

  const availableStartTimes = useMemo(() => {
    let times = sortedSlots.filter(slot => {
      const slotStart = new Date(slot.startTime);
      return !existingMeetings.some(meeting => {
        if (meeting.roomId !== selectedRoom) return false;
        const meetingStart = new Date(meeting.start);
        const meetingEnd = new Date(meeting.end);
        return slotStart >= meetingStart && slotStart < meetingEnd;
      });
    }).map(slot => slot.startTime);

    if (selectedStartTime && !times.includes(selectedStartTime)) {
      times.push(selectedStartTime);
      times.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    }

    return times;
  }, [sortedSlots, existingMeetings, selectedStartTime, selectedRoom]);

  const availableEndTimes = useMemo(() => {
    if (!selectedStartTime) return [];

    const selectedStartDate = new Date(selectedStartTime);
    
    // Find the next meeting in the same room
    const nextMeeting = existingMeetings
      .filter(meeting => meeting.roomId === selectedRoom)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .find(meeting => new Date(meeting.start) > selectedStartDate);
      
    let maxEndTime = nextMeeting ? new Date(nextMeeting.start) : null;

    let times = sortedSlots
      .filter(slot => {
        const slotEndDate = new Date(slot.endTime);
        if (slotEndDate <= selectedStartDate) return false;
        if (maxEndTime && slotEndDate > maxEndTime) return false;

        return !existingMeetings.some(meeting => {
          if (meeting.roomId !== selectedRoom) return false;
          const meetingStart = new Date(meeting.start);
          const meetingEnd = new Date(meeting.end);
          return (
            (selectedStartDate < meetingStart && slotEndDate > meetingStart) ||
            (selectedStartDate >= meetingStart && selectedStartDate < meetingEnd)
          );
        });
      })
      .map(slot => slot.endTime);

    if (selectedEndTime && !times.includes(selectedEndTime)) {
      times.push(selectedEndTime);
      times.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    }

    return times;
  }, [selectedStartTime, selectedEndTime, sortedSlots, existingMeetings, selectedRoom]);

  useEffect(() => {
    if (isNewMeeting) {
      setSelectedStartTime('');
      setSelectedEndTime('');
      setStartTimeChanged(false);
    } else {
      setStartTimeChanged(false);
    }
  }, [selectedRoom, setSelectedStartTime, setSelectedEndTime, isNewMeeting]);


  useEffect(() => {
    console.log('Selected Start Time:', selectedStartTime);
    console.log('Selected End Time:', selectedEndTime);

  }, [selectedStartTime, selectedEndTime, availableStartTimes, availableEndTimes]);

  useEffect(() => {
    if (selectedStartTime && !availableStartTimes.includes(selectedStartTime)) {
      console.warn('Selected start time is not in available start times');
    }
    if (selectedEndTime && !availableEndTimes.includes(selectedEndTime)) {
      console.warn('Selected end time is not in available end times');
    }
  }, [selectedStartTime, selectedEndTime, availableStartTimes, availableEndTimes]);


  

  return (
    <div className="flex space-x-2">
      <select
        className="select select-bordered w-1/2"
        value={selectedStartTime}
        onChange={(e) => {
          setSelectedStartTime(e.target.value);
          if (!isNewMeeting) {
            setStartTimeChanged(true);
            setSelectedEndTime('');
          }
        }}
        disabled={!isRoomSelected || disabled}
      >
        <option value="">Select start time</option>
        {availableStartTimes.map((time) => (
          <option key={time} value={time}>
            {formatTimeInTurkey(time)}
          </option>
        ))}
      </select>
      <select
        className="select select-bordered w-1/2"
        value={selectedEndTime}
        onChange={(e) => setSelectedEndTime(e.target.value)}
        disabled={!selectedStartTime || !isRoomSelected || disabled || (!isNewMeeting && !startTimeChanged)}
      >
        <option value="">Select end time</option>
        {availableEndTimes.map((time) => (
          <option key={time} value={time}>
            {formatTimeInTurkey(time)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSlotSelectComponent;