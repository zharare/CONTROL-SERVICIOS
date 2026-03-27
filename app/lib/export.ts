import { format, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import type { Service } from '@/app/types/service';

export function exportServicesToExcel(services: Service[], fileName = 'servicios_consitec.xlsx') {
  const rows = services.map((service) => ({
    Comercial: service.comercial,
    Curso: service.curso,
    Instructor: service.instructor,
    Fechas: service.fechas.map((f) => format(parseISO(f.fecha), 'dd/MM/yyyy')).join(', '),
    Horas: service.fechas.reduce((acc, d) => acc + d.horas, 0),
    Precio: Number(service.precio),
    Facturado: service.facturado ? 'Sí' : 'No',
    Pagado: service.pagado ? 'Sí' : 'No'
  }));

  const total = rows.reduce((acc, row) => acc + row.Precio, 0);

  rows.push({
    Comercial: '',
    Curso: '',
    Instructor: '',
    Fechas: `Exportado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
    Horas: 0,
    Precio: total,
    Facturado: 'TOTAL',
    Pagado: ''
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Servicios');
  XLSX.writeFile(workbook, fileName);
}
