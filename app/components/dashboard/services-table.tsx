'use client';

import { format, parseISO } from 'date-fns';
import { Download, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { exportServicesToExcel } from '@/app/lib/export';
import { toCurrency } from '@/app/lib/utils';
import { useDashboardStore } from '@/app/store/dashboard.store';
import type { Service } from '@/app/types/service';

type Props = {
  services: Service[];
  onDelete: (id: string) => Promise<void>;
};

export function ServicesTable({ services, onDelete }: Props) {
  const { selectedIds, setSelection, toggleSelection, setEditingId } = useDashboardStore();

  const selectedRows = services.filter((service) => selectedIds.includes(service.id));

  const totalRowsHours = (service: Service) => service.fechas.reduce((acc, item) => acc + item.horas, 0);

  const exportAll = () => exportServicesToExcel(services, 'servicios_todos.xlsx');
  const exportSelected = () => exportServicesToExcel(selectedRows, 'servicios_seleccionados.xlsx');

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b p-4 dark:border-slate-800">
        <h2 className="text-lg font-semibold">Servicios registrados</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAll}>
            <Download size={16} /> Exportar filtrados
          </Button>
          <Button variant="secondary" disabled={selectedRows.length === 0} onClick={exportSelected}>
            <Download size={16} /> Exportar seleccionados ({selectedRows.length})
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900/60">
            <tr className="text-left text-slate-600 dark:text-slate-300">
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={services.length > 0 && selectedIds.length === services.length}
                  onChange={(e) => setSelection(e.target.checked ? services.map((service) => service.id) : [])}
                />
              </th>
              <th className="px-3 py-2">Comercial</th>
              <th className="px-3 py-2">Curso</th>
              <th className="px-3 py-2">Instructor</th>
              <th className="px-3 py-2">Fechas</th>
              <th className="px-3 py-2">Horas</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Facturado</th>
              <th className="px-3 py-2">Pagado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t transition-base hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">
                <td className="px-3 py-2 align-top">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(service.id)}
                    onChange={() => toggleSelection(service.id)}
                  />
                </td>
                <td className="px-3 py-2 align-top">{service.comercial}</td>
                <td className="px-3 py-2 align-top">{service.curso}</td>
                <td className="px-3 py-2 align-top">{service.instructor}</td>
                <td className="px-3 py-2 align-top">
                  <ul className="space-y-1">
                    {service.fechas.map((item, idx) => (
                      <li key={`${service.id}-d-${idx}`} className="text-xs text-slate-600 dark:text-slate-300">
                        {format(parseISO(item.fecha), 'dd/MM/yyyy')} · {item.horas}h
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-3 py-2 align-top">{totalRowsHours(service)}</td>
                <td className="px-3 py-2 align-top">{toCurrency(Number(service.precio))}</td>
                <td className="px-3 py-2 align-top">
                  <Badge label={service.facturado ? 'Sí' : 'No'} tone={service.facturado ? 'success' : 'muted'} />
                </td>
                <td className="px-3 py-2 align-top">
                  <Badge label={service.pagado ? 'Sí' : 'No'} tone={service.pagado ? 'success' : 'warning'} />
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditingId(service.id)}>
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('¿Eliminar este servicio?')) {
                          onDelete(service.id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-12 text-center text-slate-500">
                  No hay servicios con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
