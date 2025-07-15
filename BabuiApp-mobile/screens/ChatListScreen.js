import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import BottomNav from '../components/BottomNav';

export default function ChatListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const user = useAuthStore(state => state.user);
  const chats = useChatStore(state => state.chats);
  const fetchChats = useChatStore(state => state.fetchChats);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigation.replace('SignIn');
    }
  }, [user]);

  const getOtherUserName = (chat) => {
    if (!user || !chat) return 'Unknown';
    if (chat.owner && chat.owner.name_en && chat.owner_id !== user.id) return chat.owner.name_en;
    if (chat.tenant && chat.tenant.name_en && chat.tenant_id !== user.id) return chat.tenant.name_en;
    return chat.owner_id === user.id ? (chat.tenant_id || 'Unknown') : (chat.owner_id || 'Unknown');
  };

  const renderChatItem = ({ item }) => {
    const otherUserName = getOtherUserName(item) || '';
    // Determine which user is the other user
    const isOwner = item.owner_id !== user.id;
    const otherUser = isOwner ? item.owner : item.tenant;
    const profilePictureUrl = otherUser?.profile_picture_url;
    const lastActive = otherUser?.last_active;
    // For now, set isOnline to false for all users
    const isOnline = false;
    return (
      <TouchableOpacity
        style={[styles.chatItem, selectedChat?.id === item.id && styles.selectedChatItem]}
        onPress={() => {
          setSelectedChat(item);
          navigation.navigate('Message', { chatId: item.id, otherUser: otherUserName, profilePictureUrl, isOnline });
        }}
        activeOpacity={0.7}
      >
        {profilePictureUrl ? (
          <Image source={{ uri: profilePictureUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {otherUserName ? otherUserName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <View style={styles.chatInfo}>
          <Text style={styles.chatName} numberOfLines={1}>
            {otherUserName || 'Unknown'}
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
  };

  return (
    <View style={styles.containerModern}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <View style={styles.contentModern}>
        <View style={styles.chatListModern}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#BDBDBD" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations"
              placeholderTextColor="#BDBDBD"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList
            data={chats.filter(c => getOtherUserName(c).toLowerCase().includes(search.toLowerCase()))}
            keyExtractor={item => item.id}
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
      <BottomNav navigation={navigation} active="ChatList" />
    </View>
  );
}

const styles = StyleSheet.create({
  containerModern: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    paddingBottom: 12,
    backgroundColor: '#FF9800',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 24,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  contentModern: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  chatListModern: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 20,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  selectedChatItem: {
    backgroundColor: '#FFF3E0',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#FF9800',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 17,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  lastMessage: {
    color: '#757575',
    fontSize: 14,
    marginTop: 1,
  },
  chatMeta: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  time: {
    color: '#BDBDBD',
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 2,
    elevation: 1,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 