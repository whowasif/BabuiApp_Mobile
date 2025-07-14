import React from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

const ChatTest: React.FC = () => {
  const { chats, loading, error, fetchChats } = useChatStore();
  const currentUser = useAuthStore((state) => state.user);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Chat Test Component</h2>
      
      <div className="mb-4">
        <strong>Current User:</strong> {currentUser ? `${currentUser.name} (${currentUser.id})` : 'Not logged in'}
      </div>
      
      <div className="mb-4">
        <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
      </div>
      
      <div className="mb-4">
        <strong>Error:</strong> {error || 'None'}
      </div>
      
      <div className="mb-4">
        <strong>Chats Count:</strong> {chats.length}
      </div>
      
      <button 
        onClick={fetchChats}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Fetch Chats
      </button>
      
      <div className="mt-4">
        <strong>Chats:</strong>
        <ul className="list-disc pl-4 mt-2">
          {chats.map((chat) => (
            <li key={chat.id}>
              {chat.property_title} - {chat.owner_name} & {chat.tenant_name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatTest; 