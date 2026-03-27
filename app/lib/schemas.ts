import { z } from 'zod';

export const serviceDateSchema = z.object({
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  horas: z.coerce.number().min(0.5, 'Mínimo 0.5 horas').max(24, 'Máximo 24 horas')
});

export const serviceSchema = z.object({
  comercial: z.string().min(2, 'Comercial requerido'),
  curso: z.string().min(3, 'Curso requerido'),
  instructor: z.string().min(2, 'Instructor requerido'),
  fechas: z.array(serviceDateSchema).min(1, 'Agrega al menos una fecha'),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  facturado: z.boolean(),
  pagado: z.boolean()
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
