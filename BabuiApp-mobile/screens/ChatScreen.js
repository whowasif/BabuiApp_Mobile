import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

const chats = [
  { id: '1', name: 'plabon sarkar', lastMessage: 'fuck you', time: '09:14 PM', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
];
const messages = [
  { id: '1', fromMe: false, text: 'hello', time: '05:14 AM' },
  { id: '2', fromMe: false, text: 'are you there?', time: '05:21 AM' },
  { id: '3', fromMe: true, text: 'yes. how can i help you?', time: '05:22 AM' },
  { id: '4', fromMe: true, text: 'fuck you', time: '09:14 PM' },
];

export default function ChatScreen({ navigation }) {
  const [selectedChat, setSelectedChat] = useState(chats[0]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 16, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Text style={styles.header}>Messages</Text>
      </LinearGradient>
      <View style={styles.container}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <TextInput style={styles.searchInput} placeholder="Search chats" placeholderTextColor="#BDBDBD" />
          <FlatList
            data={chats}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.chatItem} onPress={() => setSelectedChat(item)}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatName}>{item.name}</Text>
                  <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                </View>
                <Text style={styles.time}>{item.time}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Main Chat Area */}
        <View style={styles.chatArea}>
          <View style={styles.chatHeader}>
            <Image source={{ uri: selectedChat.avatar }} style={styles.avatarLarge} />
            <View style={{ flex: 1 }}>
              <Text style={styles.chatNameLarge}>{selectedChat.name}</Text>
              <Text style={styles.status}>Offline</Text>
            </View>
            <TouchableOpacity style={styles.headerBtn}><Text style={styles.headerBtnText}>⋮</Text></TouchableOpacity>
          </View>
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleOther]}>
                <Text style={item.fromMe ? styles.bubbleTextMe : styles.bubbleTextOther}>{item.text}</Text>
                <Text style={styles.bubbleTime}>{item.time}</Text>
              </View>
            )}
          />
        </View>
      </View>
      <BottomNav navigation={navigation} active="Chat" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    marginLeft: 24,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 120,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#FFE0B2',
    paddingTop: 8,
  },
  searchInput: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 8,
    fontSize: 13,
    color: '#333',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF3E0',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  chatName: {
    fontWeight: 'bold',
    color: '#FF9800',
    fontSize: 13,
  },
  lastMessage: {
    color: '#757575',
    fontSize: 12,
  },
  time: {
    color: '#BDBDBD',
    fontSize: 11,
    marginLeft: 4,
  },
  chatArea: {
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
  avatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatNameLarge: {
    fontWeight: 'bold',
    color: '#FF9800',
    fontSize: 16,
  },
  status: {
    color: '#BDBDBD',
    fontSize: 12,
  },
  headerBtn: {
    padding: 8,
  },
  headerBtnText: {
    fontSize: 20,
    color: '#FF9800',
  },
  bubble: {
    maxWidth: '70%',
    marginBottom: 12,
    borderRadius: 16,
    padding: 10,
    alignSelf: 'flex-start',
  },
  bubbleMe: {
    backgroundColor: '#FF9800',
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  bubbleTextMe: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bubbleTextOther: {
    color: '#757575',
    fontWeight: 'bold',
  },
  bubbleTime: {
    color: '#FFF3E0',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'right',
  },
}); 