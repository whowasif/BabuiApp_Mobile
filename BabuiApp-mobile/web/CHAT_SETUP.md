# Chat Functionality Setup Guide

This guide explains how to set up the chat functionality for the property rental app.

## Overview

The chat functionality allows users to communicate with property owners/landlords. Here's how it works:

1. **Person 1** (Property Owner): Signs up and adds a property
2. **Person 2** (Tenant): Signs up, finds a property, and can chat with the owner
3. **Real-time messaging**: Users can send and receive messages in real-time

## Database Setup

### 1. Run the Database Script

Execute the SQL script in your Supabase database:

```sql
-- Run the contents of database_setup.sql in your Supabase SQL editor
```

This will create:
- `chats` table: Stores chat sessions between users
- `messages` table: Stores individual messages
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic updates

### 2. Verify Database Structure

The following tables should be created:

#### chats table
- `id`: Unique chat identifier
- `property_id`: Reference to the property being discussed
- `owner_id`: Property owner's user ID
- `tenant_id`: Tenant's user ID
- `last_message`: Last message text
- `last_message_bn`: Last message in Bengali
- `last_message_time`: Timestamp of last message
- `unread_count`: Number of unread messages
- `created_at`, `updated_at`: Timestamps

#### messages table
- `id`: Unique message identifier
- `chat_id`: Reference to the chat
- `sender_id`: User who sent the message
- `receiver_id`: User who should receive the message
- `text`: Message content
- `read`: Whether message has been read
- `created_at`: Message timestamp

## Features Implemented

### 1. Real-time Messaging
- Uses Supabase real-time subscriptions
- Messages appear instantly for all participants
- Automatic read status updates

### 2. Chat Management
- Automatic chat creation when tenant contacts owner
- Chat list with property context
- Search functionality for chats
- Unread message indicators

### 3. User Interface
- Responsive design for mobile and desktop
- Bengali and English language support
- Property context in chat headers
- Message timestamps and read status

### 4. Security
- Row Level Security (RLS) policies
- Users can only access their own chats
- Message sender validation

## How to Use

### For Property Owners:
1. Sign up and add properties
2. Receive chat requests from interested tenants
3. Respond to inquiries through the chat interface

### For Tenants:
1. Sign up and browse properties
2. Click "Chat with Owner" on any property
3. Start a conversation with the property owner

### Chat Flow:
1. Tenant clicks "Chat with Owner" on property detail page
2. System creates or finds existing chat
3. Tenant is redirected to chat page
4. Real-time messaging begins

## Technical Implementation

### Chat Store (`src/stores/chatStore.ts`)
- Manages chat state and operations
- Handles real-time subscriptions
- Provides methods for sending/receiving messages

### Chat Page (`src/pages/ChatPage.tsx`)
- Displays chat list and messages
- Handles real-time updates
- Manages chat selection and navigation

### Integration Points
- Property detail page: "Chat with Owner" button
- Bottom navigation: Chat icon
- Authentication: Required for chat access

## Testing the Chat Functionality

### Prerequisites:
1. Two user accounts (owner and tenant)
2. At least one property listed
3. Database tables created

### Test Steps:
1. **Setup**: Create two accounts and add a property
2. **Initiate Chat**: Use tenant account to view property and click "Chat with Owner"
3. **Send Messages**: Exchange messages between users
4. **Verify Real-time**: Open chat in multiple tabs/windows to test real-time updates

## Troubleshooting

### Common Issues:

1. **Chat not creating**: Check if property has valid owner ID
2. **Messages not sending**: Verify user authentication
3. **Real-time not working**: Check Supabase real-time configuration
4. **Permission errors**: Verify RLS policies are correctly set

### Debug Steps:
1. Check browser console for errors
2. Verify database connections
3. Test Supabase real-time subscriptions
4. Check user authentication status

## Future Enhancements

- Message notifications
- File/image sharing
- Voice messages
- Chat history export
- Message search functionality
- Online status indicators
- Message reactions
- Group chats for multiple tenants

## Security Considerations

- All database operations use RLS policies
- Users can only access their own chats
- Message content is validated
- Authentication required for all chat operations
- No sensitive data exposed in client-side code 