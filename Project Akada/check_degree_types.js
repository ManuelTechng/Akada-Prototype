import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ujlneronslcmeynzybkb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbG5lcm9uc2xjbWV5bnp5YmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDgwNzUsImV4cCI6MjA2MDg4NDA3NX0.1ErDi3HY-0wLJtiRcJ3DOTzYSvoR5eDuADRfhWlS2Yo'
);

async function checkDegreeTypes() {
  // Get distinct degree_type values
  const { data, error } = await supabase
    .from('programs')
    .select('degree_type')
    .not('degree_type', 'is', null);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  const uniqueDegrees = [...new Set(data.map(p => p.degree_type))].sort();
  console.log('\nDegree types in database:');
  console.log(JSON.stringify(uniqueDegrees, null, 2));
  
  // Also check program names to see patterns
  const { data: programNames } = await supabase
    .from('programs')
    .select('name, degree_type')
    .limit(20);
    
  console.log('\nSample programs (name vs degree_type):');
  programNames?.forEach(p => {
    console.log(`"${p.name}" -> degree_type: "${p.degree_type}"`);
  });
}

checkDegreeTypes();
