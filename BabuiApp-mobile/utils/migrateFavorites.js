import { supabase } from './supabaseClient';

// Migration script to add favorites and myproperties columns to existing users
export const migrateFavorites = async () => {
  try {
    console.log('Starting favorites migration...');
    
    // First, let's check if the favorites column exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .in('column_name', ['favorites', 'myproperties']);
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return false;
    }
    
    const existingColumns = columns.map(col => col.column_name);
    
    if (!existingColumns.includes('favorites')) {
      console.log('Favorites column does not exist. Please run the SQL command in Supabase:');
      console.log(`
        ALTER TABLE users 
        ADD COLUMN favorites JSONB DEFAULT '[]'::jsonb;
        
        CREATE INDEX idx_users_favorites ON users USING GIN (favorites);
      `);
      return false;
    }
    
    if (!existingColumns.includes('myproperties')) {
      console.log('Myproperties column does not exist. Please run the SQL command in Supabase:');
      console.log(`
        ALTER TABLE users 
        ADD COLUMN myproperties JSONB DEFAULT '[]'::jsonb;
        
        CREATE INDEX idx_users_myproperties ON users USING GIN (myproperties);
      `);
      return false;
    }
    
    console.log('Both columns exist. Checking for users without favorites or myproperties...');
    
    // Get all users that don't have favorites or myproperties set
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, favorites, myproperties')
      .or('favorites.is.null,favorites.eq.[],myproperties.is.null,myproperties.eq.[]');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return false;
    }
    
    console.log(`Found ${users.length} users without favorites or myproperties. Updating...`);
    
    // Update users to have empty arrays
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        favorites: [], 
        myproperties: [] 
      })
      .or('favorites.is.null,favorites.eq.[],myproperties.is.null,myproperties.eq.[]');
    
    if (updateError) {
      console.error('Error updating users:', updateError);
      return false;
    }
    
    console.log('Migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};

// Test function to verify favorites and myproperties functionality
export const testFavoritesAndMyProperties = async (userId) => {
  try {
    console.log('Testing favorites and myproperties functionality...');
    
    // Test adding a favorite
    const { error: addFavoriteError } = await supabase
      .from('users')
      .update({ favorites: ['test-property-1'] })
      .eq('id', userId);
    
    if (addFavoriteError) {
      console.error('Error adding test favorite:', addFavoriteError);
      return false;
    }
    
    // Test adding a myproperty
    const { error: addMyPropertyError } = await supabase
      .from('users')
      .update({ myproperties: ['test-my-property-1'] })
      .eq('id', userId);
    
    if (addMyPropertyError) {
      console.error('Error adding test myproperty:', addMyPropertyError);
      return false;
    }
    
    // Test reading both
    const { data: user, error: readError } = await supabase
      .from('users')
      .select('favorites, myproperties')
      .eq('id', userId)
      .single();
    
    if (readError) {
      console.error('Error reading favorites and myproperties:', readError);
      return false;
    }
    
    console.log('Test successful! User favorites:', user.favorites);
    console.log('Test successful! User myproperties:', user.myproperties);
    
    // Clean up test data
    const { error: cleanupError } = await supabase
      .from('users')
      .update({ favorites: [], myproperties: [] })
      .eq('id', userId);
    
    if (cleanupError) {
      console.error('Error cleaning up test data:', cleanupError);
    }
    
    return true;
    
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

// Function to sync existing properties with myproperties
export const syncMyProperties = async (userId) => {
  try {
    console.log('Syncing existing properties with myproperties...');
    
    // Get all properties owned by the user
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', userId);
    
    if (propertiesError) {
      console.error('Error fetching user properties:', propertiesError);
      return false;
    }
    
    const propertyIds = properties.map(p => p.id);
    
    // Update user's myproperties
    const { error: updateError } = await supabase
      .from('users')
      .update({ myproperties: propertyIds })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating myproperties:', updateError);
      return false;
    }
    
    console.log(`Synced ${propertyIds.length} properties to myproperties for user ${userId}`);
    return true;
    
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
}; 