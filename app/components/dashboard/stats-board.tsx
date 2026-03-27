'use client';

import { toCurrency } from '@/app/lib/utils';

type Props = {
  stats: {
    totalServicios: number;
    totalIngresos: number;
    facturados: number;
    noFacturados: number;
    pagados: number;
    noPagados: number;
    pctFacturado: number;
    pctPagado: number;
    byInstructor: Record<string, number>;
    byComercial: Record<string, number>;
    ventasComercial: Record<string, number>;
  };
};

export function StatsBoard({ stats }: Props) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-consitec-500">Servicios</h3>
        <p className="text-3xl font-bold">{stats.totalServicios}</p>
        <div className="mt-3 space-y-1 text-sm">
          {Object.entries(stats.byInstructor).map(([name, count]) => (
            <p key={name} className="flex justify-between">
              <span>{name}</span>
              <span className="font-medium">{count}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-consitec-500">Ventas</h3>
        <p className="text-3xl font-bold">{toCurrency(stats.totalIngresos)}</p>
        <div className="mt-3 space-y-1 text-sm">
          {Object.entries(stats.ventasComercial).map(([name, amount]) => (
            <p key={name} className="flex justify-between">
              <span>{name}</span>
              <span className="font-medium">{toCurrency(amount)}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-consitec-500">Estados</h3>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between">
            <span>% facturados</span>
            <span className="font-medium">{stats.pctFacturado.toFixed(1)}%</span>
          </p>
          <p className="flex justify-between">
            <span>% pagados</span>
            <span className="font-medium">{stats.pctPagado.toFixed(1)}%</span>
          </p>
          <p className="flex justify-between">
            <span>Facturado / No</span>
            <span className="font-medium">
              {stats.facturados} / {stats.noFacturados}
            </span>
          </p>
          <p className="flex justify-between">
            <span>Pagado / No</span>
            <span className="font-medium">
              {stats.pagados} / {stats.noPagados}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
