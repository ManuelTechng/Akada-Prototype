import React, { useState, useRef, useCallback, useMemo } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { 
  BarChart3Icon, 
  PieChartIcon, 
  TrendingUpIcon,
  DownloadIcon,
  FilterIcon,
  RefreshCwIcon,
  InfoIcon,
  GlobeIcon,
  DollarSignIcon,
  TrophyIcon
} from 'lucide-react'
import SkeletonLoader from '../ui/SkeletonLoader'
import { useCostVisualization } from '../../hooks/useCostVisualization'
import { formatNGN } from '../../utils/currency'
import { akadaTokens } from '../../styles/tokens'
import { cn } from '../../lib/utils'

type ChartType = 'bar' | 'pie' | 'line'
type ViewMode = 'total' | 'breakdown' | 'country' | 'scholarship'

interface TooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

interface ExportOptions {
  format: 'png' | 'pdf'
  title: string
  includeData: boolean
}

export const CostComparisonChart: React.FC<{ className?: string }> = ({ className }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const { 
    costBreakdowns, 
    countryComparisons, 
    budgetAnalysis,
    loading, 
    error,
    getCostBreakdownChartData,
    getCountryComparisonChartData,
    getBudgetUtilizationData,
    getCostInsights,
    formatCurrency
  } = useCostVisualization()

  const [chartType, setChartType] = useState<ChartType>('bar')
  const [viewMode, setViewMode] = useState<ViewMode>('total')
  const [showScholarshipAdjusted, setShowScholarshipAdjusted] = useState(false)
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])

  // Color palette for charts (Akada HSL semantic colors)
  const chartColors = [
    'hsl(var(--chart-2))', // Primary purple
    'hsl(var(--chart-1))', // Green
    'hsl(var(--chart-3))', // Orange
    'hsl(var(--destructive))', // Red
    'hsl(var(--chart-4))', // Purple
    'hsl(var(--chart-5))', // Cyan
    'hsl(var(--chart-1))', // Lime (green variant)
    'hsl(var(--chart-3))'  // Orange-red (orange variant)
  ]

  // Prepare chart data based on view mode
  const chartData = useMemo(() => {
    switch (viewMode) {
      case 'breakdown':
        return getCostBreakdownChartData().map((item, index) => ({
          ...item,
          color: chartColors[index % chartColors.length]
        }))
      
      case 'country':
        return getCountryComparisonChartData().map((item, index) => ({
          ...item,
          color: chartColors[index % chartColors.length]
        }))
      
      case 'scholarship':
        return getCostBreakdownChartData().map((item, index) => {
          const scholarshipSavings = (item as any).scholarshipPrograms > 0 ? item.total * 0.3 : 0 // Assume 30% scholarship
          return {
            ...item,
            originalTotal: item.total,
            adjustedTotal: item.total - scholarshipSavings,
            savings: scholarshipSavings,
            color: chartColors[index % chartColors.length]
          }
        })
      
      default: // total
        return getCostBreakdownChartData().map((item, index) => ({
          ...item,
          color: chartColors[index % chartColors.length]
        }))
    }
  }, [viewMode, getCostBreakdownChartData, getCountryComparisonChartData, chartColors])

  // Custom tooltip component
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload

    return (
      <div className="bg-card p-3 rounded-lg shadow-sm border border-border">
        <h4 className="font-semibold text-foreground mb-2">
          {label || data.name || data.country}
        </h4>
        
        {viewMode === 'breakdown' && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tuition:</span>
              <span className="font-medium">{formatCurrency(data.tuition)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Living:</span>
              <span className="font-medium">{formatCurrency(data.living)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visa:</span>
              <span className="font-medium">{formatCurrency(data.visa)}</span>
            </div>
            <div className="border-t border-border pt-1 mt-1">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'country' && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Total:</span>
              <span className="font-medium">{formatCurrency(data.averageTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Programs:</span>
              <span className="font-medium">{data.programCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scholarships:</span>
              <span className="font-medium">{data.scholarshipPrograms}</span>
            </div>
          </div>
        )}

        {viewMode === 'scholarship' && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original:</span>
              <span className="font-medium">{formatCurrency(data.originalTotal)}</span>
            </div>
            <div className="flex justify-between text-chart-1">
              <span>Savings:</span>
              <span className="font-medium">-{formatCurrency(data.savings)}</span>
            </div>
            <div className="border-t border-border pt-1 mt-1">
              <div className="flex justify-between font-semibold">
                <span>Final Cost:</span>
                <span>{formatCurrency(data.adjustedTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {data.affordable !== undefined && (
          <div className={cn(
            "text-xs mt-2 px-2 py-1 rounded",
            data.affordable 
              ? "bg-chart-1/10 text-chart-1"
              : "bg-destructive/10 text-destructive"
          )}>
            {data.affordable ? '✅ Within Budget' : '⚠️ Over Budget'}
          </div>
        )}
      </div>
    )
  }

  // Export functionality
  const handleExport = useCallback(async (options: ExportOptions) => {
    if (!chartRef.current) return

    try {
      const { format, title, includeData } = options
      
      if (format === 'png') {
        // Use html2canvas for PNG export
        const html2canvas = await import('html2canvas')
        const canvas = await html2canvas.default(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        })
        
        const link = document.createElement('a')
        link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.png`
        link.href = canvas.toDataURL()
        link.click()
      } else if (format === 'pdf') {
        // Use jsPDF for PDF export
        const jsPDF = await import('jspdf')
        const html2canvas = await import('html2canvas')
        
        const canvas = await html2canvas.default(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        })
        
        const pdf = new jsPDF.jsPDF('landscape')
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 280
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
        
        if (includeData) {
          // Add data table to PDF
          pdf.addPage()
          pdf.setFontSize(16)
          pdf.text('Cost Analysis Data', 20, 20)
          
          // Add insights if available
          const insights = getCostInsights()
          if (insights.length > 0) {
            pdf.setFontSize(12)
            let yPos = 40
            insights.forEach((insight, index) => {
              pdf.text(`${index + 1}. ${insight.message}`, 20, yPos)
              yPos += 10
            })
          }
        }
        
        pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [getCostInsights])

  // Render chart based on type and view mode
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart3Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data available for visualization</p>
          </div>
        </div>
      )
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    switch (chartType) {
      case 'pie':
        const pieData = chartData.map((item, index) => ({
          name: (item as any).name || (item as any).country,
          value: viewMode === 'scholarship' ? (item as any).adjustedTotal : (item as any).total || (item as any).averageTotal,
          fill: chartColors[index % chartColors.length]
        }))

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={viewMode === 'country' ? 'country' : 'name'}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatNGN(value, { compact: true, includeSymbol: false })}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={viewMode === 'scholarship' ? 'adjustedTotal' : viewMode === 'country' ? 'averageTotal' : 'total'}
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      default: // bar
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={viewMode === 'country' ? 'country' : 'name'}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatNGN(value, { compact: true, includeSymbol: false })}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {viewMode === 'breakdown' ? (
                <>
                  <Bar dataKey="tuition" stackId="cost" fill="hsl(var(--chart-2))" name="Tuition" />
                  <Bar dataKey="living" stackId="cost" fill="hsl(var(--chart-1))" name="Living" />
                  <Bar dataKey="visa" stackId="cost" fill="hsl(var(--chart-3))" name="Visa" />
                  <Bar dataKey="application" stackId="cost" fill="hsl(var(--destructive))" name="Application" />
                </>
              ) : viewMode === 'scholarship' ? (
                <>
                  <Bar dataKey="originalTotal" fill="hsl(var(--destructive))" name="Original Cost" />
                  <Bar dataKey="adjustedTotal" fill="hsl(var(--chart-1))" name="With Scholarship" />
                </>
              ) : (
                <Bar
                  dataKey={viewMode === 'country' ? 'averageTotal' : 'total'}
                  fill="hsl(var(--chart-2))"
                  name="Total Cost"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  if (loading) {
    return <SkeletonLoader.CostChart className={className} />
  }

  if (error) {
    return (
      <div className={cn(
        "bg-card rounded-lg border border-border p-6",
        className
      )}>
        <div className="text-center text-destructive">
          <p>Error loading cost data: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-card rounded-lg border border-border p-4 sm:p-6",
      className
    )}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5 text-primary" />
            Cost Comparison
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive cost analysis across programs and countries
          </p>
        </div>

        {/* Export button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport({ format: 'png', title: 'Cost Analysis Chart', includeData: false })}
            className="px-3 py-2 text-sm bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            PNG
          </button>
          <button
            onClick={() => handleExport({ format: 'pdf', title: 'Cost Analysis Report', includeData: true })}
            className="px-3 py-2 text-sm bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Chart Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Chart Type
          </label>
          <div className="flex rounded-md border border-border">
            {[
              { type: 'bar' as ChartType, icon: BarChart3Icon, label: 'Bar' },
              { type: 'pie' as ChartType, icon: PieChartIcon, label: 'Pie' },
              { type: 'line' as ChartType, icon: TrendingUpIcon, label: 'Line' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1",
                  chartType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            View Mode
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="w-full px-3 py-2 border border-border rounded-md bg-white dark:bg-gray-700 text-foreground text-sm"
          >
            <option value="total">Total Cost</option>
            <option value="breakdown">Cost Breakdown</option>
            <option value="country">By Country</option>
            <option value="scholarship">With Scholarships</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">
            Quick Stats
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Programs: {costBreakdowns.length}</div>
            <div>Countries: {countryComparisons.length}</div>
            <div>Avg Cost: {formatNGN(costBreakdowns.reduce((sum, item) => sum + item.total, 0) / (costBreakdowns.length || 1), { compact: true })}</div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartRef} className="w-full">
        {renderChart()}
      </div>

      {/* Insights */}
      {getCostInsights().length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <InfoIcon className="w-4 h-4" />
            Cost Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getCostInsights().slice(0, 4).map((insight, index) => (
              <div 
                key={index}
                className="p-3 bg-muted/50 rounded-md border border-border"
              >
                <div className="flex items-start space-x-2">
                  <div className="text-primary dark:text-indigo-400 mt-0.5">
                    {insight.type === 'cost_breakdown' && <DollarSignIcon className="w-4 h-4" />}
                    {insight.type === 'country_comparison' && <GlobeIcon className="w-4 h-4" />}
                    {insight.type === 'scholarships' && <TrophyIcon className="w-4 h-4" />}
                    {insight.type === 'budget_efficient' && <TrendingUpIcon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {insight.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile optimization note */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        💡 Tip: Use two fingers to zoom on charts for better detail viewing on mobile
      </div>
    </div>
  )
}

export default CostComparisonChart 