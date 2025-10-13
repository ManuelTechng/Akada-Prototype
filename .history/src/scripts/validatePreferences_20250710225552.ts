#!/usr/bin/env tsx

/**
 * Akada Preference Data Consistency Validator
 * 
 * This script validates data consistency between user_preferences (structured)
 * and user_profiles.study_preferences (JSONB) tables.
 * 
 * Usage:
 *   npx tsx src/scripts/validatePreferences.ts --report
 *   npx tsx src/scripts/validatePreferences.ts --fix --dry-run
 *   npx tsx src/scripts/validatePreferences.ts --user-id=<uuid>
 */

import { DataConsistencyValidator } from '../lib/__tests__/PreferenceDataConsistency.integration.test'
import UnifiedPreferenceService from '../lib/preferences'
import { supabase } from '../lib/supabase'

async function main() {
  const args = process.argv.slice(2)
  const flags = {
    report: args.includes('--report'),
    fix: args.includes('--fix'),
    dryRun: args.includes('--dry-run'),
    userId: args.find(arg => arg.startsWith('--user-id='))?.split('=')[1]
  }

  console.log('🔍 Akada Preference Data Consistency Validator')
  console.log('=' .repeat(50))

  try {
    if (flags.userId) {
      await validateSingleUser(flags.userId)
    } else if (flags.fix) {
      await fixDataConflicts(flags.dryRun)
    } else {
      await generateFullReport()
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

async function generateFullReport() {
  console.log('📊 Generating comprehensive data consistency report...\n')
  
  const report = await DataConsistencyValidator.generateFullReport()
  
  // Print Summary
  console.log('📈 SUMMARY')
  console.log('-'.repeat(30))
  console.log(`Total Users: ${report.summary.totalUsers}`)
  console.log(`Users with Both Systems: ${report.summary.usersWithBothSystems}`)
  console.log(`Users with Only Structured: ${report.summary.usersWithOnlyStructured}`)
  console.log(`Users with Only JSONB: ${report.summary.usersWithOnlyJSONB}`)
  console.log(`Users with Conflicts: ${report.summary.usersWithConflicts}`)
  console.log(`Consistency Score: ${report.summary.consistencyScore}%`)
  
  // Print Status
  if (report.summary.consistencyScore >= 95) {
    console.log('✅ Status: EXCELLENT - Data is highly consistent')
  } else if (report.summary.consistencyScore >= 80) {
    console.log('⚠️  Status: GOOD - Minor inconsistencies detected')
  } else if (report.summary.consistencyScore >= 60) {
    console.log('🟡 Status: NEEDS ATTENTION - Moderate inconsistencies')
  } else {
    console.log('🔴 Status: CRITICAL - Major data inconsistencies detected')
  }
  
  // Print Conflicts
  if (report.conflicts.length > 0) {
    console.log('\n⚠️  CONFLICTS DETECTED')
    console.log('-'.repeat(30))
    
    const conflictsByField = report.conflicts.reduce((acc, conflict) => {
      acc[conflict.field] = (acc[conflict.field] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(conflictsByField).forEach(([field, count]) => {
      console.log(`${field}: ${count} conflicts`)
    })
    
    console.log('\nSample Conflicts:')
    report.conflicts.slice(0, 5).forEach((conflict, index) => {
      console.log(`${index + 1}. User ${conflict.userId.substring(0, 8)}... - ${conflict.field}`)
      console.log(`   Structured: ${JSON.stringify(conflict.structuredValue)}`)
      console.log(`   JSONB: ${JSON.stringify(conflict.jsonbValue)}`)
      console.log(`   Fix: ${conflict.recommendation}`)
      console.log()
    })
    
    if (report.conflicts.length > 5) {
      console.log(`... and ${report.conflicts.length - 5} more conflicts`)
    }
  }
  
  // Print Recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS')
    console.log('-'.repeat(30))
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })
  }
  
  console.log('\n🔧 NEXT STEPS')
  console.log('-'.repeat(30))
  if (report.conflicts.length > 0) {
    console.log('1. Review conflicts above')
    console.log('2. Run with --fix --dry-run to see what would be fixed')
    console.log('3. Run with --fix (without --dry-run) to apply fixes')
  } else {
    console.log('✅ No action needed - data is consistent!')
  }
  
  // Save report to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath = `reports/preference-consistency-${timestamp}.json`
  
  try {
    const fs = await import('fs')
    const path = await import('path')
    
    const reportsDir = path.join(process.cwd(), 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    fs.writeFileSync(
      path.join(process.cwd(), reportPath), 
      JSON.stringify(report, null, 2)
    )
    console.log(`\n📄 Report saved to: ${reportPath}`)
  } catch (error) {
    console.log(`⚠️  Could not save report to file: ${error}`)
  }
}

async function validateSingleUser(userId: string) {
  console.log(`👤 Validating user: ${userId}\n`)
  
  try {
    const report = await DataConsistencyValidator.validateUser(userId)
    
    console.log('User Validation Results:')
    console.log(`Status: ${report.status}`)
    console.log(`Completion: ${report.completionPercentage || 0}%`)
    
    if (report.issues.length > 0) {
      console.log('\nIssues Found:')
      report.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`)
      })
    }
    
    if (report.recommendations.length > 0) {
      console.log('\nRecommendations:')
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }
    
    if (report.preferences) {
      console.log('\nCurrent Preferences:')
      console.log(`Countries: ${JSON.stringify(report.preferences.countries)}`)
      console.log(`Specializations: ${JSON.stringify(report.preferences.specializations)}`)
      console.log(`Budget: ${report.preferences.budgetRange || 'Not set'}`)
      console.log(`Study Level: ${report.preferences.studyLevel || 'Not set'}`)
      console.log(`Scholarship Needed: ${report.preferences.scholarshipNeeded}`)
    }
    
  } catch (error) {
    console.error(`❌ Failed to validate user: ${error}`)
  }
}

async function fixDataConflicts(dryRun: boolean = true) {
  console.log(`🔧 ${dryRun ? 'DRY RUN' : 'FIXING'} Data Conflicts...\n`)
  
  const result = await DataConsistencyValidator.fixDataConflicts(dryRun)
  
  if (dryRun) {
    const report = await DataConsistencyValidator.generateFullReport()
    console.log(`Would fix ${report.conflicts.length} conflicts`)
    
    if (report.conflicts.length > 0) {
      console.log('\nConflicts that would be fixed:')
      report.conflicts.forEach((conflict, index) => {
        console.log(`${index + 1}. User ${conflict.userId.substring(0, 8)}... - ${conflict.field}`)
        console.log(`   Would update JSONB from: ${JSON.stringify(conflict.jsonbValue)}`)
        console.log(`   To match structured: ${JSON.stringify(conflict.structuredValue)}`)
      })
      
      console.log('\n✅ To apply these fixes, run without --dry-run flag')
    }
  } else {
    console.log(`✅ Applied ${result.fixesApplied} fixes`)
    
    if (result.errors.length > 0) {
      console.log(`❌ Failed to fix ${result.errors.length} conflicts:`)
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. User ${error.userId}: ${error.error}`)
      })
    }
  }
}

// Database connection test
async function testConnection() {
  try {
    const { data, error } = await supabase.from('user_preferences').select('count(*)', { count: 'exact' })
    if (error) throw error
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Help text
function showHelp() {
  console.log(`
Akada Preference Data Consistency Validator

USAGE:
  npx tsx src/scripts/validatePreferences.ts [options]

OPTIONS:
  --report              Generate full consistency report (default)
  --user-id=<uuid>      Validate specific user
  --fix                 Fix detected conflicts
  --dry-run             Show what would be fixed without applying changes

EXAMPLES:
  npx tsx src/scripts/validatePreferences.ts --report
  npx tsx src/scripts/validatePreferences.ts --user-id=12345678-1234-1234-1234-123456789012
  npx tsx src/scripts/validatePreferences.ts --fix --dry-run
  npx tsx src/scripts/validatePreferences.ts --fix

NOTES:
  - Always run with --dry-run first to preview changes
  - Reports are saved to reports/ directory
  - Requires valid Supabase connection
`)
}

// Handle CLI args
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp()
  process.exit(0)
}

// Run main function
if (require.main === module) {
  testConnection().then(connected => {
    if (connected) {
      main()
    } else {
      process.exit(1)
    }
  })
} 