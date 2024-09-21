export const getGradientStartColor = (mode: number): string => {
    switch (mode) {
        case 0: return '#FF5F38';
        case 1: return '#2A7963';
        case 2: return '#406DE9';
        case 3: return '#7234DC';
        default: return '#FF5F38';
    }
};

export const getGradientEndColor = (mode: number): string => {
    switch (mode) {
        case 0: return '#DB9E2D';
        case 1: return '#3FC466';
        case 2: return '#34AADC';
        case 3: return '#A540E9';
        default: return '#DB9E2D';
    }
};

export const rgbToRgba = (color: string, transparencyPercentage: number): string => {
    const alpha = transparencyPercentage / 100;

    // Convert hex color to RGB if necessary
    if (color.startsWith('#')) {
        color = hexToRgb(color);
    }

    if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }

    throw new Error("Invalid color format. Please provide a color in 'rgb(r, g, b)' or hex format.");
};

const hexToRgb = (hex: string): string => {
    let r = 0, g = 0, b = 0;

    // Remove the '#' if present
    hex = hex.replace('#', '');

    if (hex.length === 3) {
        // Handle 3-digit hex (e.g., #f00)
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        // Handle 6-digit hex (e.g., #ff0000)
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgb(${r}, ${g}, ${b})`;
};