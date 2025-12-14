import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ujlneronslcmeynzybkb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbG5lcm9uc2xjbWV5bnp5YmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDgwNzUsImV4cCI6MjA2MDg4NDA3NX0.1ErDi3HY-0wLJtiRcJ3DOTzYSvoR5eDuADRfhWlS2Yo'
);

async function checkPrograms() {
  const { data, error, count } = await supabase
    .from('programs')
    .select('*', { count: 'exact' })
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`\nTotal programs in database: ${count}`);
  console.log('\nFirst 5 programs:');
  console.log(JSON.stringify(data, null, 2));
}

checkPrograms();
