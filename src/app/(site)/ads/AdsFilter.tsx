"use client";

import { useRouter, useSearchParams } from 'next/navigation';

interface AdsFilterProps {
  years: number[];
  currentYear?: number;
}

export function AdsFilter({ years, currentYear }: AdsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('year', e.target.value);
    } else {
      params.delete('year');
    }
    // Using router.push is better than window.location for SPA navigation
    router.push(`/ads?${params.toString()}`);
  };

  return (
    <select
      className="input-base h-9 text-sm py-0 w-auto"
      value={currentYear || ''}
      onChange={handleYearChange}
    >
      <option value="">All Years</option>
      {years.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}