import { GastoCuota } from "./gasto-cuota.model";

export interface Gasto {
  id?: number;
  titulo: string;
  monto: number;
  descripcion?: string | null;
  cuotas?: number;
  fecha: string;
  fechaEnd?: string;
  tipo: string;
  etiquetas?: string | null;
  categoria_id?: number | null;
  estado?: number; // 0 pendiente, 1 pagado
  gastoCuota?:GastoCuota
  
}
