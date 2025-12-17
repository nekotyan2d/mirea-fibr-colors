<template>
    <div
        class="modal-backdrop"
        @click.self="$emit('close')">
        <div class="modal-content">
            <header>
                <div class="modal-title">{{ props.title }}</div>
                <button @click="$emit('close')"><Icon icon="material-symbols:close" /></button>
            </header>
            <slot />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { Icon } from "@iconify/vue";

defineEmits(["close"]);
const props = defineProps<{
    title: string;
}>();
</script>
<style scoped>
.modal-backdrop {
    position: fixed;

    background: rgba(0, 0, 0, 0.7);
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background-color: var(--bg);
    box-shadow: 0 0 0 2px var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    padding: 24px;
}

header {
    display: flex;
    align-items: center;
}

.modal-title {
    flex: 1;
    font-size: 20px;
    font-weight: 600;
}
</style>
