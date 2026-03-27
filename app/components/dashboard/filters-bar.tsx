'use client';

import { useMemo } from 'react';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';
import { useDashboardStore } from '@/app/store/dashboard.store';
import type { Service } from '@/app/types/service';

type Props = {
  services: Service[];
  months: string[];
  weeks: string[];
};

export function FiltersBar({ services, months, weeks }: Props) {
  const { filters, setFilter, clearFilters } = useDashboardStore();

  const instructors = useMemo(
    () => Array.from(new Set(services.map((item) => item.instructor))).sort(),
    [services]
  );
  const comerciales = useMemo(
    () => Array.from(new Set(services.map((item) => item.comercial))).sort(),
    [services]
  );

  return (
    <section className="card grid grid-cols-1 gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
      <Input
        placeholder="Buscar curso, comercial, instructor..."
        value={filters.query}
        onChange={(event) => setFilter('query', event.target.value)}
      />
      <Select value={filters.instructor} onChange={(e) => setFilter('instructor', e.target.value)}>
        <option value="all">Instructor (todos)</option>
        {instructors.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
      <Select value={filters.comercial} onChange={(e) => setFilter('comercial', e.target.value)}>
        <option value="all">Comercial (todos)</option>
        {comerciales.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
      <Select value={filters.facturado} onChange={(e) => setFilter('facturado', e.target.value as 'all' | 'yes' | 'no')}>
        <option value="all">Facturado (todos)</option>
        <option value="yes">Sí</option>
        <option value="no">No</option>
      </Select>
      <Select value={filters.pagado} onChange={(e) => setFilter('pagado', e.target.value as 'all' | 'yes' | 'no')}>
        <option value="all">Pagado (todos)</option>
        <option value="yes">Sí</option>
        <option value="no">No</option>
      </Select>
      <div className="flex gap-2">
        <Select value={filters.month} onChange={(e) => setFilter('month', e.target.value)}>
          <option value="all">Mes (todos)</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </Select>
        <Select value={filters.week} onChange={(e) => setFilter('week', e.target.value)}>
          <option value="all">Semana (todas)</option>
          {weeks.map((week) => (
            <option key={week} value={week}>
              {week}
            </option>
          ))}
        </Select>
        <button className="rounded-md border px-3 text-sm" onClick={clearFilters}>
          Limpiar
        </button>
      </div>
    </section>
  );
}
