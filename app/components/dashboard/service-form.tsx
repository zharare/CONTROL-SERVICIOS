'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { serviceSchema, type ServiceFormValues } from '@/app/lib/schemas';
import { useDashboardStore } from '@/app/store/dashboard.store';
import type { Service } from '@/app/types/service';

type Props = {
  saving: boolean;
  services: Service[];
  onSubmit: (values: ServiceFormValues, id?: string) => Promise<void>;
};

const defaultValues: ServiceFormValues = {
  comercial: '',
  curso: '',
  instructor: '',
  fechas: [{ fecha: '', horas: 1 }],
  precio: 0,
  facturado: false,
  pagado: false
};

export function ServiceForm({ saving, services, onSubmit }: Props) {
  const { editingId, setEditingId } = useDashboardStore();
  const form = useForm<ServiceFormValues>({
  resolver: zodResolver(serviceSchema) as any,
  defaultValues
});

  const { control, register, handleSubmit, reset, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'fechas' });

  useEffect(() => {
    if (!editingId) {
      reset(defaultValues);
      return;
    }

    const target = services.find((service) => service.id === editingId);
    if (target) {
      reset({
        comercial: target.comercial,
        curso: target.curso,
        instructor: target.instructor,
        fechas: target.fechas,
        precio: Number(target.precio),
        facturado: target.facturado,
        pagado: target.pagado
      });
    }
  }, [editingId, reset, services]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values, editingId ?? undefined);
    setEditingId(null);
    reset(defaultValues);
  });

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-consitec-700 dark:text-consitec-100">
          {editingId ? 'Editar servicio' : 'Nuevo servicio'}
        </h2>
        {editingId && (
          <Button variant="outline" onClick={() => setEditingId(null)}>
            <X size={16} /> Cancelar
          </Button>
        )}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <Input placeholder="Comercial" {...register('comercial')} />
            <p className="mt-1 text-xs text-red-500">{formState.errors.comercial?.message}</p>
          </div>
          <div>
            <Input placeholder="Curso" {...register('curso')} />
            <p className="mt-1 text-xs text-red-500">{formState.errors.curso?.message}</p>
          </div>
          <div>
            <Input placeholder="Instructor" {...register('instructor')} />
            <p className="mt-1 text-xs text-red-500">{formState.errors.instructor?.message}</p>
          </div>
          <div>
            <Input type="number" step="0.01" placeholder="Precio" {...register('precio')} />
            <p className="mt-1 text-xs text-red-500">{formState.errors.precio?.message}</p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-dashed p-3 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Fechas y horas</h3>
            <Button type="button" variant="outline" onClick={() => append({ fecha: '', horas: 1 })}>
              <Plus size={16} /> Agregar fecha
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr,120px,90px]">
              <Input type="date" {...register(`fechas.${index}.fecha`)} />
              <Input type="number" step="0.5" placeholder="Horas" {...register(`fechas.${index}.horas`)} />
              <Button type="button" variant="destructive" onClick={() => remove(index)} disabled={fields.length === 1}>
                Eliminar
              </Button>
            </div>
          ))}
          <p className="text-xs text-red-500">{formState.errors.fechas?.message as string | undefined}</p>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('facturado')} /> Facturado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('pagado')} /> Pagado
          </label>
          <Button disabled={saving} className="ml-auto" type="submit">
            <Save size={16} /> {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </section>
  );
}
