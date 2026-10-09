import { getMoths } from "./IconosList";

export const getIconPath = (iconName: string, pordefecto: string = ''): string => {
    if (pordefecto)
        return iconName ? `assets/ionicons/${iconName}.svg` : pordefecto;
    return `assets/ionicons/${iconName}.svg`;
};



export const formatearMonto = (valor: number, moneda: string = 'GTQ'): string => {
    return new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: moneda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

export const eNumber = (valor: any): number => {
    return Number(valor) || 0;
}

export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export const getMesActual = (today: Date): string => {
    const date = new Date(dateSearch(today)[0]);
    return formatDate(date);
}

export const getMesAnterior = (today: Date): string => {
    const date = new Date(dateSearch(today)[0]);
    const fecha = new Date(date);
    fecha.setMonth(fecha.getMonth() - 1);

    return formatDate(fecha);
}

export const getMesSiguiente = (today: Date): string => {
    const date = new Date(dateSearch(today)[0]);
    const fecha = new Date(date);
    fecha.setMonth(fecha.getMonth() + 1);

    return formatDate(fecha);
}

export const dateSearch = (valor: string | Date): string[] => {
    if (!valor) return [];

    let anio: number, mes: number;

    if (typeof valor === 'string' && valor.includes('-')) {
        const parts = valor.split('-');
        anio = parseInt(parts[0], 10);
        mes = parseInt(parts[1], 10);
    } else {
        const d = new Date(valor);
        anio = d.getFullYear();
        mes = d.getMonth() + 1;
    }

    const formatYM = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}-01`;

    let inicio = formatYM(anio, mes);

    // Calcular siguiente mes
    let anioSiguiente = anio;
    let mesSiguiente = mes + 1;
    if (mesSiguiente > 12) {
        mesSiguiente = 1;
        anioSiguiente++;
    }
    let siguienteMes = formatYM(anioSiguiente, mesSiguiente);

    // Calcular anterior mes
    let anioAnterior = anio;
    let mesAnterior = mes - 1;
    if (mesAnterior < 1) {
        mesAnterior = 12;
        anioAnterior--;
    }
    let anteriorMes = formatYM(anioAnterior, mesAnterior);

    return [inicio, siguienteMes, anteriorMes];
}

export const validarCuotasConRango = (
    fechaInicio: string,
    fechaFin: string,
    numeroCuotas: number
): boolean => {

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin < inicio) return false;

    const anios = fin.getFullYear() - inicio.getFullYear();
    const meses = fin.getMonth() - inicio.getMonth();

    const totalMeses = anios * 12 + meses + 1;

    return totalMeses === numeroCuotas;
}

export const getFragmentDate = (date: string | any): string[] => {
    if (date) {
        const selected = new Date(date);
        const year = selected.getFullYear().toString();
        const month = String(selected.getMonth() + 1).padStart(2, '0');
        const day = String(selected.getDate()).padStart(2, '0');

        return [year, month, day];
    }
    return []
}

export const getNameMonth = (month: string):string => {
    const meses = getMoths()
    const findMonth = meses.find(res => res.id === month);
    if (findMonth) {
        return findMonth.nombre
    } else {
        const num = Number(month) - 1;
        return meses[num].nombre;
    }
}

export enum CatalogoTipoGasto {
    NORMAL = 'normal',
    CUOTA = 'cuota',
    RECURRENTE = 'recurrente',
}
export const addMonthsSafe = (dateStr: string, monthsToAdd: number): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length < 3) return '';
  
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1; // 0-11
  const d = parseInt(parts[2], 10);
  
  const totalMonths = y * 12 + m + monthsToAdd;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = totalMonths % 12; // 0-11
  
  let date = new Date(newYear, newMonth, d);
  if (date.getMonth() !== newMonth) {
    // Clamped to last day of the desired month
    date = new Date(newYear, newMonth + 1, 0); 
  }
  
  const finalYear = date.getFullYear();
  const finalMonth = String(date.getMonth() + 1).padStart(2, '0');
  const finalDay = String(date.getDate()).padStart(2, '0');
  
  return `${finalYear}-${finalMonth}-${finalDay}`;
};




