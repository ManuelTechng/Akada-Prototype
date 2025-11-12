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
  RefreshCw,
  ChevronDown
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading your saved programs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Programs</h3>
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={refreshSavedPrograms}
          className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">
            Saved Programs
          </h1>
          <p className="text-muted-foreground">
            {savedPrograms.length} program{savedPrograms.length !== 1 ? 's' : ''} saved for later review
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/programs')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Find More Programs
          </button>
        </div>
      </div>

      {savedPrograms.length === 0 ? (
        // Empty State
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Saved Programs Yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start building your shortlist by saving programs that interest you. This will help you compare and track your favorites.
          </p>
          <button
            onClick={() => navigate('/app/programs')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            Browse Programs
          </button>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-5 mb-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search saved programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                />
              </div>

              {/* Filters & Controls */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Country Filter */}
                <div className="relative flex-shrink-0">
                  <select
                    aria-label="Filter saved programs by country"
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="appearance-none border border-input rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground text-sm w-auto"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="relative">
                    <select
                      aria-label="Sort saved programs"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="appearance-none border border-input rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground text-sm w-auto"
                    >
                      <option value="date">Date Saved</option>
                      <option value="name">Program Name</option>
                      <option value="cost">Tuition Cost</option>
                      <option value="deadline">Deadline</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                  </div>

                  <button
                    aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
                </div>

                {/* View Mode */}
                <div className="flex bg-muted rounded-lg p-1 flex-shrink-0">
                  <button
                    aria-label="Switch to grid view"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Switch to list view"
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedPrograms.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {selectedPrograms.length} program{selectedPrograms.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={selectAllPrograms}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      {selectedPrograms.length === filteredPrograms.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <button
                    onClick={handleBulkRemove}
                    className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg hover:bg-destructive/90 transition-colors inline-flex items-center gap-2 text-sm"
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
            <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Programs Match Your Search
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterCountry('')
                }}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`
              ${viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                : 'space-y-3'
              }
            `}            >
              {filteredPrograms.map((savedProgram) => {
                const isSelected = selectedPrograms.includes(savedProgram.program_id)
                const program = createProgramFromSaved(savedProgram)
                
                return (
                  <div key={savedProgram.program_id} className="relative">
                    {/* Selection checkbox - positioned in top-left with proper spacing */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProgramSelection(savedProgram.program_id)}
                        className="h-4 w-4 text-primary focus:ring-ring border-input rounded cursor-pointer"
                        title={isSelected ? "Deselect program" : "Select program"}
                      />
                    </div>

                    <div className="pl-10">
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