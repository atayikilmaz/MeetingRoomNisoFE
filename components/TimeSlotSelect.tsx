"use client"

// TimeSlotSelectComponent.tsx
import React, { useMemo } from 'react';

interface Props {
  availableSlots: { startTime: string; endTime: string }[];
  selectedStartTime: string;
  setSelectedStartTime: (time: string) => void;
  selectedEndTime: string;
  setSelectedEndTime: (time: string) => void;
  existingMeetings: { start: string; end: string }[];
  isRoomSelected: boolean; 
}

const TimeSlotSelectComponent: React.FC<Props> = ({
  availableSlots,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndTime,
  setSelectedEndTime,
  existingMeetings,
  isRoomSelected, // New prop
}) => {
  const formatTimeInTurkey = (time: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(time));
  };

  const sortedSlots = useMemo(() => {
    return availableSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [availableSlots]);

  const availableStartTimes = useMemo(() => {
    return sortedSlots.filter(slot => {
      const slotStart = new Date(slot.startTime);
      return !existingMeetings.some(meeting => {
        const meetingStart = new Date(meeting.start);
        const meetingEnd = new Date(meeting.end);
        return slotStart >= meetingStart && slotStart < meetingEnd;
      });
    }).map(slot => slot.startTime);
  }, [sortedSlots, existingMeetings]);

  const availableEndTimes = useMemo(() => {
    if (!selectedStartTime) return [];

    const selectedStartDate = new Date(selectedStartTime);
    
    return sortedSlots
      .filter(slot => {
        const slotEndDate = new Date(slot.endTime);
        if (slotEndDate <= selectedStartDate) return false;

        return !existingMeetings.some(meeting => {
          const meetingStart = new Date(meeting.start);
          const meetingEnd = new Date(meeting.end);
          return (
            (selectedStartDate < meetingStart && slotEndDate > meetingStart) ||
            (selectedStartDate >= meetingStart && selectedStartDate < meetingEnd)
          );
        });
      })
      .map(slot => slot.endTime);
  }, [selectedStartTime, sortedSlots, existingMeetings]);

  return (
    <div className="flex space-x-2">
      <select
        className="select select-bordered w-1/2"
        value={selectedStartTime}
        onChange={(e) => {
          setSelectedStartTime(e.target.value);
          setSelectedEndTime('');
        }}
        disabled={!isRoomSelected} // Disable if no room is selected
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
        disabled={!selectedStartTime}
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