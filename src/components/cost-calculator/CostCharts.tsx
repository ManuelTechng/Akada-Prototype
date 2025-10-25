import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { EnhancedCostBreakdown } from '../../lib/types/cost-calculator';

interface CostChartsProps {
  breakdown: EnhancedCostBreakdown;
  isDark?: boolean;
}

const COLORS = {
  preDeparture: '#3b82f6', // blue-500
  setup: '#8b5cf6',        // purple-500
  tuition: '#10b981',      // green-500
  living: '#f59e0b',       // amber-500
  flights: '#ec4899'       // pink-500
};

export const CostDistributionPie: React.FC<CostChartsProps> = ({ breakdown, isDark = false }) => {
  const data = [
    { name: 'Pre-Departure', value: breakdown.totalPreDeparture, color: COLORS.preDeparture },
    { name: 'Setup Costs', value: breakdown.totalSetup, color: COLORS.setup },
    { name: 'Tuition (Annual)', value: breakdown.tuition * 12, color: COLORS.tuition },
    { name: 'Living Costs (Annual)', value: (breakdown.totalMonthlyRecurring - breakdown.tuition) * 12, color: COLORS.living },
    { name: 'Return Flights', value: breakdown.annualReturnFlights, color: COLORS.flights }
  ];

  const textColor = isDark ? '#e5e7eb' : '#374151';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '0.5rem',
            color: textColor
          }}
          formatter={(value: number) => `$${value.toLocaleString()}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const OneTimeVsRecurringBar: React.FC<CostChartsProps> = ({ breakdown, isDark = false }) => {
  const data = [
    {
      category: 'One-Time',
      'Pre-Departure': breakdown.totalPreDeparture,
      'Setup': breakdown.totalSetup,
      'Initial Flight': breakdown.initialFlightTicket
    },
    {
      category: 'Recurring (Annual)',
      'Tuition': breakdown.tuition * 12,
      'Living': (breakdown.totalMonthlyRecurring - breakdown.tuition) * 12,
      'Return Flights': breakdown.annualReturnFlights
    }
  ];

  const textColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="category" stroke={textColor} />
        <YAxis stroke={textColor} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '0.5rem',
            color: textColor
          }}
          formatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Legend wrapperStyle={{ color: textColor }} />
        <Bar dataKey="Pre-Departure" fill={COLORS.preDeparture} />
        <Bar dataKey="Setup" fill={COLORS.setup} />
        <Bar dataKey="Initial Flight" fill={COLORS.flights} />
        <Bar dataKey="Tuition" fill={COLORS.tuition} />
        <Bar dataKey="Living" fill={COLORS.living} />
        <Bar dataKey="Return Flights" fill={COLORS.flights} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PaymentTimelineChart: React.FC<CostChartsProps> = ({ breakdown, isDark = false }) => {
  // Generate 12-month timeline data
  const timelineData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    let monthlyPayment = breakdown.totalMonthlyRecurring;

    // Add one-time costs in month 1
    if (month === 1) {
      monthlyPayment += breakdown.totalPreDeparture + breakdown.totalSetup;
    }

    // Add return flight in month 12
    if (month === 12) {
      monthlyPayment += breakdown.annualReturnFlights;
    }

    return {
      month: `Month ${month}`,
      payment: monthlyPayment,
      cumulative: Array.from({ length: month }, (_, j) => {
        let payment = breakdown.totalMonthlyRecurring;
        if (j === 0) payment += breakdown.totalPreDeparture + breakdown.totalSetup;
        if (j === 11) payment += breakdown.annualReturnFlights;
        return payment;
      }).reduce((sum, val) => sum + val, 0)
    };
  });

  const textColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={timelineData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="month"
          stroke={textColor}
          tick={{ fontSize: 12 }}
          interval={2}
        />
        <YAxis
          stroke={textColor}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '0.5rem',
            color: textColor
          }}
          formatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Legend wrapperStyle={{ color: textColor }} />
        <Line
          type="monotone"
          dataKey="payment"
          stroke={COLORS.preDeparture}
          strokeWidth={2}
          name="Monthly Payment"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke={COLORS.tuition}
          strokeWidth={2}
          name="Cumulative Total"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
