import { colord, extend } from "colord";
import harmoniesPlugin from "colord/plugins/harmonies";

extend([harmoniesPlugin]);

export function useColorGenerator() {
    const generateRandomColor = (mood?: MoodType): string => {
        let s, l;

        switch (mood) {
            case "calm":
                // Пастельные цвета - низкая насыщенность, высокая яркость
                s = 25 + Math.random() * 35; // 25-60%
                l = 65 + Math.random() * 20; // 65-85%
                break;
            case "energetic":
                // Яркие, насыщенные цвета
                s = 70 + Math.random() * 30; // 70-100%
                l = 45 + Math.random() * 20; // 45-65%
                break;
            case "professional":
                // Приглушенные, сдержанные цвета
                s = 20 + Math.random() * 40; // 20-60%
                l = 35 + Math.random() * 30; // 35-65%
                break;
            default:
                // Случайные
                s = 50 + Math.random() * 50; // 50-100%
                l = 40 + Math.random() * 40; // 40-80%
        }

        return colord({
            h: Math.random() * 360,
            s,
            l,
        }).toHex();
    };

    const generateMonochromaticPalette = (count: number, baseColorHex?: string, mood?: MoodType): Color[] => {
        const baseColor = baseColorHex ? colord(baseColorHex) : colord(generateRandomColor(mood));
        const colors: Color[] = [];
        const hsl = baseColor.toHsl();

        for (let i = 0; i < count; i++) {
            const lightness = 20 + (i / Math.max(count - 1, 1)) * 60; // от 20% до 80%
            const color = colord({ h: hsl.h, s: hsl.s, l: lightness });
            colors.push({
                id: `color-${Date.now()}-${i}`,
                hex: color.toHex(),
                rgb: color.toRgb(),
                locked: false,
            });
        }
        return colors;
    };

    const generateHarmoniousPalette = (
        count: number,
        harmonyType: HarmonyType = "analogous",
        baseColorHex?: string,
        mood?: MoodType
    ): Color[] => {
        if (harmonyType === "monochromatic") {
            return generateMonochromaticPalette(count, baseColorHex, mood);
        }

        const baseColor = baseColorHex ? colord(baseColorHex) : colord(generateRandomColor(mood));
        let harmonies: ReturnType<typeof baseColor.harmonies>;

        switch (harmonyType) {
            case "complementary":
                harmonies = baseColor.harmonies("double-split-complementary");
                // Берем только базовый и комплементарный
                harmonies = [baseColor, ...harmonies.slice(0, 1)];
                break;
            case "split-complementary":
                harmonies = baseColor.harmonies("split-complementary");
                break;
            case "triadic":
                harmonies = baseColor.harmonies("triadic");
                break;
            case "tetradic":
                harmonies = baseColor.harmonies("tetradic");
                break;
            case "analogous":
            default:
                harmonies = baseColor.harmonies("analogous");
                break;
        }

        // Применяем настроение к каждому цвету
        const result: Color[] = [];
        for (let i = 0; i < count; i++) {
            const sourceColor = harmonies[i % harmonies.length];
            if (!sourceColor) continue;

            let finalColor = i >= harmonies.length ? sourceColor.lighten((i - harmonies.length) * 0.05) : sourceColor;

            // Применяем настроение к насыщенности и яркости
            if (mood && mood !== "random") {
                const hsl = finalColor.toHsl();
                let s = hsl.s;
                let l = hsl.l;

                switch (mood) {
                    case "calm":
                        // Уменьшаем насыщенность, увеличиваем яркость
                        s = Math.min(60, s * 0.7);
                        l = Math.max(65, Math.min(85, l * 1.2));
                        break;
                    case "energetic":
                        // Увеличиваем насыщенность
                        s = Math.max(70, Math.min(100, s * 1.3));
                        l = Math.max(45, Math.min(65, l));
                        break;
                    case "professional":
                        // Приглушаем насыщенность
                        s = Math.min(60, s * 0.8);
                        l = Math.max(35, Math.min(65, l * 0.9));
                        break;
                }

                finalColor = colord({ h: hsl.h, s, l });
            }

            result.push({
                id: `color-${Date.now()}-${i}`,
                hex: finalColor.toHex(),
                rgb: finalColor.toRgb(),
                locked: false,
            });
        }

        return result.slice(0, count);
    };

    const generatePalette = (options: ColorGeneratorOptions): Color[] => {
        const { count, lockedColors = [], harmonyType = "analogous", baseColor, mood } = options;
        const lockedCount = lockedColors.length;
        const newColorsCount = count - lockedCount;

        if (newColorsCount <= 0) return lockedColors;

        const newColors = generateHarmoniousPalette(newColorsCount, harmonyType, baseColor, mood);

        // Объединяем закреплённые и новые цвета
        const result: Color[] = [];
        let lockedIndex = 0;
        let newIndex = 0;

        for (let i = 0; i < count; i++) {
            const lockedColor = lockedColors.find((c) => lockedColors.indexOf(c) === lockedIndex && c.locked);

            if (lockedColor && lockedIndex < lockedCount) {
                result.push(lockedColor);
                lockedIndex++;
            } else if (newIndex < newColors.length) {
                result.push(newColors[newIndex] ?? { id: "", hex: "", rgb: { r: 0, g: 0, b: 0 }, locked: false });
                newIndex++;
            }
        }

        return result;
    };

    const getHarmonyColorCount = (harmonyType: HarmonyType): { min: number; max: number; recommended: number } => {
        switch (harmonyType) {
            case "complementary":
                return { min: 2, max: 2, recommended: 2 };
            case "split-complementary":
                return { min: 3, max: 3, recommended: 3 };
            case "triadic":
                return { min: 3, max: 3, recommended: 3 };
            case "tetradic":
                return { min: 4, max: 4, recommended: 4 };
            case "analogous":
                return { min: 3, max: 7, recommended: 5 };
            case "monochromatic":
                return { min: 3, max: 7, recommended: 5 };
            default:
                return { min: 3, max: 7, recommended: 5 };
        }
    };

    return {
        generateRandomColor,
        generateHarmoniousPalette,
        generateMonochromaticPalette,
        generatePalette,
        getHarmonyColorCount,
    };
}
