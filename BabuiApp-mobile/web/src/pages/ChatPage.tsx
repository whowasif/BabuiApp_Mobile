import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Phone, Video, MoreVertical, Search, ArrowLeft, MessageCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useChatStore, Chat, Message } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useUserProfiles } from '../hooks/useUserProfiles';

const ChatPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get URL parameters for direct chat navigation
  const ownerIdFromUrl = searchParams.get('owner');
  const propertyIdFromUrl = searchParams.get('property');

  // Chat store
  const {
    chats,
    messages,
    currentChat,
    loading,
    error,
    fetchChats,
    fetchMessages,
    sendMessage,
    createChat,
    setCurrentChat,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useChatStore();

  const currentUser = useAuthStore((state) => state.user);

  // Get all unique user IDs from chats
  const userIds = Array.from(new Set([
    ...chats.map(c => c.owner_id),
    ...chats.map(c => c.tenant_id)
  ].filter(Boolean)));
  const { userMap } = useUserProfiles(userIds);

  // Auto-select chat if coming from property detail page
  useEffect(() => {
    if (ownerIdFromUrl && propertyIdFromUrl && currentUser) {
      const targetChat = chats.find(chat => 
        chat.property_id === propertyIdFromUrl && 
        (chat.owner_id === ownerIdFromUrl || chat.tenant_id === ownerIdFromUrl)
      );
      if (targetChat && currentChat !== targetChat.id) {
        setCurrentChat(targetChat.id);
      } else if (!targetChat && !currentChat) {
        createChat(propertyIdFromUrl, ownerIdFromUrl).then((chatId) => {
          setCurrentChat(chatId);
        }).catch((error) => {
          console.error('Error creating chat:', error);
        });
      }
    }
    // Only run when these change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerIdFromUrl, propertyIdFromUrl, currentUser, createChat, currentChat]);

  // Subscribe to real-time messages when chat is selected
  useEffect(() => {
    if (currentChat) {
      subscribeToMessages(currentChat);
      return () => unsubscribeFromMessages(currentChat);
    }
  }, [currentChat, subscribeToMessages, unsubscribeFromMessages]);

  // Fetch chats on component mount
  useEffect(() => {
    if (currentUser) {
      fetchChats();
    }
  }, [currentUser, fetchChats]);

  // Remove duplicate chats by id before filtering
  const uniqueChats = [];
  const seenChatIds = new Set();
  for (const chat of chats) {
    if (!seenChatIds.has(chat.id)) {
      uniqueChats.push(chat);
      seenChatIds.add(chat.id);
    }
  }
  const filteredChats = uniqueChats.filter(chat => {
    // Show the other participant's name
    const isOwner = chat.owner_id === currentUser?.id;
    const otherUserId = isOwner ? chat.tenant_id : chat.owner_id;
    const otherUser = userMap[otherUserId] || {};
    const name = (language === 'bn' ? otherUser.name_bn : otherUser.name_en) || otherUserId || '';
    const property = (chat.property_title_bn && language === 'bn' ? chat.property_title_bn : chat.property_title) || chat.property_id || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           property.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedChatData = chats.find(chat => chat.id === currentChat);
  const chatMessages = useMemo(() => (currentChat ? messages[currentChat] || [] : []), [currentChat, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    sendMessage(currentChat, message);
    setMessage('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatTime(dateString);
    } else if (diffInHours < 48) {
      return t('yesterday', 'গতকাল', 'Yesterday');
    } else {
      return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const getOtherUserInfo = (chat: Chat) => {
    const isOwner = chat.owner_id === currentUser?.id;
    return {
      name: isOwner ? chat.tenant_name : chat.owner_name,
      nameBn: isOwner ? chat.tenant_name_bn : chat.owner_name_bn,
      avatar: isOwner ? chat.tenant_avatar : chat.owner_avatar,
      online: false // You can implement online status logic here
    };
  };

  const isMessageFromCurrentUser = (message: Message) => {
    return message.sender_id === currentUser?.id;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-amber-200">
          <MessageCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-800 mb-2">
            {t('login-required', 'লগইন প্রয়োজন', 'Login Required')}
          </h2>
          <p className="text-amber-600 mb-4">
            {t('login-to-chat', 'চ্যাট করতে লগইন করুন', 'Please login to access chat')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
          >
            {t('back-to-home', 'হোমে ফিরে যান', 'Back to Home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List */}
        <div className={`
          w-full md:w-80 bg-white border-r border-amber-200 flex flex-col shadow-lg
          ${currentChat ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Header */}
          <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <h1 className="text-2xl font-bold mb-4">
              {t('messages', 'বার্তা', 'Messages')}
            </h1>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={16} />
              <input
                type="text"
                placeholder={t('search-chats', 'চ্যাট খুঁজুন', 'Search chats')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/70"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-amber-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p>{t('loading-chats', 'চ্যাট লোড হচ্ছে...', 'Loading chats...')}</p>
              </div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const isOwner = chat.owner_id === currentUser?.id;
                const otherUserId = isOwner ? chat.tenant_id : chat.owner_id;
                const otherUser = userMap[otherUserId] || {};
                const avatar = otherUser.profile_picture_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherUser.name_en || 'User');
                const name = (language === 'bn' ? otherUser.name_bn : otherUser.name_en) || otherUserId || 'Unknown User';
                return (
                  <button
                    key={`${chat.id}-${chat.owner_id}-${chat.tenant_id}`}
                    onClick={() => setCurrentChat(chat.id)}
                    className={`
                      w-full p-4 border-b border-amber-100 hover:bg-amber-50 transition-colors text-left flex items-center gap-3
                      ${currentChat === chat.id ? 'bg-amber-100 border-r-4 border-r-amber-500' : ''}
                    `}
                  >
                    <div className="relative">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 shadow"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-amber-900 truncate">
                          {name}
                        </h3>
                        <span className="text-xs text-amber-600">
                          {chat.last_message_time ? formatDate(chat.last_message_time) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-amber-700 truncate">
                          {language === 'bn' ? chat.last_message_bn || '' : chat.last_message || ''}
                        </p>
                        {chat.unread_count > 0 && (
                          <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-amber-600">
                <MessageCircle className="mx-auto h-12 w-12 mb-4" />
                <p>{t('no-chats-found', 'কোন চ্যাট পাওয়া যায়নি', 'No chats found')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`
          flex-1 flex flex-col bg-white
          ${currentChat ? 'flex' : 'hidden md:flex'}
        `}>
          {currentChat && selectedChatData ? (
            <>
              {/* Chat Header */}
              {(() => {
                const isOwner = selectedChatData.owner_id === currentUser?.id;
                const otherUserId = isOwner ? selectedChatData.tenant_id : selectedChatData.owner_id;
                return (
                  <div className="bg-white p-4 border-b border-amber-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCurrentChat(null)}
                        className="md:hidden p-2 hover:bg-amber-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft size={20} className="text-amber-600" />
                      </button>
                      <div className="relative">
                        <img
                          src={userMap[otherUserId]?.profile_picture_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userMap[otherUserId]?.name_en || 'User')}
                          alt={userMap[otherUserId]?.name_en || 'User'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-200 shadow"
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold text-amber-900">
                          {language === 'bn' ? userMap[otherUserId]?.name_bn : userMap[otherUserId]?.name_en || otherUserId}
                        </h2>
                        <p className="text-sm text-amber-600">
                          {t('offline', 'অফলাইন', 'Offline')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
                        <Phone size={20} className="text-amber-600" />
                      </button>
                      <button className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
                        <Video size={20} className="text-amber-600" />
                      </button>
                      <button className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
                        <MoreVertical size={20} className="text-amber-600" />
                      </button>
                    </div>
                  </div>
                );
              })()}
              {/* Property Context */}
              {(() => {
                const isOwner = selectedChatData.owner_id === currentUser?.id;
                const otherUserId = isOwner ? selectedChatData.tenant_id : selectedChatData.owner_id;
                return (
                  <div className="bg-amber-50 border-b border-amber-200 p-3">
                    <span
                      onClick={() => handlePropertyClick(selectedChatData.property_id)}
                      style={{ cursor: 'pointer', textDecoration: 'underline', color: '#b45309' }}
                      className="text-sm text-amber-700 hover:text-amber-800 hover:underline bg-white px-3 py-2 rounded-lg border border-amber-200 hover:border-amber-300 transition-all duration-300"
                    >
                      {t('discussing-property', 'আলোচনা করছেন', 'Discussing')}: {' '}
                      {language === 'bn' ? selectedChatData.property_title_bn : selectedChatData.property_title}
                    </span>
                  </div>
                );
              })()}
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-amber-50/30 to-orange-50/30">
                {chatMessages.map((msg) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  const sender = userMap[msg.sender_id] || {};
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-end gap-2">
                        {!isMe && (
                          <img
                            src={sender.profile_picture_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(sender.name_en || 'User')}
                            alt={sender.name_en || 'User'}
                            className="w-8 h-8 rounded-full object-cover border-2 border-amber-200 shadow"
                          />
                        )}
                        <div
                          className={`
                            max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm
                            ${isMe
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-none'
                              : 'bg-white text-amber-900 border border-amber-200 rounded-bl-none'
                            }
                          `}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`
                            text-xs mt-2
                            ${isMe ? 'text-amber-100' : 'text-amber-500'}
                          `}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                        {isMe && (
                          <img
                            src={sender.profile_picture_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(sender.name_en || 'User')}
                            alt={sender.name_en || 'User'}
                            className="w-8 h-8 rounded-full object-cover border-2 border-amber-200 shadow"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-amber-200">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('type-message', 'একটি বার্তা লিখুন...', 'Type a message...')}
                    className="flex-1 px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50/50"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`
                      p-3 rounded-xl transition-all duration-300 transform hover:scale-105
                      ${message.trim()
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg'
                        : 'bg-amber-100 text-amber-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  {t('select-chat', 'একটি চ্যাট নির্বাচন করুন', 'Select a chat')}
                </h3>
                <p className="text-amber-600">
                  {t('start-conversation', 'কথোপকথন শুরু করতে একটি চ্যাট নির্বাচন করুন', 'Choose a chat to start conversation')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;