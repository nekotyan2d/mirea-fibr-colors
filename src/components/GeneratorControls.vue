<template>
    <div class="generator-controls">
        <div class="controls-row">
            <button
                class="button"
                @click="$emit('generate')"
                title="Или нажмите Space">
                <Icon icon="mingcute:random-fill" />
                Случайная палитра
            </button>

            <div class="format-toggle">
                <button
                    class="button"
                    @click="$emit('toggleFormat')">
                    Формат: {{ format }}
                </button>
            </div>
        </div>

        <div class="controls-row">
            <label
                class="color-count-label"
                v-if="availableCounts.length > 1">
                Количество цветов:
                <select
                    :value="colorCount"
                    @change="handleCountChange"
                    class="color-count-select">
                    <option
                        v-for="count in availableCounts"
                        :key="count"
                        :value="count">
                        {{ count }}
                    </option>
                </select>
            </label>

            <label class="color-count-label">
                Тип гармонии:
                <select
                    :value="harmonyType"
                    @change="handleHarmonyChange"
                    class="color-count-select">
                    <option value="analogous">Аналогичная</option>
                    <option value="complementary">Комплементарная</option>
                    <option value="split-complementary">Раздельно-комплементарная</option>
                    <option value="triadic">Триада</option>
                    <option value="tetradic">Тетрада</option>
                    <option value="monochromatic">Монохромная</option>
                </select>
            </label>
        </div>

        <div class="controls-row advanced-controls">
            <label class="color-count-label">
                <input
                    type="checkbox"
                    :checked="useBaseColor"
                    @change="handleUseBaseColorChange"
                    class="checkbox-input" />
                Базовый цвет
            </label>

            <input
                v-if="useBaseColor"
                type="color"
                :value="baseColor"
                @input="handleBaseColorChange"
                class="color-picker"
                title="Выберите базовый цвет" />

            <label class="color-count-label">
                Настроение:
                <select
                    :value="mood"
                    @change="handleMoodChange"
                    class="color-count-select">
                    <option value="random">Случайное</option>
                    <option value="calm">Спокойное (пастель)</option>
                    <option value="energetic">Энергичное (яркое)</option>
                    <option value="professional">Профессиональное</option>
                </select>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
    format: ColorFormat;
    colorCount: number;
    harmonyType: HarmonyType;
    availableCounts: number[];
    useBaseColor: boolean;
    baseColor: string;
    mood: MoodType;
}

interface Emits {
    (e: "generate"): void;
    (e: "toggleFormat"): void;
    (e: "updateCount", count: number): void;
    (e: "updateHarmonyType", type: HarmonyType): void;
    (e: "updateUseBaseColor", value: boolean): void;
    (e: "updateBaseColor", color: string): void;
    (e: "updateMood", mood: MoodType): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleCountChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit("updateCount", Number(target.value));
};

const handleHarmonyChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit("updateHarmonyType", target.value as HarmonyType);
};

const handleUseBaseColorChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit("updateUseBaseColor", target.checked);
};

const handleBaseColorChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit("updateBaseColor", target.value);
};

const handleMoodChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit("updateMood", target.value as MoodType);
};
</script>

<style scoped>
.generator-controls {
    background-color: var(--bg);
    box-shadow: 0 0 0 2px var(--border);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
}

.controls-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.color-count-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-muted);
}

.color-count-select {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
}

.color-count-select:focus {
    outline: none;
    border-color: var(--primary);
}

.format-toggle {
    margin-left: auto;
}

.advanced-controls {
    padding-top: 8px;
}

.checkbox-input {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.color-picker {
    width: 60px;
    height: 38px;
    border-radius: 6px;
    cursor: pointer;
    padding: 2px;
}

.color-picker:hover {
    border-color: #667eea;
}
</style>
