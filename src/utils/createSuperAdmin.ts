import { supabase } from '@/integrations/supabase/client';

export const createSuperAdmin = async () => {
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', 'actg.grafindotu')
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking existing user:', checkError);
    return;
  }

  if (existingUser) {
    console.log('Superadmin already exists');
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: 'actg.grafindotu@gmail.com',
    password: 'RahasiAtuh2021#22',
    options: {
      data: {
        username: 'actg.grafindotu',
        full_name: 'Super Admin',
        phone: '087881261159',
        preferred_language: 'en'
      }
    }
  });

  if (error) {
    console.error('Error creating superadmin:', error);
    return;
  }

  console.log('Superadmin created successfully:', data);
};