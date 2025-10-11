// Hook for accessing program currency information and conversions
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { currencyService } from '../lib/currency/CurrencyService';
import { useCurrencyPreferences } from '../lib/currency/hooks';
import type { Program } from '../lib/types';
import type { CurrencyConversion } from '../lib/currency/types';

interface ProgramWithCurrency extends Program {
  // Converted amounts in user's preferred currency
  tuition_fee_converted?: number;
  application_fee_converted?: number;
  tuition_conversion_rate?: number;
  application_conversion_rate?: number;
  user_currency?: string;
}

interface ProgramCurrencyResult {
  program: ProgramWithCurrency | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook to fetch program with currency information and convert to user's preferred currency
 */
export function useProgramCurrency(programId: string, userId?: string): ProgramCurrencyResult {
  const [program, setProgram] = useState<ProgramWithCurrency | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { preferences } = useCurrencyPreferences(userId);

  const fetchProgramWithCurrency = useCallback(async () => {
    if (!programId) {
      setError('Program ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch program with currency fields
      const { data: programData, error: fetchError } = await supabase
        .from('programs')
        .select(`
          *,
          tuition_fee_currency,
          tuition_fee_original,
          application_fee_currency,
          application_fee_original,
          last_currency_update,
          currency_source
        `)
        .eq('id', programId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch program: ${fetchError.message}`);
      }

      if (!programData) {
        throw new Error('Program not found');
      }

      // Convert to user's preferred currency if different
      const userCurrency = preferences.primary;
      const tuitionCurrency = programData.tuition_fee_currency || 'USD';
      const applicationCurrency = programData.application_fee_currency || 'USD';

      let tuitionConversion: CurrencyConversion | null = null;
      let applicationConversion: CurrencyConversion | null = null;

      // Convert tuition fee if needed
      if (userCurrency !== tuitionCurrency && programData.tuition_fee_original) {
        try {
          tuitionConversion = await currencyService.convertAmount(
            programData.tuition_fee_original,
            tuitionCurrency,
            userCurrency
          );
        } catch (conversionError) {
          console.warn('Tuition currency conversion failed:', conversionError);
        }
      }

      // Convert application fee if needed
      if (userCurrency !== applicationCurrency && programData.application_fee_original) {
        try {
          applicationConversion = await currencyService.convertAmount(
            programData.application_fee_original,
            applicationCurrency,
            userCurrency
          );
        } catch (conversionError) {
          console.warn('Application fee currency conversion failed:', conversionError);
        }
      }

      // Combine program data with conversions
      const enhancedProgram: ProgramWithCurrency = {
        ...programData,
        tuition_fee_converted: tuitionConversion?.convertedAmount,
        application_fee_converted: applicationConversion?.convertedAmount,
        tuition_conversion_rate: tuitionConversion?.exchangeRate,
        application_conversion_rate: applicationConversion?.exchangeRate,
        user_currency: userCurrency
      };

      setProgram(enhancedProgram);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch program currency data';
      setError(errorMessage);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  }, [programId, preferences.primary]);

  // Initial fetch
  useEffect(() => {
    fetchProgramWithCurrency();
  }, [fetchProgramWithCurrency]);

  const refresh = useCallback(() => {
    fetchProgramWithCurrency();
  }, [fetchProgramWithCurrency]);

  return {
    program,
    loading,
    error,
    refresh
  };
}

/**
 * Hook to fetch multiple programs with currency conversion
 */
export function useProgramsCurrency(
  programIds: string[],
  userId?: string
): {
  programs: ProgramWithCurrency[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [programs, setPrograms] = useState<ProgramWithCurrency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { preferences } = useCurrencyPreferences(userId);

  const fetchProgramsWithCurrency = useCallback(async () => {
    if (!programIds.length) {
      setPrograms([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch programs with currency fields
      const { data: programsData, error: fetchError } = await supabase
        .from('programs')
        .select(`
          *,
          tuition_fee_currency,
          tuition_fee_original,
          application_fee_currency,
          application_fee_original,
          last_currency_update,
          currency_source
        `)
        .in('id', programIds);

      if (fetchError) {
        throw new Error(`Failed to fetch programs: ${fetchError.message}`);
      }

      if (!programsData) {
        setPrograms([]);
        return;
      }

      const userCurrency = preferences.primary;
      const enhancedPrograms: ProgramWithCurrency[] = [];

      // Process each program with currency conversion
      for (const programData of programsData) {
        const tuitionCurrency = programData.tuition_fee_currency || 'USD';
        const applicationCurrency = programData.application_fee_currency || 'USD';

        let tuitionConversion: CurrencyConversion | null = null;
        let applicationConversion: CurrencyConversion | null = null;

        // Convert currencies if needed
        if (userCurrency !== tuitionCurrency && programData.tuition_fee_original) {
          try {
            tuitionConversion = await currencyService.convertAmount(
              programData.tuition_fee_original,
              tuitionCurrency,
              userCurrency
            );
          } catch (conversionError) {
            console.warn(`Tuition conversion failed for program ${programData.id}:`, conversionError);
          }
        }

        if (userCurrency !== applicationCurrency && programData.application_fee_original) {
          try {
            applicationConversion = await currencyService.convertAmount(
              programData.application_fee_original,
              applicationCurrency,
              userCurrency
            );
          } catch (conversionError) {
            console.warn(`Application fee conversion failed for program ${programData.id}:`, conversionError);
          }
        }

        enhancedPrograms.push({
          ...programData,
          tuition_fee_converted: tuitionConversion?.convertedAmount,
          application_fee_converted: applicationConversion?.convertedAmount,
          tuition_conversion_rate: tuitionConversion?.exchangeRate,
          application_conversion_rate: applicationConversion?.exchangeRate,
          user_currency: userCurrency
        });
      }

      setPrograms(enhancedPrograms);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch programs currency data';
      setError(errorMessage);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [programIds, preferences.primary]);

  // Initial fetch
  useEffect(() => {
    fetchProgramsWithCurrency();
  }, [fetchProgramsWithCurrency]);

  const refresh = useCallback(() => {
    fetchProgramsWithCurrency();
  }, [fetchProgramsWithCurrency]);

  return {
    programs,
    loading,
    error,
    refresh
  };
}

export default {
  useProgramCurrency,
  useProgramsCurrency
};