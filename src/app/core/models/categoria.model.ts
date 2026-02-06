import { Gasto } from "./gasto.model";
import { GastoRecurrente } from "./gasto_recurrente.model";

export interface Categoria {
  id?: number;
  nombre: string;
  icono: string;
  activo?: number;
  totalMonto?: number;
  dataGasto?: Gasto[],
}
