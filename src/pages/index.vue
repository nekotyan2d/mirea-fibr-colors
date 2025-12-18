<template>
    <div class="generator-page">
        <div class="page-header">
            <div class="header-content">
                <div class="header-actions">
                    <div class="history-buttons">
                        <button
                            class="btn-history"
                            @click="handleUndo"
                            :disabled="!canUndo"
                            title="Отменить (Ctrl+Z)">
                            <Icon icon="mdi:undo-variant" />
                        </button>
                        <button
                            class="btn-history"
                            @click="handleRedo"
                            :disabled="!canRedo"
                            title="Повторить (Ctrl+Y)">
                            <Icon icon="mdi:redo-variant" />
                        </button>
                    </div>
                    <button
                        class="button"
                        @click="showImportModal = true">
                        <Icon icon="mdi:import" />
                        Импорт
                    </button>
                    <button
                        class="button"
                        @click="handleShare">
                        <Icon icon="mdi:share-outline" />
                        Поделиться
                    </button>
                    <button
                        class="button"
                        @click="showSaveDialog = true">
                        <Icon icon="material-symbols:save-outline-rounded" />
                        Сохранить
                    </button>
                    <button
                        class="button"
                        @click="showExportModal = true">
                        <Icon icon="mdi:export" />
                        Экспорт
                    </button>
                </div>
            </div>
        </div>

        <div class="container">
            <GeneratorControls
                :format="currentFormat"
                :color-count="colorCount"
                :harmony-type="harmonyType"
                :available-counts="availableColorCounts"
                :use-base-color="useBaseColor"
                :base-color="baseColor"
                :mood="mood"
                @generate="generateNewPalette"
                @toggle-format="toggleFormat"
                @update-count="updateColorCount"
                @update-harmony-type="updateHarmonyType"
                @update-use-base-color="updateUseBaseColor"
                @update-base-color="updateBaseColor"
                @update-mood="updateMood" />

            <PaletteDisplay
                :colors="currentColors"
                @copy="handleCopy"
                @toggle-lock="handleToggleLock" />

            <PreviewMockup :colors="currentColors" />

            <div class="accessibility-tools">
                <ContrastChecker :colors="currentColors" />
                <ColorWheel
                    :colors="currentColors"
                    @color-click="handleColorClick" />
            </div>

            <Transition name="notification">
                <div
                    v-if="showNotification"
                    class="notification">
                    {{ notification }}
                </div>
            </Transition>
        </div>

        <!-- Модальное окно сохранения -->
        <Teleport to="body">
            <Modal
                title="Сохранить палитру"
                v-if="showSaveDialog"
                @close="showSaveDialog = false">
                <input
                    v-model="saveName"
                    type="text"
                    placeholder="Название палитры"
                    class="save-input"
                    @keyup.enter="handleSave" />
                <div class="modal-actions">
                    <button
                        class="button-secondary"
                        @click="showSaveDialog = false">
                        Отмена
                    </button>
                    <button
                        class="button"
                        @click="handleSave">
                        Сохранить
                    </button>
                </div>
            </Modal>
        </Teleport>

        <!-- Модальное окно экспорта -->
        <Teleport to="body">
            <ExportModal
                v-if="showExportModal"
                :colors="currentColors"
                :palette-name="saveName || 'My Palette'"
                @close="showExportModal = false" />
        </Teleport>

        <!-- Модальное окно импорта -->
        <Teleport to="body">
            <ImportModal
                v-if="showImportModal"
                @close="showImportModal = false"
                @import="handleImport" />
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import PaletteDisplay from "../components/PaletteDisplay.vue";
import GeneratorControls from "../components/GeneratorControls.vue";
import PreviewMockup from "../components/PreviewMockup.vue";
import ContrastChecker from "../components/ContrastChecker.vue";
import ColorWheel from "../components/ColorWheel.vue";
import ExportModal from "../components/ExportModal.vue";
import ImportModal from "../components/ImportModal.vue";
import { useColorGenerator } from "../composables/useColorGenerator";
import { useColorFormat } from "../composables/useColorFormat";
import { useImport } from "../composables/useImport";
import { useClipboard } from "../composables/useClipboard";
import { useHistory } from "../composables/useHistory";
import { usePaletteStore } from "../stores/palettes";
import { Icon } from "@iconify/vue";
import Modal from "../components/Modal.vue";

