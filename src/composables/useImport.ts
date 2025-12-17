import { colord } from "colord";

export interface ImportResult {
    success: boolean;
    colors?: Color[];
    error?: string;
}

export function useImport() {
    /**
     * Импорт из JSON
     */
    const importFromJSON = (jsonString: string): ImportResult => {
        try {
            const data = JSON.parse(jsonString);

            // Поддержка разных форматов JSON
            let colors: any[] = [];

            if (Array.isArray(data)) {
                colors = data;
            } else if (data.colors && Array.isArray(data.colors)) {
                colors = data.colors;
            } else if (data.palette && Array.isArray(data.palette)) {
                colors = data.palette;
            } else {
                return {
                    success: false,
                    error: "Неверный формат JSON. Ожидается массив цветов или объект с полем colors/palette.",
                };
            }

            // Конвертируем в формат Color
            const importedColors: Color[] = colors.map((item, index) => {
                let hex: string;

                if (typeof item === "string") {
                    hex = item;
                } else if (item.hex) {
                    hex = item.hex;
                } else if (item.color) {
                    hex = item.color;
                } else if (item.value) {
                    hex = item.value;
                } else {
                    throw new Error(`Цвет ${index + 1}: не найдено значение цвета`);
                }

                const color = colord(hex);
                if (!color.isValid()) {
                    throw new Error(`Цвет ${index + 1}: недействительный цвет "${hex}"`);
                }

                return {
                    id: crypto.randomUUID(),
                    hex: color.toHex(),
                    rgb: color.toRgb(),
                    locked: false,
                };
            });

            if (importedColors.length === 0) {
                return {
                    success: false,
                    error: "JSON не содержит цветов",
                };
            }

            return {
                success: true,
                colors: importedColors,
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Ошибка парсинга JSON",
            };
        }
    };

    /**
     * Импорт из CSS переменных
     */
    const importFromCSS = (cssString: string): ImportResult => {
        try {
            // Находим все CSS переменные с цветами
            const colorRegex = /--[a-zA-Z0-9_-]+\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g;
            const matches = [...cssString.matchAll(colorRegex)];

            if (matches.length === 0) {
                return {
                    success: false,
                    error: "Не найдено CSS переменных с цветами",
                };
            }

            const importedColors = matches
                .map((match) => {
                    const colorValue = match[1];
                    if (!colorValue) return null;

                    const color = colord(colorValue);

                    if (!color.isValid()) {
                        return null;
                    }

                    return {
                        id: crypto.randomUUID(),
                        hex: color.toHex(),
                        rgb: color.toRgb(),
                        locked: false,
                    } as Color;
                })
                .filter((c): c is Color => c !== null);

            // Удаляем дубликаты по hex
            const uniqueColors = importedColors.filter(
                (color, index, self) => index === self.findIndex((c) => c.hex === color.hex)
            );

            if (uniqueColors.length === 0) {
                return {
                    success: false,
                    error: "Не удалось импортировать цвета из CSS",
                };
            }

            return {
                success: true,
                colors: uniqueColors,
            };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : "Ошибка парсинга CSS",
            };
        }
    };

    /**
     * Импорт из URL параметров
     */
    const importFromURL = (url: string): ImportResult => {
        try {
            const urlObj = new URL(url);
            const colorsParam = urlObj.searchParams.get("colors");

            if (!colorsParam) {
                return {
                    success: false,
                    error: "URL не содержит параметр colors",
                };
            }

            // Цвета разделены запятыми, без символа #
            const hexColors = colorsParam.split(",").map((c) => {
                const hex = c.startsWith("#") ? c : `#${c}`;
                return hex;
            });

            const validColors = hexColors
                .map((hex) => {
                    const color = colord(hex);

                    if (!color.isValid()) {
                        return null;
                    }

                    return {
                        id: crypto.randomUUID(),
                        hex: color.toHex(),
                        rgb: color.toRgb(),
                        locked: false,
                    } as Color;
                })
                .filter((c): c is Color => c !== null);

            const importedColors: Color[] = validColors;

            if (importedColors.length === 0) {
                return {
                    success: false,
                    error: "Не удалось импортировать цвета из URL",
                };
            }

            return {
                success: true,
                colors: importedColors,
            };
        } catch (err) {
            return {
                success: false,
                error: "Недействительный URL",
            };
        }
    };

    /**
     * Генерация URL для шаринга
     */
    const generateShareURL = (colors: Color[]): string => {
        const baseUrl = window.location.origin + window.location.pathname;
        const hexColors = colors.map((c) => c.hex.replace("#", "")).join(",");
        return `${baseUrl}?colors=${hexColors}`;
    };

    /**
     * Автоопределение формата и импорт
     */
    const importAuto = (input: string): ImportResult => {
        const trimmed = input.trim();

        // Проверяем, является ли это URL
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return importFromURL(trimmed);
        }

        // Проверяем, является ли это JSON
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            return importFromJSON(trimmed);
        }

        // Иначе пробуем как CSS
        return importFromCSS(trimmed);
    };

    return {
        importFromJSON,
        importFromCSS,
        importFromURL,
        importAuto,
        generateShareURL,
    };
}
