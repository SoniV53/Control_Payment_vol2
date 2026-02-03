
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