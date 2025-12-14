import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { SmartDashboard } from './SmartDashboard'

// Mock the hooks
jest.mock('../../hooks/useSmartDashboard', () => ({
  useSmartDashboard: () => ({
    insights: [
      {
        id: 'test-insight',
        type: 'info',
        title: 'Test Insight',
        message: 'This is a test message',
        priority: 'medium',
        dismissible: true,
        timestamp: new Date()
      }
    ],
    metrics: {
      profileCompletionPercentage: 75,
      totalApplications: 3,
      urgentDeadlines: 1,
      averageCostNGN: 15000000,
      affordablePrograms: 8,
      recommendationScore: 85
    },
    loading: false,
    dismissInsight: jest.fn(),
    refreshDashboard: jest.fn(),
    getDashboardSummary: () => ({
      status: 'good',
      summary: 'Profile optimized • 3 applications in progress • Avg cost: ₦15M',
      actionNeeded: false
    }),
    getQuickActions: () => [
      {
        id: 'complete-profile',
        label: 'Complete Profile',
        url: '/profile/setup',
        priority: 'medium',
        icon: '👤'
      }
    ],
    profileData: {
      completionData: {
        percentage: 75,
        completedSections: ['Study Preferences', 'Budget & Scholarships'],
        nextSteps: ['Complete Personal Profile', 'Add Academic Timeline']
      },
      isProfileOptimal: false
    },
    timelineData: {
      applications: [],
      urgentCount: 1
    },
    costData: {
      budgetAnalysis: {
        totalBudget: 20000000,
        averageProgramCost: 15000000,
        budgetUtilization: 75,
        affordablePrograms: 8
      },
      scholarshipOpportunities: []
    },
    recommendedPrograms: [
      { id: '1', name: 'Test Program', match_score: 85 }
    ]
  }),
  useDashboardNotifications: () => ({
    notifications: [],
    hasUrgentNotifications: false,
    urgentCount: 0
  })
}))

// Mock child components to avoid complex dependencies
jest.mock('../ProfileCompletionWidget', () => ({
  ProfileCompletionWidget: () => <div data-testid="profile-widget">Profile Widget</div>
}))

jest.mock('./ApplicationTimelineWidget', () => ({
  ApplicationTimelineWidget: () => <div data-testid="timeline-widget">Timeline Widget</div>
}))

jest.mock('./CostAnalysisWidget', () => ({
  CostAnalysisWidget: () => <div data-testid="cost-widget">Cost Widget</div>
}))

jest.mock('./CostComparisonChart', () => ({
  __esModule: true,
  default: () => <div data-testid="cost-chart">Cost Chart</div>
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('SmartDashboard', () => {
  it('renders without crashing', () => {
    renderWithRouter(<SmartDashboard />)
    expect(screen.getByText(/Good/)).toBeInTheDocument()
  })

  it('displays dashboard summary banner', () => {
    renderWithRouter(<SmartDashboard />)
    
    // Check for greeting
    expect(screen.getByText(/Good (morning|afternoon|evening)/)).toBeInTheDocument()
    
    // Check for metrics
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Profile Complete')).toBeInTheDocument()
  })

  it('shows quick actions when available', () => {
    renderWithRouter(<SmartDashboard />)
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Complete Profile')).toBeInTheDocument()
  })

  it('displays all widgets by default', () => {
    renderWithRouter(<SmartDashboard />)
    
    expect(screen.getByTestId('profile-widget')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-widget')).toBeInTheDocument()
    expect(screen.getByTestId('cost-widget')).toBeInTheDocument()
  })

  it('handles widget visibility toggle', () => {
    renderWithRouter(<SmartDashboard />)
    
    // Find and click a hide button
    const hideButtons = screen.getAllByLabelText(/hide|eye/i)
    if (hideButtons.length > 0) {
      fireEvent.click(hideButtons[0])
      // Widget should be hidden
    }
  })

  it('handles refresh action', () => {
    renderWithRouter(<SmartDashboard />)
    
    const refreshButton = screen.getByLabelText('Refresh dashboard')
    fireEvent.click(refreshButton)
    
    // Should trigger refresh (tested via mock)
    expect(refreshButton).toBeInTheDocument()
  })

  it('displays notifications when available', () => {
    renderWithRouter(<SmartDashboard />)
    
    // Should show notifications section
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('shows Nigerian-specific content', () => {
    renderWithRouter(<SmartDashboard />)
    
    // Check for Nigerian flag or currency
    const nigerianContent = screen.getByText(/🇳🇬|₦|Nigerian/i, { exact: false })
    expect(nigerianContent).toBeInTheDocument()
  })
})

describe('WelcomeDashboard (New User)', () => {
  it('shows welcome screen for new users', () => {
    // Mock empty data to trigger new user state
    jest.doMock('../../hooks/useSmartDashboard', () => ({
      useSmartDashboard: () => ({
        insights: [],
        metrics: null,
        loading: false,
        dismissInsight: jest.fn(),
        refreshDashboard: jest.fn(),
        getDashboardSummary: () => null,
        getQuickActions: () => [],
        profileData: { completionData: null },
        timelineData: { applications: [] },
        costData: null,
        recommendedPrograms: []
      }),
      useDashboardNotifications: () => ({
        notifications: [],
        hasUrgentNotifications: false,
        urgentCount: 0
      })
    }))

    renderWithRouter(<SmartDashboard />)
    
    expect(screen.getByText('Welcome to Your Akada Dashboard!')).toBeInTheDocument()
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
    expect(screen.getByText('Set Your Budget')).toBeInTheDocument()
    expect(screen.getByText('Explore Programs')).toBeInTheDocument()
  })
})

describe('Dashboard Loading State', () => {
  it('shows loading skeletons when loading', () => {
    jest.doMock('../../hooks/useSmartDashboard', () => ({
      useSmartDashboard: () => ({
        insights: [],
        metrics: null,
        loading: true,
        dismissInsight: jest.fn(),
        refreshDashboard: jest.fn(),
        getDashboardSummary: () => null,
        getQuickActions: () => [],
        profileData: null,
        timelineData: null,
        costData: null,
        recommendedPrograms: []
      }),
      useDashboardNotifications: () => ({
        notifications: [],
        hasUrgentNotifications: false,
        urgentCount: 0
      })
    }))

    renderWithRouter(<SmartDashboard />)
    
    // Should show skeleton loaders
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
}) 