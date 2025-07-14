import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from './authStore';

export interface Message {
  id: string;
  text: string;
  sender_id: string;
  receiver_id: string;
  chat_id: string;
  created_at: string;
  read: boolean;
}

export interface Chat {
  id: string;
  property_id: string;
  property_title: string;
  property_title_bn: string;
  owner_id: string;
  owner_name: string;
  owner_name_bn: string;
  owner_avatar: string;
  tenant_id: string;
  tenant_name: string;
  tenant_name_bn: string;
  tenant_avatar: string;
  last_message: string;
  last_message_bn: string;
  last_message_time: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  currentChat: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  createChat: (propertyId: string, ownerId: string) => Promise<string>;
  setCurrentChat: (chatId: string | null) => void;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  subscribeToMessages: (chatId: string) => void;
  unsubscribeFromMessages: (chatId: string) => void;
  getOtherUserId: (chatId: string) => string;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  currentChat: null,
  loading: false,
  error: null,

  fetchChats: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`owner_id.eq.${currentUser.id},tenant_id.eq.${currentUser.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // You may want to fetch user/property details separately here if needed
      set({ chats: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching chats:', error);
      set({ error: 'Failed to fetch chats', loading: false });
    }
  },

  fetchMessages: async (chatId: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: data || []
        }
      }));

      // Mark messages as read
      get().markMessagesAsRead(chatId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  sendMessage: async (chatId: string, text: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || !text.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: currentUser.id,
          text: text.trim(),
          receiver_id: get().getOtherUserId(chatId),
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update last message in chat
      await supabase
        .from('chats')
        .update({
          last_message: text.trim(),
          last_message_bn: text.trim(), // You can add translation logic here
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      // Add message to local state
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), data]
        }
      }));

      // Refresh chats to update last message
      get().fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },

  createChat: async (propertyId: string, ownerId: string): Promise<string> => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error('User not authenticated');

    try {
      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('property_id', propertyId)
        .eq('owner_id', ownerId)
        .eq('tenant_id', currentUser.id)
        .single();

      if (existingChat) {
        return existingChat.id;
      }

      // If ownerId is the same as propertyId, it means we don't have a real user ID
      // In this case, we'll create a chat with the property ID as owner
      const actualOwnerId = ownerId === propertyId ? propertyId : ownerId;

      // Create new chat
      const { data, error } = await supabase
        .from('chats')
        .insert({
          property_id: propertyId,
          owner_id: actualOwnerId,
          tenant_id: currentUser.id,
          last_message: '',
          last_message_bn: '',
          unread_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh chats
      get().fetchChats();

      return data.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  setCurrentChat: (chatId: string | null) => {
    set({ currentChat: chatId });
    if (chatId) {
      get().fetchMessages(chatId);
    }
  },

  markMessagesAsRead: async (chatId: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('chat_id', chatId)
        .eq('receiver_id', currentUser.id)
        .eq('read', false);

      // Update unread count in chat
      await supabase
        .from('chats')
        .update({ unread_count: 0 })
        .eq('id', chatId);

      // Refresh chats
      get().fetchChats();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  subscribeToMessages: (chatId: string) => {
    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), newMessage]
          }
        }));

        // Update chats if this is the current chat
        if (get().currentChat === chatId) {
          get().markMessagesAsRead(chatId);
        } else {
          get().fetchChats();
        }
      })
      .subscribe();

    return subscription;
  },

  unsubscribeFromMessages: (chatId: string) => {
    supabase.channel(`messages:${chatId}`).unsubscribe();
  },

  // Helper method to get the other user's ID in a chat
  getOtherUserId: (chatId: string): string => {
    const currentUser = useAuthStore.getState().user;
    const chat = get().chats.find(c => c.id === chatId);
    
    if (!chat || !currentUser) return '';
    
    return chat.owner_id === currentUser.id ? chat.tenant_id : chat.owner_id;
  }
})); 