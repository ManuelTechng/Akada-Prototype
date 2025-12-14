import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ujlneronslcmeynzybkb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbG5lcm9uc2xjbWV5bnp5YmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDgwNzUsImV4cCI6MjA2MDg4NDA3NX0.1ErDi3HY-0wLJtiRcJ3DOTzYSvoR5eDuADRfhWlS2Yo'
);

async function checkProgramNames() {
  const { data, error } = await supabase
    .from('programs')
    .select('name')
    .limit(100);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('\nSample program names:');
  data?.slice(0, 30).forEach(p => {
    console.log(`- ${p.name}`);
  });
  
  // Extract degree patterns
  const degreePatterns = data?.map(p => {
    const name = p.name || '';
    const match = name.match(/^(BSc|MSc|MA|MBA|PhD|Bachelor|Master|Doctor|B\.?A\.?|M\.?A\.?|B\.?Sc\.?|M\.?Sc\.?|Ph\.?D\.?)/i);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  const uniquePatterns = [...new Set(degreePatterns)].sort();
  console.log('\nExtracted degree patterns:');
  console.log(JSON.stringify(uniquePatterns, null, 2));
}

checkProgramNames();
