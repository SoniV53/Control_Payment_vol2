import { Gasto } from "./gasto.model";

export interface Categoria {
  id?: number;
  nombre: string;
  icono: string;
  activo?: number;
  totalMonto?: number;
  dataGasto?: Gasto[]
}
