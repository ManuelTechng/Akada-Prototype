// Environment Variable Check Utility

// Function to validate Supabase configuration
export function validateSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const issues = [];
  
  // Check URL
  if (!url) {
    issues.push('VITE_SUPABASE_URL is missing');
  } else if (!url.startsWith('https://')) {
    issues.push('VITE_SUPABASE_URL is not a valid HTTPS URL');
  }
  
  // Check Key
  if (!key) {
    issues.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (key.length < 10) {
    issues.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  // Return validation results
  return {
    valid: issues.length === 0,
    issues,
    url: url ? `${url.substring(0, 15)}...` : 'missing', // Show only part for security
    keyPresent: !!key
  };
}

// Function to validate OpenAI configuration
export function validateOpenAIConfig() {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  
  const issues = [];
  
  // Check Key
  if (!key) {
    issues.push('VITE_OPENAI_API_KEY is missing');
  } else if (!key.startsWith('sk-')) {
    issues.push('VITE_OPENAI_API_KEY does not appear to be a valid OpenAI key');
  }
  
  // Return validation results
  return {
    valid: issues.length === 0,
    issues,
    keyPresent: !!key
  };
}

// Function to check all environment variables
export function checkEnvironmentVariables() {
  console.group('Environment Variable Check');
  
  const supabaseCheck = validateSupabaseConfig();
  console.log('Supabase Configuration:', 
    supabaseCheck.valid ? '✅ Valid' : '❌ Invalid');
  
  if (!supabaseCheck.valid) {
    console.warn('Supabase Configuration Issues:', supabaseCheck.issues);
    console.log('URL:', supabaseCheck.url);
    console.log('Key Present:', supabaseCheck.keyPresent);
  }
  
  const openaiCheck = validateOpenAIConfig();
  console.log('OpenAI Configuration:', 
    openaiCheck.valid ? '✅ Valid' : '❌ Invalid');
  
  if (!openaiCheck.valid) {
    console.warn('OpenAI Configuration Issues:', openaiCheck.issues);
    console.log('Key Present:', openaiCheck.keyPresent);
  }
  
  console.groupEnd();
  
  return {
    allValid: supabaseCheck.valid && openaiCheck.valid,
    supabase: supabaseCheck,
    openai: openaiCheck
  };
}