<script setup lang="ts">
import { ref, computed } from "vue";
import { useExport, type ExportFormat } from "../composables/useExport";
import Modal from "./Modal.vue";

const props = defineProps<{
    colors: Color[];
    paletteName?: string;
}>();

const emit = defineEmits<{
    close: [];
}>();

const { exportPalette, exportAndDownload, copyToClipboard } = useExport();

const selectedFormat = ref<ExportFormat>("css");
const showCopyNotification = ref(false);

const exportedCode = computed(() => {
    return exportPalette({
        format: selectedFormat.value,
        colors: props.colors,
        paletteName: props.paletteName || "My Palette",
    });
});

const formatLabels: Record<ExportFormat, string> = {
    css: "CSS Variables",
    scss: "SCSS Variables",
    tailwind: "Tailwind Config",
    json: "JSON",
};

const handleCopy = async () => {
    const success = await copyToClipboard(exportedCode.value);
    if (success) {
        showCopyNotification.value = true;
        setTimeout(() => {
            showCopyNotification.value = false;
        }, 2000);
    }
};

const handleDownload = () => {
    exportAndDownload({
        format: selectedFormat.value,
        colors: props.colors,
        paletteName: props.paletteName || "palette",
    });
};
</script>

<template>
    <Modal
        title="Экспорт палитры"
        @close="emit('close')">
        <div class="format-selector">
            <label>Формат:</label>
            <select
                v-model="selectedFormat"
                class="format-select">
                <option
                    v-for="(label, format) in formatLabels"
                    :key="format"
                    :value="format">
                    {{ label }}
                </option>
            </select>
        </div>

        <div class="code-preview">
            <pre><code>{{ exportedCode }}</code></pre>
        </div>

        <div class="action-buttons">
            <button
                @click="handleCopy"
                class="button">
                Копировать
            </button>
            <button
                @click="handleDownload"
                class="button">
                Скачать
            </button>
        </div>

        <div
            v-if="showCopyNotification"
            class="notification">
            Скопировано в буфер обмена
        </div>
    </Modal>
</template>

<style scoped>
.format-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.format-selector label {
    font-weight: 500;
    color: var(--text);
}
/* 
.format-select {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid var(--border);
    border-radius: 8px;
    font-size: 15px;
    background: var(--bg);
    cursor: pointer;
    transition: all 0.2s;
}

.format-select:hover {
    border-color: var(--border);
}

.format-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
} */

.code-preview {
    background: var(--bg-light);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    max-height: 400px;
    overflow-y: auto;
}

.code-preview pre {
    margin: 0;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 13px;
    line-height: 1.6;
}

.code-preview code {
    color: var(--text);
}

.action-buttons {
    display: flex;
    gap: 12px;
}

.copy-button,
.download-button {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.notification {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--success);
    color: var(--bg-dark);
    padding: 14px 20px;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    font-weight: 500;
    animation: slideIn 0.3s ease;
    z-index: 1001;
}

@keyframes slideIn {
    from {
        transform: translateY(100px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Scrollbar styling */
.code-preview::-webkit-scrollbar,
.modal-body::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.code-preview::-webkit-scrollbar-track {
    background: var(--bg-light);
    border-radius: 4px;
}

.code-preview::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
}

.code-preview::-webkit-scrollbar-thumb:hover {
    background: var(--border-hover);
}

.modal-body::-webkit-scrollbar-track {
    background: var(--bg-light);
    border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: var(--border-hover);
}
</style>
