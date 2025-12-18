<template>
    <div class="color-card">
        <div
            class="color-preview"
            :style="{ backgroundColor: color.hex }"
            @click="handleClick">
            <button
                class="lock-button"
                :class="{ locked: color.locked }"
                @click.stop="toggleLock">
                {{ color.locked ? "🔒" : "🔓" }}
            </button>
        </div>
        <div class="color-info">
            <span class="color-value">{{ displayValue }}</span>
            <button
                class="copy-button"
                @click="handleClick">
                📋
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useColorFormat } from "../composables/useColorFormat";

interface Props {
    color: Color;
}

interface Emits {
    (e: "copy", value: string): void;
    (e: "toggleLock", id: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatColor } = useColorFormat();

const displayValue = computed(() => formatColor(props.color));

const handleClick = () => {
    emit("copy", displayValue.value);
};

const toggleLock = () => {
    emit("toggleLock", props.color.id);
};
</script>

<style scoped>
.color-card {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 120px;
}

.color-preview {
    position: relative;
    flex: 1;
    min-height: 200px;
    cursor: pointer;
    transition: transform 0.2s;
}

.color-preview:hover {
    transform: scale(1.02);
}

.lock-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--bg-light);
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
    opacity: 0;
}

.color-preview:hover .lock-button {
    opacity: 1;
}

.lock-button.locked {
    opacity: 1;
    background: var(--bg-light);
}

.color-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: var(--bg-light);
    gap: 8px;
}

.color-value {
    font-size: 14px;
    font-weight: 600;
}

.copy-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    transition: transform 0.2s;
}

.copy-button:hover {
    transform: scale(1.2);
}
</style>