const { generatePalette, getHarmonyColorCount } = useColorGenerator();
const { currentFormat, toggleFormat } = useColorFormat();
const { copyToClipboard, notification, showNotification } = useClipboard();
const { generateShareURL } = useImport();
const { canUndo, canRedo, pushState, undo, redo } = useHistory();
const paletteStore = usePaletteStore();

const currentColors = ref<Color[]>([]);
const colorCount = ref(5);
const harmonyType = ref<HarmonyType>("analogous");
const availableColorCounts = ref<number[]>([3, 5, 7]);
const showSaveDialog = ref(false);
const showExportModal = ref(false);
const showImportModal = ref(false);
const saveName = ref("");
const useBaseColor = ref(false);
const baseColor = ref("#667eea");
const mood = ref<MoodType>("random");

// Локальное хранилище
const STORAGE_KEY = "color-palette";
const STORAGE_COUNT_KEY = "color-count";
const STORAGE_HARMONY_KEY = "harmony-type";
const STORAGE_BASE_COLOR_KEY = "base-color";
const STORAGE_USE_BASE_COLOR_KEY = "use-base-color";
const STORAGE_MOOD_KEY = "mood";

const savePaletteToLocalStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentColors.value));
    localStorage.setItem(STORAGE_COUNT_KEY, colorCount.value.toString());
    localStorage.setItem(STORAGE_HARMONY_KEY, harmonyType.value);
    localStorage.setItem(STORAGE_BASE_COLOR_KEY, baseColor.value);
    localStorage.setItem(STORAGE_USE_BASE_COLOR_KEY, useBaseColor.value.toString());
    localStorage.setItem(STORAGE_MOOD_KEY, mood.value);
};

const loadPaletteFromLocalStorage = (): Color[] | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedCount = localStorage.getItem(STORAGE_COUNT_KEY);
    const storedHarmony = localStorage.getItem(STORAGE_HARMONY_KEY);
    const storedBaseColor = localStorage.getItem(STORAGE_BASE_COLOR_KEY);
    const storedUseBaseColor = localStorage.getItem(STORAGE_USE_BASE_COLOR_KEY);
    const storedMood = localStorage.getItem(STORAGE_MOOD_KEY);

    if (storedCount) {
        colorCount.value = parseInt(storedCount, 10);
    }

    if (storedHarmony) {
        harmonyType.value = storedHarmony as HarmonyType;
    }

    if (storedBaseColor) {
        baseColor.value = storedBaseColor;
    }

    if (storedUseBaseColor) {
        useBaseColor.value = storedUseBaseColor === "true";
    }

    if (storedMood) {
        mood.value = storedMood as MoodType;
    }

    if (stored) {
        try {
            return JSON.parse(stored) as Color[];
        } catch (e) {
            console.error("Ошибка загрузки палитры:", e);
            return null;
        }
    }
    return null;
};

const generateNewPalette = () => {
    const lockedColors = currentColors.value.filter((c) => c.locked);
    const newColors = generatePalette({
        count: colorCount.value,
        lockedColors,
        harmonyType: harmonyType.value,
        baseColor: useBaseColor.value ? baseColor.value : undefined,
        mood: mood.value !== "random" ? mood.value : undefined,
    });

    // Добавляем в историю перед изменением
    if (currentColors.value.length > 0) {
        pushState(currentColors.value);
    }

    currentColors.value = newColors;
    savePaletteToLocalStorage();
};

const handleCopy = (value: string) => {
    copyToClipboard(value);
};

const handleToggleLock = (id: string) => {
    const color = currentColors.value.find((c) => c.id === id);
    if (color) {
        color.locked = !color.locked;
        savePaletteToLocalStorage();
    }
};

const handleColorClick = (color: Color) => {
    copyToClipboard(color.hex);
};

const handleImport = (colors: Color[]) => {
    // Добавляем текущее состояние в историю
    if (currentColors.value.length > 0) {
        pushState(currentColors.value);
    }

    currentColors.value = colors;
    savePaletteToLocalStorage();
    copyToClipboard("Палитра импортирована!");
};

const handleUndo = () => {
    const previousColors = undo();
    if (previousColors) {
        currentColors.value = previousColors;
        savePaletteToLocalStorage();
    }
};

const handleRedo = () => {
    const nextColors = redo();
    if (nextColors) {
        currentColors.value = nextColors;
        savePaletteToLocalStorage();
    }
};

