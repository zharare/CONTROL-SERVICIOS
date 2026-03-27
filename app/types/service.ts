export type ServiceDate = {
  fecha: string;
  horas: number;
};

export type Service = {
  id: string;
  comercial: string;
  curso: string;
  instructor: string;
  fechas: ServiceDate[];
  precio: number;
  facturado: boolean;
  pagado: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>;
