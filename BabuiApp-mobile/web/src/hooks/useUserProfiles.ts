import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface UserProfile {
  id: string;
  name_en: string;
  name_bn: string;
  profile_picture_url?: string;
}

export function useUserProfiles(userIds: string[]) {
  const [userMap, setUserMap] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      if (!userIds.length) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, name_en, name_bn, profile_picture_url')
        .in('id', userIds);
      if (!error && data) {
        const map: Record<string, UserProfile> = {};
        for (const user of data) {
          map[user.id] = user;
        }
        setUserMap(map);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [userIds.join(',')]);

  return { userMap, loading };
} 