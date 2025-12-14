/**
 * Quick automated filter data verification
 * Tests that filter options load correctly from database
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ujlneronslcmeynzybkb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbG5lcm9uc2xjbWV5bnp5YmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDgwNzUsImV4cCI6MjA2MDg4NDA3NX0.1ErDi3HY-0wLJtiRcJ3DOTzYSvoR5eDuADRfhWlS2Yo'
);

async function testFilterData() {
  console.log('\n🧪 FILTER DATA VERIFICATION TEST\n');
  console.log('=' .repeat(50));

  let allPassed = true;

  // Test 1: Countries
  console.log('\n📍 Test 1: Country Filter Data');
  const { data: countries, error: countriesError } = await supabase
    .from('countries')
    .select('code, name')
    .eq('is_active', true)
    .order('name');

  if (countriesError) {
    console.log('❌ FAIL: Error loading countries:', countriesError.message);
    allPassed = false;
  } else if (!countries || countries.length === 0) {
    console.log('❌ FAIL: No countries found');
    allPassed = false;
  } else {
    console.log(`✅ PASS: ${countries.length} countries loaded`);
    console.log('   Sample:', countries.slice(0, 3).map(c => c.name).join(', '));
  }

  // Test 2: Degree Types
  console.log('\n🎓 Test 2: Degree Type Filter Data');
  const { data: degreeData, error: degreeError } = await supabase
    .from('programs')
    .select('degree_type')
    .not('degree_type', 'is', null);

  if (degreeError) {
    console.log('❌ FAIL: Error loading degree types:', degreeError.message);
    allPassed = false;
  } else if (!degreeData || degreeData.length === 0) {
    console.log('❌ FAIL: No degree types found');
    allPassed = false;
  } else {
    const uniqueDegrees = [...new Set(degreeData.map(p => p.degree_type))].sort();
    console.log(`✅ PASS: ${uniqueDegrees.length} unique degree types`);
    console.log('   Types:', uniqueDegrees.join(', '));

    // Verify standardization
    const nonStandard = uniqueDegrees.filter(d =>
      !['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate'].includes(d)
    );
    if (nonStandard.length > 0) {
      console.log('⚠️  WARNING: Non-standard degree types found:', nonStandard);
      allPassed = false;
    } else {
      console.log('   ✓ All degree types are standardized');
    }
  }

  // Test 3: Institution Types
  console.log('\n🏛️  Test 3: Institution Type Filter Data');
  const { data: institutions, error: institutionsError } = await supabase
    .from('universities')
    .select('institution_type')
    .not('institution_type', 'is', null);

  if (institutionsError) {
    console.log('❌ FAIL: Error loading institution types:', institutionsError.message);
    allPassed = false;
  } else if (!institutions || institutions.length === 0) {
    console.log('❌ FAIL: No institution types found');
    allPassed = false;
  } else {
    const uniqueTypes = [...new Set(institutions.map(u => u.institution_type))].sort();
    console.log(`✅ PASS: ${uniqueTypes.length} unique institution types`);
    console.log('   Types:', uniqueTypes.join(', '));
  }

  // Test 4: Fields of Study
  console.log('\n📚 Test 4: Field of Study Filter Data');
  const { data: programs, error: programsError } = await supabase
    .from('programs')
    .select('specialization, name');

  if (programsError) {
    console.log('❌ FAIL: Error loading programs:', programsError.message);
    allPassed = false;
  } else if (!programs || programs.length === 0) {
    console.log('❌ FAIL: No programs found');
    allPassed = false;
  } else {
    const fields = new Set();
    programs.forEach(p => {
      if (p.specialization) {
        fields.add(p.specialization);
      }
      // Extract from name
      const nameFields = p.name?.match(/in\s+([^(]+)/i);
      if (nameFields && nameFields[1]) {
        fields.add(nameFields[1].trim());
      }
    });

    console.log(`✅ PASS: ${fields.size} unique fields extracted`);
    console.log('   Sample:', [...fields].slice(0, 5).join(', '));
  }

  // Test 5: Programs Count
  console.log('\n📊 Test 5: Programs Data Integrity');
  const { data: allPrograms, error: programCountError, count } = await supabase
    .from('programs')
    .select('*', { count: 'exact' });

  if (programCountError) {
    console.log('❌ FAIL: Error counting programs:', programCountError.message);
    allPassed = false;
  } else {
    console.log(`✅ PASS: ${count} programs in database`);

    // Check for missing data
    const missingDegreeType = allPrograms?.filter(p => !p.degree_type).length || 0;
    const missingCountry = allPrograms?.filter(p => !p.country).length || 0;
    const missingUniversity = allPrograms?.filter(p => !p.university).length || 0;

    console.log(`   Programs with degree_type: ${count - missingDegreeType}/${count}`);
    console.log(`   Programs with country: ${count - missingCountry}/${count}`);
    console.log(`   Programs with university: ${count - missingUniversity}/${count}`);

    if (missingDegreeType > 0 || missingCountry > 0 || missingUniversity > 0) {
      console.log('⚠️  WARNING: Some programs have missing required data');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(allPassed ? '\n✅ ALL TESTS PASSED' : '\n❌ SOME TESTS FAILED');
  console.log('\nℹ️  Manual testing still required:');
  console.log('   - UI interactions');
  console.log('   - Filter combinations');
  console.log('   - Mobile responsiveness');
  console.log('   - See docs/FILTER_TEST_CHECKLIST.md for full checklist\n');
}

testFilterData().catch(console.error);
