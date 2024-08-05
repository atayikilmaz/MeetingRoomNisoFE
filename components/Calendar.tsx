
"use client";


// CalendarComponent.tsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Props {
  events: any[];
  handleDateSelect: (selectInfo: any) => void;
  handleEventClick: (clickInfo: any) => void;
  handleEventChange: (changeInfo: any) => void;
}

const CalendarComponent: React.FC<Props> = ({
  events,
  handleDateSelect,
  handleEventClick,
  handleEventChange,
}) => {
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
      editable={true}
      slotMinTime="06:00:00"
      slotMaxTime="24:00:00"
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      weekends={true}
      events={events}
      select={handleDateSelect}
      eventClick={handleEventClick}
      eventChange={handleEventChange}
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

    />
  );
};

export default CalendarComponent;