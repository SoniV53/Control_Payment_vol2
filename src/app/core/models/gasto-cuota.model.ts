export interface GastoCuota {
  id?: number;
  gasto_id: number;
  numero_cuota: number;
  monto_cuota: number;
  fecha_pago?: string | null;
  estado_cuota?: number; // 0 pendiente, 1 pagada
}