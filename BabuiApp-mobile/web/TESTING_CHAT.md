# Testing Chat Functionality

## Quick Test Steps

### 1. Database Setup
First, run the database setup script in your Supabase SQL editor:
```sql
-- Copy and paste the contents of database_setup.sql
```

### 2. Test the Chat Functionality

#### Option A: Using the Test Component
1. Navigate to `http://localhost:5174/chat-test`
2. This will show you the current chat state and allow you to test the chat store

#### Option B: Full User Flow Test
1. **Create two user accounts**:
   - Account 1: Property Owner
   - Account 2: Tenant

2. **Add a property with Account 1**:
   - Go to `/add-property`
   - Fill out the form and submit
   - The property will now have the owner's user ID

3. **Browse and chat with Account 2**:
   - Go to `/properties` or `/`
   - Find the property you just added
   - Click on the property to view details
   - Click "Chat with Owner" button
   - You should be redirected to the chat page

### 3. Verify Real-time Messaging
1. Open the chat in two different browser windows/tabs
2. Send messages from one window
3. Messages should appear instantly in the other window

## Troubleshooting

### Issue: "Landlord ID not available"
**Solution**: This has been fixed by:
1. Adding `owner_id` field when saving properties
2. Using property ID as fallback when owner ID is not available
3. Updated the chat creation logic to handle this case

### Issue: Chat not creating
**Check**:
1. User is logged in
2. Property exists in database
3. Database tables are created correctly

### Issue: Messages not sending
**Check**:
1. User authentication
2. Supabase real-time is enabled
3. RLS policies are correctly set

## Database Verification

You can verify the database setup by checking:

1. **Tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name IN ('chats', 'messages');
   ```

2. **RLS is enabled**:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('chats', 'messages');
   ```

3. **Policies exist**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('chats', 'messages');
   ```

## Expected Behavior

✅ **Working Features**:
- Chat creation when tenant contacts owner
- Real-time message delivery
- Message history persistence
- Unread message indicators
- Property context in chat headers
- Responsive design

✅ **Security**:
- Users can only access their own chats
- Messages are validated
- Authentication required

## Test Data

You can also test with mock data by temporarily adding this to your chat store:

```typescript
// Add this to the fetchChats method for testing
if (data?.length === 0) {
  // Add test data
  const testChats = [{
    id: 'test-chat-1',
    property_id: 'test-property-1',
    property_title: 'Test Property',
    property_title_bn: 'টেস্ট সম্পত্তি',
    owner_id: 'test-owner-1',
    owner_name: 'Test Owner',
    owner_name_bn: 'টেস্ট মালিক',
    owner_avatar: '',
    tenant_id: 'test-tenant-1',
    tenant_name: 'Test Tenant',
    tenant_name_bn: 'টেস্ট ভাড়াটে',
    tenant_avatar: '',
    last_message: 'Hello, I am interested in your property',
    last_message_bn: 'হ্যালো, আমি আপনার সম্পত্তিতে আগ্রহী',
    last_message_time: new Date().toISOString(),
    unread_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }];
  set({ chats: testChats, loading: false });
  return;
}
``` 