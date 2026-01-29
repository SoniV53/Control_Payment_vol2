export interface Gasto {
  id?: number;
  titulo: string;
  monto: number;
  descripcion?: string;
  cuotas?: number;        
  fecha: string;         
  tipo: string;          
  etiquetas?: string;     
  categoria_id?: number | null; // null si no tiene categoria
  estado_cuota?: number;  // 0 pendiente, 1 pagado (general)
}
