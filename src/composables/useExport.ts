export type ExportFormat = "css" | "scss" | "tailwind" | "json";

export interface ExportOptions {
    format: ExportFormat;
    colors: Color[];
    paletteName?: string;
}

export function useExport() {
    /**
     * Генерирует имя переменной из индекса цвета
     */
    const generateColorName = (index: number): string => {
        const names = ["primary", "secondary", "accent", "highlight", "neutral", "complementary", "tertiary"];
        return names[index] || `color-${index + 1}`;
    };

    /**
     * Экспорт в CSS переменные
     */
    const exportToCSS = (colors: Color[], paletteName = "palette"): string => {
        let css = `:root {\n`;
        css += `  /* ${paletteName} */\n`;

        colors.forEach((color, index) => {
            const name = generateColorName(index);
            css += `  --${name}: ${color.hex};\n`;
            css += `  --${name}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`;
        });

        css += `}\n`;
        return css;
    };

    /**
     * Экспорт в SCSS переменные
     */
    const exportToSCSS = (colors: Color[], paletteName = "palette"): string => {
        let scss = `// ${paletteName}\n`;

        colors.forEach((color, index) => {
            const name = generateColorName(index);
            scss += `$${name}: ${color.hex};\n`;
            scss += `$${name}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`;
        });

        scss += `\n// Palette map\n`;
        scss += `$colors: (\n`;
        colors.forEach((color, index) => {
            const name = generateColorName(index);
            scss += `  '${name}': ${color.hex}${index < colors.length - 1 ? "," : ""}\n`;
        });
        scss += `);\n`;

        return scss;
    };

    /**
     * Экспорт в Tailwind config
     */
    const exportToTailwind = (colors: Color[], paletteName = "palette"): string => {
        let config = `// ${paletteName}\n`;
        config += `// Add to tailwind.config.js under theme.extend.colors\n\n`;
        config += `module.exports = {\n`;
        config += `  theme: {\n`;
        config += `    extend: {\n`;
        config += `      colors: {\n`;

        colors.forEach((color, index) => {
            const name = generateColorName(index);
            config += `        '${name}': '${color.hex}',\n`;
        });

        config += `      },\n`;
        config += `    },\n`;
        config += `  },\n`;
        config += `}\n`;

        return config;
    };

    /**
     * Экспорт в JSON
     */
    const exportToJSON = (colors: Color[], paletteName = "palette"): string => {
        const paletteData: Record<string, any> = {
            name: paletteName,
            colors: colors.map((color, index) => ({
                name: generateColorName(index),
                hex: color.hex,
                rgb: color.rgb,
            })),
        };

        return JSON.stringify(paletteData, null, 2);
    };

    /**
     * Главная функция экспорта
     */
    const exportPalette = (options: ExportOptions): string => {
        const { format, colors, paletteName = "My Palette" } = options;

        switch (format) {
            case "css":
                return exportToCSS(colors, paletteName);
            case "scss":
                return exportToSCSS(colors, paletteName);
            case "tailwind":
                return exportToTailwind(colors, paletteName);
            case "json":
                return exportToJSON(colors, paletteName);
            default:
                throw new Error(`Unknown export format: ${format}`);
        }
    };

    /**
     * Скачать экспортированный файл
     */
    const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * Экспортировать и скачать
     */
    const exportAndDownload = (options: ExportOptions) => {
        const content = exportPalette(options);
        const extensions: Record<ExportFormat, string> = {
            css: "css",
            scss: "scss",
            tailwind: "js",
            json: "json",
        };

        const filename = `${options.paletteName || "palette"}.${extensions[options.format]}`;
        downloadFile(content, filename);
    };

    /**
     * Копировать в буфер обмена
     */
    const copyToClipboard = async (content: string): Promise<boolean> => {
        try {
            await navigator.clipboard.writeText(content);
            return true;
        } catch (err) {
            console.error("Failed to copy:", err);
            return false;
        }
    };

    return {
        exportPalette,
        exportToCSS,
        exportToSCSS,
        exportToTailwind,
        exportToJSON,
        downloadFile,
        exportAndDownload,
        copyToClipboard,
    };
}
