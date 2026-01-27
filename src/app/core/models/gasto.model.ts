export interface Gasto {
  id?: number;
  titulo: string;
  monto: number;
  descripcion?: string;
  cuotas?: number;        
  fecha: string;         
  tipo: string;          
  etiquetas?: string;     // guardadas como texto (ej: "comida,trabajo")
  categoria_id: number;
  estado_cuota?: number;  // 0 pendiente, 1 pagado (general)
}
