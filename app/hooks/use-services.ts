'use client';

import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, format, getISOWeek, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  createService,
  deleteService,
  fetchServices,
  updateService
} from '@/app/lib/services.repository';
import { supabase } from '@/app/lib/supabase/client';
import { useDashboardStore } from '@/app/store/dashboard.store';
import type { Service, ServiceInsert } from '@/app/types/service';

function nearestDate(service: Service) {
  const now = new Date();
  return service.fechas
    .map((item) => parseISO(item.fecha))
    .sort((a, b) => Math.abs(a.getTime() - now.getTime()) - Math.abs(b.getTime() - now.getTime()))[0];
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { filters } = useDashboardStore();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const records = await fetchServices();
        if (mounted) {
          setServices(records);
        }
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar los servicios.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel('services-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        load();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = filters.query.toLowerCase().trim();

    return services
      .filter((service) => {
        if (filters.instructor !== 'all' && service.instructor !== filters.instructor) return false;
        if (filters.comercial !== 'all' && service.comercial !== filters.comercial) return false;
        if (filters.facturado !== 'all' && service.facturado !== (filters.facturado === 'yes')) return false;
        if (filters.pagado !== 'all' && service.pagado !== (filters.pagado === 'yes')) return false;

        const parsedDates = service.fechas.map((d) => parseISO(d.fecha));

        if (filters.month !== 'all') {
          const monthStr = filters.month;
          const hasMonth = parsedDates.some((date) => format(date, 'yyyy-MM') === monthStr);
          if (!hasMonth) return false;
        }

        if (filters.week !== 'all') {
          const [year, week] = filters.week.split('-W');
          const hasWeek = parsedDates.some(
            (date) => format(date, 'yyyy') === year && String(getISOWeek(date)).padStart(2, '0') === week
          );
          if (!hasWeek) return false;
        }

        if (!query) return true;

        return [service.comercial, service.curso, service.instructor].some((value) =>
          value.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => nearestDate(b).getTime() - nearestDate(a).getTime());
  }, [filters, services]);

  const stats = useMemo(() => {
    const totalIngresos = filtered.reduce((acc, cur) => acc + Number(cur.precio), 0);
    const facturados = filtered.filter((item) => item.facturado).length;
    const pagados = filtered.filter((item) => item.pagado).length;

    const byInstructor = filtered.reduce<Record<string, number>>((acc, item) => {
      acc[item.instructor] = (acc[item.instructor] ?? 0) + 1;
      return acc;
    }, {});

    const byComercial = filtered.reduce<Record<string, number>>((acc, item) => {
      acc[item.comercial] = (acc[item.comercial] ?? 0) + 1;
      return acc;
    }, {});

    const ventasComercial = filtered.reduce<Record<string, number>>((acc, item) => {
      acc[item.comercial] = (acc[item.comercial] ?? 0) + Number(item.precio);
      return acc;
    }, {});

    return {
      totalServicios: filtered.length,
      totalIngresos,
      facturados,
      noFacturados: filtered.length - facturados,
      pagados,
      noPagados: filtered.length - pagados,
      pctFacturado: filtered.length ? (facturados / filtered.length) * 100 : 0,
      pctPagado: filtered.length ? (pagados / filtered.length) * 100 : 0,
      byInstructor,
      byComercial,
      ventasComercial
    };
  }, [filtered]);

  const upsert = async (payload: ServiceInsert, id?: string) => {
    setSaving(true);
    try {
      if (id) {
        await updateService(id, payload);
        toast.success('Servicio actualizado');
      } else {
        await createService(payload);
        toast.success('Servicio creado');
      }
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el servicio');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteService(id);
      toast.success('Servicio eliminado');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar');
    }
  };

  const availableMonths = Array.from(
    new Set(services.flatMap((s) => s.fechas.map((d) => format(parseISO(d.fecha), 'yyyy-MM'))))
  ).sort((a, b) => b.localeCompare(a));

  const availableWeeks = Array.from(
    new Set(
      services.flatMap((s) =>
        s.fechas.map((d) => {
          const date = parseISO(d.fecha);
          return `${format(date, 'yyyy')}-W${String(getISOWeek(date)).padStart(2, '0')}`;
        })
      )
    )
  ).sort((a, b) => b.localeCompare(a));

  const maxMonth = endOfMonth(new Date());

  return {
    services,
    filtered,
    loading,
    saving,
    upsert,
    remove,
    stats,
    availableMonths,
    availableWeeks,
    maxMonth: format(maxMonth, 'yyyy-MM')
  };
}
