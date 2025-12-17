<template>
    <div class="palette-card">
        <div class="card-colors">
            <div
                v-for="color in palette.colors"
                :key="color.id"
                class="color-strip"
                :style="{ backgroundColor: color.hex }"
                :title="color.hex"></div>
        </div>

        <div class="card-content">
            <h3 class="palette-name">{{ palette.name }}</h3>
            <p class="palette-date">{{ formattedDate }}</p>

            <div class="card-actions">
                <button
                    class="btn-icon"
                    @click="$emit('load', palette)"
                    title="Загрузить">
                    <Icon icon="material-symbols:upload-file-rounded" />
                </button>
                <button
                    class="btn-icon"
                    @click="$emit('duplicate', palette.id)"
                    title="Дублировать">
                    <Icon icon="material-symbols:content-copy-rounded" />
                </button>
                <button
                    class="btn-icon"
                    @click="$emit('edit', palette.id)"
                    title="Редактировать">
                    <Icon icon="material-symbols:edit-rounded" />
                </button>
                <button
                    class="btn-icon btn-delete"
                    @click="$emit('delete', palette.id)"
                    title="Удалить">
                    <Icon icon="material-symbols:delete-rounded" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

interface Props {
    palette: Palette;
}

interface Emits {
    (e: "load", palette: Palette): void;
    (e: "duplicate", id: string): void;
    (e: "edit", id: string): void;
    (e: "delete", id: string): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const formattedDate = computed(() => {
    const date = new Date(props.palette.createdAt);
    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
});
</script>

<style scoped>
.palette-card {
    background-color: var(--bg-light);
    box-shadow: 0 0 0 2px var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.palette-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-colors {
    display: flex;
    height: 120px;
}

.color-strip {
    flex: 1;
    transition: flex 0.3s;
}

.card-colors:hover .color-strip:hover {
    flex: 1.5;
}

.card-content {
    padding: 16px;
}

.palette-name {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
}

.palette-date {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: var(--text-muted);
}

.card-actions {
    display: flex;
    gap: 8px;
}

.btn-icon {
    background: var(--bg-light);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: var(--bg-light);
    transform: scale(1.1);
}

.btn-delete:hover {
    background: var(--danger);
    border-color: var(--bg-dark);
}
</style>
