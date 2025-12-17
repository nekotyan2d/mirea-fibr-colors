import { ref, computed } from "vue";
import { colord } from "colord";

// Глобальное состояние формата, разделяемое между всеми компонентами
const currentFormat = ref<ColorFormat>("hex");

export function useColorFormat() {
    const formatColor = (color: Color, format?: ColorFormat): string => {
        const fmt = format || currentFormat.value;
        const colorObj = colord(color.hex);

        switch (fmt) {
            case "rgb": {
                const { r, g, b } = colorObj.toRgb();
                return `rgb(${r}, ${g}, ${b})`;
            }
            case "hex":
            default:
                return color.hex.toUpperCase();
        }
    };

    const toggleFormat = () => {
        currentFormat.value = currentFormat.value === "hex" ? "rgb" : "hex";
    };

    const setFormat = (format: ColorFormat) => {
        currentFormat.value = format;
    };

    return {
        currentFormat: computed(() => currentFormat.value),
        formatColor,
        toggleFormat,
        setFormat,
    };
}
