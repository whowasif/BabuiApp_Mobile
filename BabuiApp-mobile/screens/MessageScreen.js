import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

export default function MessageScreen({ route, navigation }) {
  const { chatId, otherUser, profilePictureUrl, isOnline } = route.params;
  const user = useAuthStore(state => state.user);
  const messages = useChatStore(state => state.messages);
  const fetchMessages = useChatStore(state => state.fetchMessages);
  const sendMessage = useChatStore(state => state.sendMessage);
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    if (chatId) fetchMessages(chatId);
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chatId) return;
    await sendMessage(chatId, messageText);
    setMessageText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Helper to show online/offline
  const getOnlineStatus = () => {
    if (isOnline) {
      return <Text style={styles.onlineStatus}><Text style={styles.greenDot}>●</Text> Online</Text>;
    } else {
      return <Text style={styles.offlineStatus}>Offline</Text>;
    }
  };

  // Helper to format date separator
  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Render messages with date separators
  const renderMessagesWithDates = (messagesArr) => {
    let lastDate = null;
    const elements = [];
    messagesArr.forEach((item, idx) => {
      const msgDate = item.created_at.split('T')[0];
      if (msgDate !== lastDate) {
        elements.push(
          <View key={`date-sep-${msgDate}-${idx}`} style={styles.dateSeparatorRow}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>{formatDateSeparator(item.created_at)}</Text>
            <View style={styles.dateSeparatorLine} />
          </View>
        );
        lastDate = msgDate;
      }
      elements.push(renderMessage(item, idx));
    });
    return elements;
  };

  const renderMessage = (item, idx) => {
    const isFromMe = item.sender_id === user?.id;
    const messageTime = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatarText = isFromMe
      ? (user?.name_en || user?.name || user?.email || '?')[0].toUpperCase()
      : (otherUser || '?')[0].toUpperCase();
    // Helper for checkmarks
    const renderCheckmark = () => {
      if (!isFromMe) return null;
      if (item.read) {
        return <Text style={styles.checkmarkRead}>✓✓</Text>;
      } else if (item.delivered) {
        return <Text style={styles.checkmarkDelivered}>✓✓</Text>;
      } else {
        return <Text style={styles.checkmarkSent}>✓</Text>;
      }
    };
    return (
      <View key={item.id || idx} style={[styles.messageRowModern, isFromMe ? styles.messageRowMeModern : styles.messageRowOtherModern]}>
        {!isFromMe && (
          profilePictureUrl ? (
            <Image source={{ uri: profilePictureUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarBubbleModern}>
              <Text style={styles.avatarBubbleTextModern}>{avatarText}</Text>
            </View>
          )
        )}
        <View style={[styles.messageBubbleModern, isFromMe ? styles.messageBubbleMeModern : styles.messageBubbleOtherModern]}>
          <Text style={[styles.messageTextModern, isFromMe ? styles.messageTextMeModern : styles.messageTextOtherModern]}>
            {item.text}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={[styles.messageTimeModern, isFromMe ? styles.messageTimeMeModern : styles.messageTimeOtherModern]}>
              {messageTime}
            </Text>
            {renderCheckmark()}
          </View>
        </View>
        {isFromMe && (
          user?.profile_picture_url ? (
            <Image source={{ uri: user.profile_picture_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarBubbleModern}>
              <Text style={styles.avatarBubbleTextModern}>{avatarText}</Text>
            </View>
          )
        )}
      </View>
    );
  };

  return (
    <View style={styles.containerModern}>
      <View style={styles.stickyChatHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FF9800" />
        </TouchableOpacity>
        {profilePictureUrl ? (
          <Image source={{ uri: profilePictureUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.headerAvatarBubble}>
            <Text style={styles.headerAvatarBubbleText}>{(otherUser || '?')[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.headerInfoModern}>
          <Text style={styles.headerNameModern}>{otherUser}</Text>
          {getOnlineStatus()}
        </View>
        <TouchableOpacity style={styles.headerMenu}>
          <MaterialIcons name="more-vert" size={24} color="#FF9800" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={styles.messagesContainerModern} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.messagesListModern}
          contentContainerStyle={{ paddingBottom: 60 }}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages[chatId] && renderMessagesWithDates(messages[chatId])}
        </ScrollView>
        <View style={styles.messageInputContainerModern}>
          <TouchableOpacity style={styles.inputIconBtn}>
            <MaterialIcons name="emoji-emotions" size={24} color="#FF9800" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIconBtn}>
            <MaterialIcons name="attach-file" size={24} color="#FF9800" />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInputModern}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            placeholderTextColor="#BDBDBD"
          />
          <TouchableOpacity
            style={[styles.sendButtonModern, messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <MaterialIcons name="send" size={24} color={messageText.trim() ? '#fff' : '#BDBDBD'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerModern: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  stickyChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 8,
    paddingBottom: 8,
    paddingHorizontal: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerAvatarBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#FF9800',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerAvatarBubbleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  headerInfoModern: {
    flex: 1,
    justifyContent: 'center',
  },
  headerNameModern: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 18,
    letterSpacing: 0.2,
  },
  headerMenu: {
    padding: 8,
  },
  messagesContainerModern: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderTopWidth: 0,
  },
  messagesListModern: {
    padding: 18,
    flexGrow: 1,
  },
  messageRowModern: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageRowMeModern: {
    justifyContent: 'flex-end',
  },
  messageRowOtherModern: {
    justifyContent: 'flex-start',
  },
  avatarBubbleModern: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    elevation: 1,
  },
  avatarBubbleTextModern: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  messageBubbleModern: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 2,
    marginBottom: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  messageBubbleMeModern: {
    backgroundColor: '#FF9800',
    alignSelf: 'flex-end',
  },
  messageBubbleOtherModern: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignSelf: 'flex-start',
  },
  messageTextModern: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextMeModern: {
    color: '#fff',
  },
  messageTextOtherModern: {
    color: '#222',
  },
  messageTimeModern: {
    fontSize: 11,
    marginTop: 6,
  },
  messageTimeMeModern: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  messageTimeOtherModern: {
    color: '#BDBDBD',
    textAlign: 'left',
  },
  messageInputContainerModern: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 30,
    margin: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  inputIconBtn: {
    padding: 6,
    marginHorizontal: 2,
    borderRadius: 20,
  },
  messageInputModern: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    marginHorizontal: 6,
    color: '#222',
  },
  sendButtonModern: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    elevation: 2,
  },
  sendButtonActive: {
    backgroundColor: '#FF9800',
  },
  sendButtonInactive: {
    backgroundColor: '#F0F0F0',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
    marginHorizontal: 6,
  },
  onlineStatus: {
    color: '#4CAF50',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  greenDot: {
    color: '#4CAF50',
    fontSize: 16,
    marginRight: 4,
  },
  offlineStatus: {
    color: '#BDBDBD',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  lastSeen: {
    color: '#BDBDBD',
    fontSize: 13,
    marginTop: 2,
  },
  checkmarkSent: {
    color: '#BDBDBD',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  checkmarkDelivered: {
    color: '#757575',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  checkmarkRead: {
    color: '#2196F3',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  dateSeparatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dateSeparatorText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#BDBDBD',
    fontWeight: '500',
  },
}); 