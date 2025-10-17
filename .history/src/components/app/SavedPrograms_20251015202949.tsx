import React, { useState, useEffect } from 'react'
import { 
  BookmarkIcon, 
  Search, 
  Grid3X3, 
  List, 
  Trash2, 
  SortAsc,
  SortDesc,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useSavedProgramsContext } from '../../contexts/SavedProgramsContext'
import { useNavigate } from 'react-router-dom'
import ProgramCard from './ProgramCard'
import type { Program } from '../../lib/types'
import CreateApplicationModal from './CreateApplicationModal'

// Convert saved program data to Program type for display
const createProgramFromSaved = (savedProgram: any): Program => ({
  id: savedProgram.program_id,
  name: savedProgram.program_name || 'Unknown Program',
  university: savedProgram.university || 'Unknown University',
  country: savedProgram.country || 'Unknown Country',
  degree_type: savedProgram.degree_type || 'Masters',
  tuition_fee: savedProgram.tuition_fee || 0,
  tuition_fee_currency: savedProgram.tuition_fee_currency || 'NGN',
  duration: savedProgram.duration || '2 years',
  deadline: '2024-12-15', // TODO: Add deadline to programs table
  specialization: savedProgram.specialization || '',
  scholarship_available: savedProgram.scholarship_available || false,
  // Add other required fields with defaults
  website: savedProgram.website || '',
  description: savedProgram.description || '',
  requirements: savedProgram.requirements || [],
  location: savedProgram.location || savedProgram.country || 'Unknown Country',
  created_at: savedProgram.created_at || savedProgram.saved_at || new Date().toISOString()
})

const SavedPrograms: React.FC = () => {
  const navigate = useNavigate()
  const { savedPrograms, removeSavedProgram, isLoading: loading, error, refreshSavedPrograms } = useSavedProgramsContext()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'cost' | 'deadline'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCountry, setFilterCountry] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  useEffect(() => {
    // Initial load handled by context provider
  }, [])

  // Get unique countries from saved programs  
  const countries = [...new Set(savedPrograms.map(sp => sp.country).filter(Boolean))]

  // Filter and sort saved programs
  const filteredPrograms = savedPrograms
    .filter(sp => {
      const matchesSearch = !searchQuery || 
        (sp.program_name && sp.program_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sp.university && sp.university.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sp.country && sp.country.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCountry = !filterCountry || sp.country === filterCountry
      
      return matchesSearch && matchesCountry
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = (a.program_name || '').localeCompare(b.program_name || '')
          break
        case 'cost':
          // Use program name for comparison since tuition_fee is not available in SavedProgram
          comparison = a.program_name?.localeCompare(b.program_name || '') || 0
          break
        case 'deadline':
          // TODO: Add deadline to programs table for proper sorting
          comparison = 0
          break
        case 'date':
        default:
          comparison = new Date(b.saved_at || b.created_at || 0).getTime() - new Date(a.saved_at || a.created_at || 0).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleRemoveProgram = async (programId: string) => {
    try {
      await removeSavedProgram(programId)
    } catch (error) {
      console.error('Failed to remove program:', error)
    }
  }

  const handleBulkRemove = async () => {
    try {
      await Promise.all(selectedPrograms.map(id => removeSavedProgram(id)))
      setSelectedPrograms([])
    } catch (error) {
      console.error('Failed to remove programs:', error)
    }
  }

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programId) 
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    )
  }

  const selectAllPrograms = () => {
    if (selectedPrograms.length === filteredPrograms.length) {
      setSelectedPrograms([])
    } else {
      setSelectedPrograms(filteredPrograms.map(sp => sp.program_id))
    }
  }

  const handleApplyToProgram = (programId: string) => {
    // Find the program from the saved programs
    const program = savedPrograms.find(sp => sp.program_id === programId)
    if (program) {
      // Convert saved program to Program type
      const programData = createProgramFromSaved(program)
      setSelectedProgram(programData)
      setShowApplicationModal(true)
    }
  }

  const handleApplicationSuccess = () => {
    // Optionally show success message or refresh data
    console.log('Application created successfully')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your saved programs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Programs</h3>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={refreshSavedPrograms}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
            Saved Programs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {savedPrograms.length} program{savedPrograms.length !== 1 ? 's' : ''} saved for later review
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/programs')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Find More Programs
          </button>
        </div>
      </div>

      {savedPrograms.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Saved Programs Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Start building your shortlist by saving programs that interest you. This will help you compare and track your favorites.
          </p>
          <button
            onClick={() => navigate('/app/programs')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            Browse Programs
          </button>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search saved programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Filters & Controls */}
              <div className="flex items-center gap-3">
                {/* Country Filter */}
                <select
                  aria-label="Filter saved programs by country"
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>

                {/* Sort */}
                <div className="flex items-center gap-1">
                  <select
                    aria-label="Sort saved programs"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="date">Date Saved</option>
                    <option value="name">Program Name</option>
                    <option value="cost">Tuition Cost</option>
                    <option value="deadline">Deadline</option>
                  </select>
                  
                  <button
                    aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
                </div>

                {/* View Mode */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    aria-label="Switch to grid view"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Switch to list view"
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedPrograms.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPrograms.length} program{selectedPrograms.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={selectAllPrograms}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      {selectedPrograms.length === filteredPrograms.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <button
                    onClick={handleBulkRemove}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Selected
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {filteredPrograms.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Programs Match Your Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search terms or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterCountry('')
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }
            `}            >
              {filteredPrograms.map((savedProgram) => {
                const isSelected = selectedPrograms.includes(savedProgram.program_id)
                const program = createProgramFromSaved(savedProgram)
                
                return (
                  <div key={savedProgram.program_id} className="relative">
                    {/* Selection checkbox - positioned in top-left with proper spacing */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProgramSelection(savedProgram.program_id)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        title={isSelected ? "Deselect program" : "Select program"}
                      />
                    </div>

                    <div className="pl-14">
                      <ProgramCard
                        program={program}
                        isSaved={true}
                        onUnsave={() => handleRemoveProgram(savedProgram.program_id)}
                        onApply={handleApplyToProgram}
                        compact={viewMode === 'list'}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Application Modal */}
      <CreateApplicationModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false)
          setSelectedProgram(null)
        }}
        programId={selectedProgram?.id}
        programName={selectedProgram?.name}
        universityName={selectedProgram?.university}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  )
}

export default SavedPrograms 