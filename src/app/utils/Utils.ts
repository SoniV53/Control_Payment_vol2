
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
    if (!valor) {
        return [];
    }
    const date = formatDate(new Date(valor));
    let fechaS = date.toString();
    let [anio, mes] = fechaS.split('-');
    let inicio = `${anio}-${mes}-01`;

    const fecha = new Date(valor);
    fecha.setMonth(fecha.getMonth() + 1);
    const dateFormat = formatDate(fecha);

    let fechaN = dateFormat.toString();
    let [anioN, mesN] = fechaN.split('-');
    let siguienteMes = `${anioN}-${mesN}-01`;


    const fechaL = new Date(valor);
    fechaL.setMonth(fechaL.getMonth() - 1);
    const dateLFormat = formatDate(fechaL);

    let fechaSl = dateLFormat.toString();
    let [anioL, mesL] = fechaSl.split('-');
    let anteriorMes = `${anioL}-${mesL}-01`;

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

const enum CatalogoTipoGasto{
    NORMAL = 'normal',
    CUOTA = 'cuota',
    REQUERRIDO = 'requerrido',
}