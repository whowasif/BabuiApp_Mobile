import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Platform, StatusBar, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const user = useAuthStore(state => state.user);
  const guestMode = useAuthStore(state => state.guestMode);
  const chats = useChatStore(state => state.chats);
  const fetchChats = useChatStore(state => state.fetchChats);
  const [selectedChat, setSelectedChat] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    if (!user && !guestMode) {
      navigation.replace('SignIn');
    }
  }, [user, guestMode, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh chat list
      await fetchChats();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

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
        <LinearGradient
          colors={['#FF9800', '#FFB300']}
          style={styles.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
        </LinearGradient>
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
            <LinearGradient
              colors={['#FF5722', '#FF7043']}
              style={styles.unreadBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.unreadText}>{item.unread_count}</Text>
            </LinearGradient>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#FF9800', '#FFB300']}
        style={styles.emptyIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons name="chat-bubble-outline" size={48} color="#fff" />
      </LinearGradient>
      <Text style={styles.emptyText}>No conversations yet</Text>
      <Text style={styles.emptySubtext}>Start chatting with property owners!</Text>
    </View>
  );

  return (
    <View style={styles.containerModern}>
      <LinearGradient
        colors={['#FF9800', '#FFB300', '#FFC107']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Connect with property owners</Text>
        </View>
      </LinearGradient>
      
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#FF9800"]}
                tintColor="#FF9800"
              />
            }
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#FF9800',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
    fontWeight: '500',
  },
  contentModern: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatListModern: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    margin: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  selectedChatItem: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: '#FF9800',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 18,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  lastMessage: {
    color: '#757575',
    fontSize: 15,
    marginTop: 2,
  },
  chatMeta: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  time: {
    color: '#BDBDBD',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  unreadBadge: {
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    elevation: 3,
    shadowColor: '#FF5722',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#FF9800',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
}); 