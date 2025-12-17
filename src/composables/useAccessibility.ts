import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";

extend([a11yPlugin]);

export interface ContrastResult {
    ratio: number;
    AA: boolean;
    AALarge: boolean;
    AAA: boolean;
    AAALarge: boolean;
    level: "AAA" | "AA" | "AA Large" | "Fail";
}

export function useAccessibility() {
    /**
     * Вычисляет контрастность между двумя цветами
     * @param color1 - первый цвет (HEX)
     * @param color2 - второй цвет (HEX)
     * @returns результат проверки контрастности
     */
    const checkContrast = (color1: string, color2: string): ContrastResult => {
        const c1 = colord(color1);
        const c2 = colord(color2);

        const ratio = c1.contrast(c2);

        // WCAG стандарты:
        // AA: 4.5:1 для обычного текста, 3:1 для крупного
        // AAA: 7:1 для обычного текста, 4.5:1 для крупного
        const AA = ratio >= 4.5;
        const AALarge = ratio >= 3;
        const AAA = ratio >= 7;
        const AAALarge = ratio >= 4.5;

        let level: "AAA" | "AA" | "AA Large" | "Fail";
        if (AAA) {
            level = "AAA";
        } else if (AA) {
            level = "AA";
        } else if (AALarge) {
            level = "AA Large";
        } else {
            level = "Fail";
        }

        return {
            ratio: Math.round(ratio * 100) / 100,
            AA,
            AALarge,
            AAA,
            AAALarge,
            level,
        };
    };

    /**
     * Проверяет все комбинации цветов в палитре
     * @param colors - массив цветов
     * @returns массив результатов проверки
     */
    const checkPaletteContrast = (colors: Color[]) => {
        const results: Array<{
            color1: Color;
            color2: Color;
            contrast: ContrastResult;
        }> = [];

        for (let i = 0; i < colors.length; i++) {
            for (let j = i + 1; j < colors.length; j++) {
                const c1 = colors[i];
                const c2 = colors[j];
                if (!c1 || !c2) continue;

                const contrast = checkContrast(c1.hex, c2.hex);
                results.push({
                    color1: c1,
                    color2: c2,
                    contrast,
                });
            }
        }

        // Сортируем по уровню контраста (от лучшего к худшему)
        return results.sort((a, b) => b.contrast.ratio - a.contrast.ratio);
    };

    /**
     * Находит лучшую пару цветов для текста и фона
     * @param colors - массив цветов
     * @returns лучшая пара или null
     */
    const findBestTextColorPair = (colors: Color[]) => {
        const results = checkPaletteContrast(colors);

        // Ищем первую пару с AA уровнем или выше
        const bestPair = results.find((r) => r.contrast.AA);

        return bestPair || results[0] || null;
    };

    /**
     * Рекомендует акцентные цвета на основе палитры
     * @param colors - массив цветов
     * @param baseColor - базовый цвет (обычно фон)
     * @returns отсортированный массив цветов по контрастности
     */
    const suggestAccentColors = (colors: Color[], baseColor: string) => {
        return colors
            .map((color) => ({
                color,
                contrast: checkContrast(color.hex, baseColor),
            }))
            .sort((a, b) => b.contrast.ratio - a.contrast.ratio);
    };

    /**
     * Проверяет, подходит ли цвет текста для данного фона
     * @param textColor - цвет текста
     * @param backgroundColor - цвет фона
     * @param level - требуемый уровень ('AA' или 'AAA')
     * @returns true если контраст достаточен
     */
    const isReadable = (textColor: string, backgroundColor: string, level: "AA" | "AAA" = "AA"): boolean => {
        const result = checkContrast(textColor, backgroundColor);
        return level === "AAA" ? result.AAA : result.AA;
    };

    return {
        checkContrast,
        checkPaletteContrast,
        findBestTextColorPair,
        suggestAccentColors,
        isReadable,
    };
}
