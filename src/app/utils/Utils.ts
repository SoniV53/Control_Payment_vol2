
export const getIconPath = (iconName: string, pordefecto: string = ''): string => {
    if (pordefecto)
        return iconName ? `assets/ionicons/${iconName}.svg` : pordefecto;
    return `assets/ionicons/${iconName}.svg`;
};



