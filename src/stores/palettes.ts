import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const usePaletteStore = defineStore("palettes", () => {
    const savedPalettes = ref<Palette[]>([]);
    const currentPalette = ref<Palette | null>(null);

    // Загрузка палитр из localStorage
    const loadPalettes = () => {
        const stored = localStorage.getItem("saved-palettes");
        if (stored) {
            try {
                savedPalettes.value = JSON.parse(stored);
            } catch (e) {
                console.error("Ошибка загрузки палитр:", e);
            }
        }
    };

    // Сохранение палитр в localStorage
    const savePalettes = () => {
        localStorage.setItem("saved-palettes", JSON.stringify(savedPalettes.value));
    };

    // Добавить новую палитру
    const addPalette = (colors: Color[], name?: string) => {
        const palette: Palette = {
            id: `palette-${Date.now()}`,
            name: name || `Палитра ${savedPalettes.value.length + 1}`,
            colors: colors.map((c) => ({ ...c, locked: false })),
            createdAt: Date.now(),
        };

        savedPalettes.value.unshift(palette);
        savePalettes();
        return palette;
    };

    // Удалить палитру
    const removePalette = (id: string) => {
        const index = savedPalettes.value.findIndex((p) => p.id === id);
        if (index !== -1) {
            savedPalettes.value.splice(index, 1);
            savePalettes();
        }
    };

    // Обновить палитру
    const updatePalette = (id: string, updates: Partial<Palette>) => {
        const palette = savedPalettes.value.find((p) => p.id === id);
        if (palette) {
            Object.assign(palette, updates);
            savePalettes();
        }
    };

    // Найти палитру по ID
    const getPaletteById = (id: string) => {
        return savedPalettes.value.find((p) => p.id === id);
    };

    // Поиск палитр по названию
    const searchPalettes = (query: string) => {
        if (!query) return savedPalettes.value;
        const lowerQuery = query.toLowerCase();
        return savedPalettes.value.filter((p) => p.name?.toLowerCase().includes(lowerQuery));
    };

    // Дублировать палитру
    const duplicatePalette = (id: string) => {
        const palette = getPaletteById(id);
        if (palette) {
            const duplicate: Palette = {
                ...palette,
                id: `palette-${Date.now()}`,
                name: `${palette.name} (копия)`,
                createdAt: Date.now(),
            };
            savedPalettes.value.unshift(duplicate);
            savePalettes();
            return duplicate;
        }
    };

    // Computed
    const palettesCount = computed(() => savedPalettes.value.length);

    // Инициализация
    loadPalettes();

    return {
        savedPalettes,
        currentPalette,
        palettesCount,
        addPalette,
        removePalette,
        updatePalette,
        getPaletteById,
        searchPalettes,
        duplicatePalette,
        loadPalettes,
    };
});
