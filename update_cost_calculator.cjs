const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'app', 'CostCalculator.tsx');

// Read the current file to check it exists
const exists = fs.existsSync(filePath);
console.log('File exists:', exists);
console.log('Path:', filePath);

if (exists) {
  const currentContent = fs.readFileSync(filePath, 'utf8');
  console.log('Current file starts with:', currentContent.substring(0, 200));
  console.log('\nFile has', currentContent.split('\n').length, 'lines');

  // Check if it has tabs (new version) or not (old version)
  const hasTabs = currentContent.includes('activeTab') && currentContent.includes('TabType');
  const hasEnhancedTypes = currentContent.includes('EnhancedCostBreakdown');

  console.log('Has tab interface:', hasTabs);
  console.log('Has enhanced types:', hasEnhancedTypes);

  if (!hasTabs || !hasEnhancedTypes) {
    console.log('\n⚠️  OLD VERSION DETECTED - Needs update!');
  } else {
    console.log('\n✅ NEW VERSION already in place');
  }
}
