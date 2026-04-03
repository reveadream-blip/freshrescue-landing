import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxrnmmpvwnfvmexkuxjg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cm5tbXB2d25mdm1leGt1eGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODkzNzksImV4cCI6MjA5MDc2NTM3OX0.qm4d4YblmIM4OAO7dJ7bPohqpsEY6ZWLuLxfx5JPnlo';

export const supabase = createClient(supabaseUrl, supabaseKey);