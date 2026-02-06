import { GastoCuota } from "./gasto-cuota.model";

export interface Gasto {
  id?: number;
  titulo: string;
  monto: number;
  descripcion?: string | null;
  cuotas?: number;
  fecha: string;
  fechaEnd?: string | null;
  tipo: string;// normal, cuota, recurrente
  etiquetas?: string | null;
  categoria_id?: number | null;
  recurrente_id?: number | null;
  estado?: number; // 0 pendiente, 1 pagado, 2 eliminado
  gastoCuota?:GastoCuota
  
}
