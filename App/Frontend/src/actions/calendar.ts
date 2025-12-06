import type { SWRConfiguration } from 'swr';
import type { ICalendarEvent } from 'src/types/calendar';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const enableServer = false;

// ❗ CORRIGIDO: antes era endpoints.calendar (OBJETO) — agora é STRING
const CALENDAR_LIST_ENDPOINT = endpoints.calendar.list;

const swrOptions: SWRConfiguration = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

type EventsData = {
  events: ICalendarEvent[];
};

export function useGetEvents() {
  const { data, isLoading, error, isValidating } = useSWR<EventsData>(
    CALENDAR_LIST_ENDPOINT, // string correta
    fetcher,
    { ...swrOptions }
  );

  const memoizedValue = useMemo(() => {
    const events = data?.events.map((event) => ({
      ...event,
      textColor: event.color,
    }));

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !isValidating && !data?.events.length,
    };
  }, [data?.events, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createEvent(eventData: ICalendarEvent) {
  if (enableServer) {
    await axios.post(endpoints.calendar.create, { eventData });
  }

  mutate(
    CALENDAR_LIST_ENDPOINT,
    (currentData: EventsData | undefined) => {
      const currentEvents = currentData?.events || [];

      const events = [...currentEvents, eventData];

      return { ...currentData, events };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function updateEvent(eventData: Partial<ICalendarEvent>) {
  if (enableServer) {
    await axios.put(endpoints.calendar.update, { eventData });
  }

  mutate(
    CALENDAR_LIST_ENDPOINT,
    (currentData: EventsData | undefined) => {
      const currentEvents = currentData?.events || [];

      const events = currentEvents.map((event) =>
        event.id === eventData.id ? { ...event, ...eventData } : event
      );

      return { ...currentData, events };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId: string) {
  if (enableServer) {
    await axios.patch(endpoints.calendar.delete, { eventId });
  }

  mutate(
    CALENDAR_LIST_ENDPOINT,
    (currentData: EventsData | undefined) => {
      const currentEvents = currentData?.events || [];

      const events = currentEvents.filter((event) => event.id !== eventId);

      return { ...currentData, events };
    },
    false
  );
}
