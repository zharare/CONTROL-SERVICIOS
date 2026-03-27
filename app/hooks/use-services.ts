"use client";

import { useEffect, useMemo, useState } from "react";
import { endOfMonth, format, getISOWeek, parseISO, isValid } from "date-fns";
import { toast } from "sonner";
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
} from "@/app/lib/services.repository";
import { supabase } from "@/app/lib/supabase/client";
import { useDashboardStore } from "@/app/store/dashboard.store";
import type { Service, ServiceInsert } from "@/app/types/service";

// 🔥 MÁS ROBUSTO
function nearestDate(service: Service) {
  if (!service.fechas || service.fechas.length === 0) return new Date(0);

  const now = new Date();

  const validDates = service.fechas
    .map((item) => {
      const d = parseISO(item.fecha);
      return isValid(d) ? d : null;
    })
    .filter(Boolean) as Date[];

  if (validDates.length === 0) return new Date(0);

  return validDates.sort(
    (a, b) =>
      Math.abs(a.getTime() - now.getTime()) -
      Math.abs(b.getTime() - now.getTime())
  )[0];
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

        if (!records) throw new Error("No se recibieron datos");

        if (mounted) setServices(records);
      } catch (error: any) {
        console.error("LOAD ERROR:", error?.message || error);
        toast.error(error?.message || "No se pudieron cargar los servicios.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // 🔥 REALTIME ROBUSTO
    const channel = supabase
      .channel("services-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        (payload) => {
          console.log("Realtime change:", payload);
          load();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = filters.query.toLowerCase().trim();

    return services
      .filter((service) => {
        if (!service.fechas) return false;

        if (filters.instructor !== "all" && service.instructor !== filters.instructor) return false;
        if (filters.comercial !== "all" && service.comercial !== filters.comercial) return false;
        if (filters.facturado !== "all" && service.facturado !== (filters.facturado === "yes")) return false;
        if (filters.pagado !== "all" && service.pagado !== (filters.pagado === "yes")) return false;

        const parsedDates = service.fechas
          .map((d) => {
            const date = parseISO(d.fecha);
            return isValid(date) ? date : null;
          })
          .filter(Boolean) as Date[];

        if (filters.month !== "all") {
          const hasMonth = parsedDates.some(
            (date) => format(date, "yyyy-MM") === filters.month
          );
          if (!hasMonth) return false;
        }

        if (filters.week !== "all") {
          const [year, week] = filters.week.split("-W");
          const hasWeek = parsedDates.some(
            (date) =>
              format(date, "yyyy") === year &&
              String(getISOWeek(date)).padStart(2, "0") === week
          );
          if (!hasWeek) return false;
        }

        if (!query) return true;

        return [service.comercial, service.curso, service.instructor].some(
          (value) => value?.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) => nearestDate(b).getTime() - nearestDate(a).getTime()
      );
  }, [filters, services]);

  const stats = useMemo(() => {
    const totalIngresos = filtered.reduce(
      (acc, cur) => acc + Number(cur.precio || 0),
      0
    );

    const facturados = filtered.filter((i) => i.facturado).length;
    const pagados = filtered.filter((i) => i.pagado).length;

    const byInstructor: Record<string, number> = {};
    const byComercial: Record<string, number> = {};
    const ventasComercial: Record<string, number> = {};

    filtered.forEach((item) => {
      byInstructor[item.instructor] = (byInstructor[item.instructor] ?? 0) + 1;
      byComercial[item.comercial] = (byComercial[item.comercial] ?? 0) + 1;
      ventasComercial[item.comercial] =
        (ventasComercial[item.comercial] ?? 0) + Number(item.precio || 0);
    });

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
      ventasComercial,
    };
  }, [filtered]);

  const upsert = async (payload: ServiceInsert, id?: string) => {
  setSaving(true);
  try {
    if (id) {
      await updateService(id, payload);

      // 🔥 ACTUALIZA EN MEMORIA
      setServices((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...payload } : item
        )
      );

      toast.success("Servicio actualizado");
    } else {
      const newService = await createService(payload);

      // 🔥 INSERTA EN MEMORIA (ARRIBA DE LA LISTA)
      setServices((prev) => [newService, ...prev]);

      toast.success("Servicio creado");
    }
  } catch (error: any) {
    console.error("UPSERT ERROR:", error?.message || error);
    toast.error(error?.message || "No se pudo guardar el servicio");
  } finally {
    setSaving(false);
  }
};

  const remove = async (id: string) => {
  try {
    await deleteService(id);

    // 🔥 ELIMINA DEL ESTADO LOCAL
    setServices((prev) => prev.filter((item) => item.id !== id));

    toast.success("Servicio eliminado");
  } catch (error: any) {
    console.error("DELETE ERROR:", error?.message || error);
    toast.error(error?.message || "No se pudo eliminar");
  }
};

  const availableMonths = Array.from(
    new Set(
      services.flatMap((s) =>
        (s.fechas || []).map((d) =>
          format(parseISO(d.fecha), "yyyy-MM")
        )
      )
    )
  ).sort((a, b) => b.localeCompare(a));

  const availableWeeks = Array.from(
    new Set(
      services.flatMap((s) =>
        (s.fechas || []).map((d) => {
          const date = parseISO(d.fecha);
          return `${format(date, "yyyy")}-W${String(
            getISOWeek(date)
          ).padStart(2, "0")}`;
        })
      )
    )
  ).sort((a, b) => b.localeCompare(a));

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
    maxMonth: format(endOfMonth(new Date()), "yyyy-MM"),
  };
}