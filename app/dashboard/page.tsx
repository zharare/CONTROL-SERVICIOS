'use client';

import { Loader2 } from 'lucide-react';
import { FiltersBar } from '@/app/components/dashboard/filters-bar';
import { ServiceForm } from '@/app/components/dashboard/service-form';
import { StatsBoard } from '@/app/components/dashboard/stats-board';
import { ServicesTable } from '@/app/components/dashboard/services-table';
import { ThemeToggle } from '@/app/components/dashboard/theme-toggle';
import { useServices } from '@/app/hooks/use-services';

export default function DashboardPage() {
  const { services, filtered, loading, saving, upsert, remove, stats, availableMonths, availableWeeks } =
    useServices();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-4 p-4 md:p-6">
      <header className="card flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-consitec-accent">CONSITEC</p>
          <h1 className="text-2xl font-bold text-consitec-700 dark:text-consitec-100">Control de Servicios</h1>
        </div>
        <ThemeToggle />
      </header>

      <ServiceForm
        services={services}
        saving={saving}
        onSubmit={async (values, id) => {
          await upsert(values, id);
        }}
      />

      <FiltersBar services={services} months={availableMonths} weeks={availableWeeks} />

      {loading ? (
        <section className="card flex h-60 items-center justify-center">
          <Loader2 className="animate-spin" />
        </section>
      ) : (
        <ServicesTable services={filtered} onDelete={remove} />
      )}

      <StatsBoard stats={stats} />
    </main>
  );
}