const handleShare = async () => {
    const shareUrl = generateShareURL(currentColors.value);
    try {
        await navigator.clipboard.writeText(shareUrl);
        copyToClipboard("Ссылка скопирована в буфер обмена!");
    } catch (err) {
        console.error("Failed to copy share URL:", err);
    }
};

const handleSave = () => {
    if (currentColors.value.length === 0) return;

    const name = saveName.value.trim() || `Палитра ${new Date().toLocaleDateString()}`;
    paletteStore.addPalette(currentColors.value, name);

    showSaveDialog.value = false;
    saveName.value = "";

    copyToClipboard("Палитра сохранена!");
};

const updateColorCount = (count: number) => {
    colorCount.value = count;
    generateNewPalette();
};

const updateUseBaseColor = (value: boolean) => {
    useBaseColor.value = value;
    if (value) {
        generateNewPalette();
    }
};

const updateBaseColor = (color: string) => {
    baseColor.value = color;
    if (useBaseColor.value) {
        generateNewPalette();
    }
};

const updateMood = (newMood: MoodType) => {
    mood.value = newMood;
    generateNewPalette();
};

const updateHarmonyType = (type: HarmonyType) => {
    harmonyType.value = type;
    const { min, max, recommended } = getHarmonyColorCount(type);

    // Обновляем доступные варианты количества цветов
    const counts: number[] = [];
    for (let i = min; i <= max; i++) {
        counts.push(i);
    }
    availableColorCounts.value = counts;

    // Подстраиваем текущее количество под рекомендованное или ближайшее допустимое
    if (colorCount.value < min || colorCount.value > max) {
        colorCount.value = recommended;
    }

    generateNewPalette();
};

// Сохранение при изменении палитры
watch(
    currentColors,
    () => {
        savePaletteToLocalStorage();
    },
    { deep: true }
);

// Загрузка при монтировании
onMounted(() => {
    // Проверяем URL параметры для импорта
    const urlParams = new URLSearchParams(window.location.search);
    const colorsParam = urlParams.get("colors");

    if (colorsParam) {
        const { importFromURL } = useImport();
        const result = importFromURL(window.location.href);

        if (result.success && result.colors) {
            currentColors.value = result.colors;
            savePaletteToLocalStorage();
            return;
        }
    }

    // Иначе загружаем сохраненную палитру
    const savedPalette = loadPaletteFromLocalStorage();
    if (savedPalette && savedPalette.length > 0) {
        currentColors.value = savedPalette;
    } else {
        generateNewPalette();
    }
});

// Горячие клавиши
onMounted(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        // Проверяем, что фокус не в input/textarea
        const target = e.target as HTMLElement;
        const isInputFocused = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

        // Space - генерация новой палитры
        if (e.code === "Space" && e.target === document.body) {
            e.preventDefault();
            generateNewPalette();
        }

        // Ctrl+Z - отменить
        if (e.ctrlKey && e.key === "z" && !isInputFocused) {
            e.preventDefault();
            handleUndo();
        }

        // Ctrl+Y или Ctrl+Shift+Z - повторить
        if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "z")) {
            if (!isInputFocused) {
                e.preventDefault();
                handleRedo();
            }
        }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
        document.removeEventListener("keydown", handleKeyPress);
    };
});
</script>

<style scoped>
.generator-page {
    min-height: 100vh;
    padding: 40px 20px;
}

.page-header {
    margin-bottom: 20px;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 20px;
}

.header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
}

.history-buttons {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px;
    border-radius: 8px;
}

.btn-history {
    background: var(--primary);
    color: var(--bg-dark);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-history:hover:not(:disabled) {
    background: var(--primary);
    color: var(--bg-dark);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.btn-history:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

/* Модальное окно */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
}

.modal-content h2 {
    margin: 0 0 24px 0;
    font-size: 24px;
    color: #2d3748;
}

.save-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 24px;
}

.save-input:focus {
    outline: none;
    border-color: #667eea;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.accessibility-tools {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.notification {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: #48bb78;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 600;
    z-index: 1000;
}

/* Анимация уведомления */
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.notification-leave-to {
    transform: translateY(20px);
    opacity: 0;
}

@media (max-width: 768px) {
    .page-header h1 {
        font-size: 32px;
    }

    .subtitle {
        font-size: 16px;
    }

    .notification {
        bottom: 20px;
        right: 20px;
        left: 20px;
    }

    .accessibility-tools {
        grid-template-columns: 1fr;
    }
}
</style>
