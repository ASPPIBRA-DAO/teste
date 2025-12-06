import type { SWRConfiguration } from 'swr';
import type { IChatMessage, IChatParticipant, IChatConversation } from 'src/types/chat';

import { useMemo } from 'react';
import { keyBy } from 'es-toolkit';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const enableServer = false;

// Agora usando uma STRING válida
const CHAT_ROOT = endpoints.chat.root;
const CHAT_PARTICIPANTS = endpoints.chat.participants;
const CHAT_ROOM = endpoints.chat.room;

const swrOptions: SWRConfiguration = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

type ContactsData = {
  contacts: IChatParticipant[];
};

export function useGetContacts() {
  const url = [CHAT_PARTICIPANTS, {}];

  const { data, isLoading, error, isValidating } = useSWR<ContactsData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      contacts: data?.contacts || [],
      contactsLoading: isLoading,
      contactsError: error,
      contactsValidating: isValidating,
      contactsEmpty: !isLoading && !isValidating && !data?.contacts.length,
    }),
    [data?.contacts, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type ConversationsData = {
  conversations: IChatConversation[];
};

export function useGetConversations() {
  const url = [CHAT_ROOT, {}];

  const { data, isLoading, error, isValidating } =
    useSWR<ConversationsData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const byId = data?.conversations.length ? keyBy(data.conversations, (option) => option.id) : {};
    const allIds = Object.keys(byId);

    return {
      conversations: { byId, allIds },
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !isValidating && !allIds.length,
    };
  }, [data?.conversations, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

type ConversationData = {
  conversation: IChatConversation;
};

export function useGetConversation(conversationId: string) {
  const url = conversationId ? [`${CHAT_ROOM}/${conversationId}`, {}] : null;

  const { data, isLoading, error, isValidating } =
    useSWR<ConversationData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      conversation: data?.conversation,
      conversationLoading: isLoading,
      conversationError: error,
      conversationValidating: isValidating,
      conversationEmpty: !isLoading && !isValidating && !data?.conversation,
    }),
    [data?.conversation, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function sendMessage(conversationId: string, messageData: IChatMessage) {
  const conversationsUrl = [CHAT_ROOT, {}];
  const conversationUrl = [`${CHAT_ROOM}/${conversationId}`, {}];

  /**
   * Work on server
   */
  if (enableServer) {
    await axios.put(CHAT_ROOT, { conversationId, messageData });
  }

  /**
   * Local optimistic update – individual conversation
   */
  mutate(
    conversationUrl,
    (currentData) => {
      if (!currentData) return currentData;

      const currentConversation = currentData.conversation;

      const conversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, messageData],
      };

      return { ...currentData, conversation };
    },
    false
  );

  /**
   * Local optimistic update – conversations list
   */
  mutate(
    conversationsUrl,
    (currentData) => {
      if (!currentData) return currentData;

      const updated = currentData.conversations.map((conversation: IChatConversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, messageData] }
          : conversation
      );

      return { ...currentData, conversations: updated };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function createConversation(conversationData: IChatConversation) {
  const url = [CHAT_ROOT, {}];

  const res = await axios.post(CHAT_ROOT, { conversationData });

  mutate(
    url,
    (currentData) => {
      if (!currentData) return currentData;

      return {
        ...currentData,
        conversations: [...currentData.conversations, conversationData],
      };
    },
    false
  );

  return res.data;
}

// ----------------------------------------------------------------------

export async function clickConversation(conversationId: string) {
  if (enableServer) {
    await axios.get(`${CHAT_ROOT}/${conversationId}/seen`);
  }

  mutate(
    [CHAT_ROOT, {}],
    (currentData) => {
      if (!currentData) return currentData;

      const updated = currentData.conversations.map((conversation: IChatConversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
      );

      return { ...currentData, conversations: updated };
    },
    false
  );
}
