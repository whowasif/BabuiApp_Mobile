import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Alert } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { usePropertyStore } from '../stores/propertyStore';

export default function ChatScreen({ navigation, route }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { chatId } = route.params || {};
  const user = useAuthStore(state => state.user);
  const chats = useChatStore(state => state.chats);
  const messages = useChatStore(state => state.messages);
  const currentChat = useChatStore(state => state.currentChat);
  const loading = useChatStore(state => state.loading);
  const error = useChatStore(state => state.error);
  
  const fetchChats = useChatStore(state => state.fetchChats);
  const fetchMessages = useChatStore(state => state.fetchMessages);
  const sendMessage = useChatStore(state => state.sendMessage);
  const setCurrentChat = useChatStore(state => state.setCurrentChat);
  const subscribeToMessages = useChatStore(state => state.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore(state => state.unsubscribeFromMessages);
  
  const getProperty = usePropertyStore(state => state.getProperty);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (chatId) {
      setCurrentChat(chatId);
      const subscription = subscribeToMessages(chatId);
      return () => {
        unsubscribeFromMessages(chatId);
      };
    }
  }, [chatId]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentChat) return;
    
    try {
      await sendMessage(currentChat, messageText);
      setMessageText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setCurrentChat(chat.id);
    navigation.setParams({ chatId: chat.id });
  };

  const getPropertyTitle = (propertyId) => {
    const property = getProperty(propertyId);
    return property?.title || 'Property';
  };

  const getOtherUserName = (chat) => {
    if (!user || !chat) return 'Unknown';
    return chat.owner_id === user.id ? chat.tenant_name : chat.owner_name;
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.chatItem, selectedChat?.id === item.id && styles.selectedChatItem]} 
      onPress={() => handleChatSelect(item)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {getOtherUserName(item).charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName} numberOfLines={1}>
          {getOtherUserName(item)}
        </Text>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {getPropertyTitle(item.property_id)}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'No messages yet'}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.time}>
          {item.last_message_time ? new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => {
    const isFromMe = item.sender_id === user?.id;
    const messageTime = new Date(item.created_at).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[styles.messageContainer, isFromMe && styles.messageContainerMe]}>
        <View style={[styles.messageBubble, isFromMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isFromMe ? styles.messageTextMe : styles.messageTextOther]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isFromMe ? styles.messageTimeMe : styles.messageTimeOther]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  const renderChatHeader = () => {
    if (!selectedChat) return null;

    return (
      <View style={styles.chatHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FF9800" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{getOtherUserName(selectedChat)}</Text>
          <Text style={styles.headerProperty}>{getPropertyTitle(selectedChat.property_id)}</Text>
        </View>
        
        <TouchableOpacity style={styles.headerMenu}>
          <MaterialIcons name="more-vert" size={24} color="#FF9800" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyChats = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-ellipses" size={64} color="#BDBDBD" />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Start chatting with property owners to discuss rentals
      </Text>
    </View>
  );

  const renderEmptyMessages = () => (
    <View style={styles.emptyMessagesContainer}>
      <Ionicons name="chatbubble" size={48} color="#BDBDBD" />
      <Text style={styles.emptyMessagesTitle}>No messages yet</Text>
      <Text style={styles.emptyMessagesSubtitle}>
        Start the conversation with the property owner
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={["#FF9800", "#FFB300"]} 
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Messages</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Chat List */}
        <View style={styles.chatList}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#BDBDBD" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search conversations" 
              placeholderTextColor="#BDBDBD" 
            />
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : chats.length > 0 ? (
            <FlatList
              data={chats}
              keyExtractor={item => item.id}
              renderItem={renderChatItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyChats()
          )}
        </View>

        {/* Chat Messages */}
        <View style={styles.messagesContainer}>
          {selectedChat ? (
            <>
              {renderChatHeader()}
              
              <FlatList
                data={messages[currentChat] || []}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyMessages}
              />
              
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={messageText.trim() ? "#fff" : "#BDBDBD"} 
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.noChatSelected}>
              <Ionicons name="chatbubble-ellipses" size={64} color="#BDBDBD" />
              <Text style={styles.noChatText}>Select a conversation to start chatting</Text>
            </View>
          )}
        </View>
      </View>

      <BottomNav navigation={navigation} active="Chat" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    marginLeft: 24,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  chatList: {
    width: 300,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#FFE0B2',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF3E0',
  },
  selectedChatItem: {
    backgroundColor: '#FFF3E0',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  propertyTitle: {
    color: '#FF9800',
    fontSize: 12,
    marginBottom: 2,
  },
  lastMessage: {
    color: '#757575',
    fontSize: 12,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  time: {
    color: '#BDBDBD',
    fontSize: 11,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
    padding: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  headerProperty: {
    color: '#FF9800',
    fontSize: 12,
  },
  headerMenu: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageContainerMe: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleMe: {
    backgroundColor: '#FF9800',
  },
  messageBubbleOther: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTextOther: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  messageTimeOther: {
    color: '#BDBDBD',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    padding: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BDBDBD',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyMessagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#BDBDBD',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessagesSubtitle: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
    lineHeight: 20,
  },
  noChatSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noChatText: {
    fontSize: 16,
    color: '#BDBDBD',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#757575',
  },
}); 