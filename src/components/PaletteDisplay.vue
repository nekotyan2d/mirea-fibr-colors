<template>
    <div class="palette-display">
        <ColorCard
            v-for="color in colors"
            :key="color.id"
            :color="color"
            @copy="handleCopy"
            @toggle-lock="handleToggleLock" />
    </div>
</template>

<script setup lang="ts">
import ColorCard from "./ColorCard.vue";

interface Props {
    colors: Color[];
}

interface Emits {
    (e: "copy", value: string): void;
    (e: "toggleLock", id: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleCopy = (value: string) => {
    emit("copy", value);
};

const handleToggleLock = (id: string) => {
    emit("toggleLock", id);
};
</script>

<style scoped>
.palette-display {
    display: flex;
    gap: 0;
    width: 100%;
    min-height: 300px;
    box-shadow: 0 0 0 2px var(--color-border);
    border-radius: 16px;
    overflow: hidden;
}
</style>
