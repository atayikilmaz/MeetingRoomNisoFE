"use client"

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg, EventClickArg, EventChangeArg } from '@fullcalendar/core';

interface MeetingEvent extends Omit<EventInput, 'start' | 'end'> {
  start: string;
  end: string;
  participants?: string[];
  meetingRoom?: string;
}

const InteractiveCalendar: React.FC = () => {
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'add' | 'edit' | 'delete' | 'view'>('add');
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const participantsInputRef = useRef<HTMLInputElement>(null);
  const roomInputRef = useRef<HTMLInputElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const start = selectInfo.start;
    const end = selectInfo.end;
    
    setSelectedEvent({
      start: toLocalISOString(start),
      end: toLocalISOString(new Date(end.getTime() - 1)), // Subtract 1 millisecond
      allDay: selectInfo.allDay,
    });
    setModalAction('add');
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: toLocalISOString(event.start!),
      end: toLocalISOString(new Date(event.end!.getTime() - 1)), // Subtract 1 millisecond
      allDay: event.allDay,
      participants: event.extendedProps.participants,
      meetingRoom: event.extendedProps.meetingRoom,
    });
    setModalAction('view');
    setIsModalOpen(true);
  };

  const handleEventChange = (changeInfo: EventChangeArg) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => 
        event.id === changeInfo.event.id
          ? {
              ...event,
              start: changeInfo.event.start?.toISOString() || '',
              end: changeInfo.event.end?.toISOString() || '',
              allDay: changeInfo.event.allDay,
            }
          : event
      );
    });
  };

  const handleModalConfirm = () => {
    if ((modalAction === 'add' || modalAction === 'edit') && titleInputRef.current) {
      const start = fromLocalISOString(startInputRef.current?.value || '');
      let end = fromLocalISOString(endInputRef.current?.value || '');
      
      // Add 1 millisecond to the end date
      end = new Date(end.getTime() + 1);
  
      const newEvent: MeetingEvent = {
        id: selectedEvent?.id || createEventId(),
        title: titleInputRef.current.value,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 0 && end.getMinutes() === 0,
        participants: participantsInputRef.current?.value.split(',').map(p => p.trim()),
        meetingRoom: roomInputRef.current?.value,
      };
  
      setEvents(prevEvents => {
        if (modalAction === 'edit') {
          return prevEvents.map(event => event.id === newEvent.id ? newEvent : event);
        } else {
          return [...prevEvents, newEvent];
        }
      });
    } else if (modalAction === 'delete' && selectedEvent) {
      setEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEvent.id));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden text-black p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          editable={true}
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
        onEdit={() => setModalAction('edit')}
        onDelete={() => setModalAction('delete')}
      />
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'add' | 'edit' | 'delete' | 'view';
  event: MeetingEvent | null;
  titleInputRef: React.RefObject<HTMLInputElement>;
  participantsInputRef: React.RefObject<HTMLInputElement>;
  roomInputRef: React.RefObject<HTMLInputElement>;
  startInputRef: React.RefObject<HTMLInputElement>;
  endInputRef: React.RefObject<HTMLInputElement>;
  onEdit: () => void;
  onDelete: () => void;
}

const Modal: React.FC<ModalProps> = ({ 
    isOpen, onClose, onConfirm, action, event, 
    titleInputRef, participantsInputRef, roomInputRef, startInputRef, endInputRef,
    onEdit, onDelete
  }) => {
    useEffect(() => {
        if (event) {
          if (titleInputRef.current) titleInputRef.current.value = event.title || '';
          if (participantsInputRef.current) participantsInputRef.current.value = event.participants?.join(', ') || '';
          if (roomInputRef.current) roomInputRef.current.value = event.meetingRoom || '';
          if (startInputRef.current) startInputRef.current.value = event.start;
          if (endInputRef.current) endInputRef.current.value = event.end;
        }
      }, [event, action]);

 

  if (!isOpen) return null;

  const isViewMode = action === 'view';
  const isDeleteMode = action === 'delete';

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {action === 'add' ? 'Add New Event' : 
           action === 'edit' ? 'Edit Event' :
           action === 'delete' ? 'Delete Event' : 'View Event'}
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
            <input
              type="text"
              placeholder="Participants (comma-separated)"
              className="input input-bordered w-full"
              ref={participantsInputRef}
              readOnly={isViewMode}
            />
            <input
              type="text"
              placeholder="Meeting Room"
              className="input input-bordered w-full"
              ref={roomInputRef}
              readOnly={isViewMode}
            />
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
          <p className="py-4">Are you sure you want to delete &quot;{event?.title}&quot;?</p>
        )}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Cancel</button>
          {isViewMode ? (
            <>
              <button className="btn btn-primary" onClick={onEdit}>Edit</button>
              <button className="btn btn-error" onClick={onDelete}>Delete</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onConfirm}>
              {action === 'add' ? 'Add' : action === 'edit' ? 'Update' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function createEventId() {
  return String(Date.now());
}

function toLocalISOString(date: Date): string {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
    return localISOTime.slice(0, 16);
  }
  
  function fromLocalISOString(isoString: string): Date {
    return new Date(isoString);
  }

export default InteractiveCalendar;
