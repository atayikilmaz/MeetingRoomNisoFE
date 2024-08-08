"use client";

import React, { useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Props {
  events: any[];
  handleDateSelect: (selectInfo: any) => void;
  handleEventClick: (clickInfo: any) => void;
  handleEventChange: (changeInfo: any) => void;
  roomColors: {[key: string]: string};
}

const CalendarComponent: React.FC<Props> = ({
  events,
  handleDateSelect,
  handleEventClick,
  handleEventChange,
  roomColors,
}) => {
  const [isMonthView, setIsMonthView] = useState(true);

  const handleDatesSet = useCallback((arg: any) => {
    setIsMonthView(arg.view.type === 'dayGridMonth');
  }, []);

  const eventClassNames = (arg: any) => {
    const roomId = arg.event.extendedProps.meetingRoomId;
    return [`room-${roomId}`];
  };

  // Create a style element to hold our dynamic styles
  React.useEffect(() => {
    const style = document.createElement('style');
    document.head.appendChild(style);
    Object.entries(roomColors).forEach(([roomId, color]) => {
      style.sheet?.insertRule(`.room-${roomId} { background-color: ${color}; border-color: ${color}; }`);
    });
    // Add a rule to change the cursor for all event elements
    style.sheet?.insertRule('.fc-event { cursor: pointer !important; }');
    return () => {
      document.head.removeChild(style);
    };
  }, [roomColors]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      longPressDelay={300}
      initialView="dayGridMonth"
      firstDay={1}
      editable={isMonthView}
      slotMinTime="06:00:00"
      slotMaxTime="24:00:00"
      selectable={isMonthView}
      selectMirror={isMonthView}
      dayMaxEvents={true}
      weekends={true}
      events={events}
      select={isMonthView ? handleDateSelect : undefined}
      eventClick={isMonthView ? handleEventClick : undefined}
      eventChange={isMonthView ? handleEventChange : undefined}
      height="auto"
      aspectRatio={1.35}
      slotLabelFormat={{
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: false,
        hour12: false
      }}
      eventTimeFormat={{
        hour: 'numeric',
        minute: '2-digit',
        meridiem: false,
        hour12: false
      }}
      datesSet={handleDatesSet}
      eventStartEditable={false}
      eventClassNames={eventClassNames}
    />
  );
};

export default CalendarComponent;