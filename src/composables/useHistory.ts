import { ref, computed } from "vue";

interface HistoryState {
    colors: Color[];
    timestamp: number;
}

const MAX_HISTORY_SIZE = 50;

export function useHistory() {
    const history = ref<HistoryState[]>([]);
    const currentIndex = ref(-1);

    const canUndo = computed(() => currentIndex.value > 0);
    const canRedo = computed(() => currentIndex.value < history.value.length - 1);

    /**
     * Добавить состояние в историю
     */
    const pushState = (colors: Color[]) => {
        // Создаём глубокую копию цветов
        const colorsCopy = colors.map((color) => ({
            ...color,
            rgb: { ...color.rgb },
        }));

        const newState: HistoryState = {
            colors: colorsCopy,
            timestamp: Date.now(),
        };

        // Если мы не в конце истории, удаляем всё после текущей позиции
        if (currentIndex.value < history.value.length - 1) {
            history.value = history.value.slice(0, currentIndex.value + 1);
        }

        // Добавляем новое состояние
        history.value.push(newState);
        currentIndex.value = history.value.length - 1;

        // Ограничиваем размер истории
        if (history.value.length > MAX_HISTORY_SIZE) {
            history.value.shift();
            currentIndex.value--;
        }
    };

    /**
     * Отменить последнее действие
     */
    const undo = (): Color[] | null => {
        if (!canUndo.value) return null;

        currentIndex.value--;
        const state = history.value[currentIndex.value];

        if (!state) return null;

        // Возвращаем копию состояния
        return state.colors.map((color) => ({
            ...color,
            rgb: { ...color.rgb },
        }));
    };

    /**
     * Повторить отменённое действие
     */
    const redo = (): Color[] | null => {
        if (!canRedo.value) return null;

        currentIndex.value++;
        const state = history.value[currentIndex.value];

        if (!state) return null;

        // Возвращаем копию состояния
        return state.colors.map((color) => ({
            ...color,
            rgb: { ...color.rgb },
        }));
    };

    /**
     * Очистить историю
     */
    const clear = () => {
        history.value = [];
        currentIndex.value = -1;
    };

    /**
     * Получить размер истории
     */
    const size = computed(() => history.value.length);

    return {
        canUndo,
        canRedo,
        pushState,
        undo,
        redo,
        clear,
        size,
    };
}
