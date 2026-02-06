export interface GastoRecurrente {
  id?: number;
  titulo: string;
  monto: number;
  descripcion?: string | null;
  etiquetas?: string | null;
  fechaInicio: string;
  categoria_id?: number | null;
  activo?: number; // 1 activo, 0 detenido
  frecuencia?: string; // 'mensual' | 'semanal' | 'anual'
  proxima_fecha?: string;
  cantidad?: number;
}
