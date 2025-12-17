<script setup lang="ts">
import { ref } from "vue";
import { useImport } from "../composables/useImport";
import Modal from "./Modal.vue";

const emit = defineEmits<{
    close: [];
    import: [colors: Color[]];
}>();

const { importAuto } = useImport();

const importText = ref("");
const error = ref("");
const loading = ref(false);

const handleImport = () => {
    if (!importText.value.trim()) {
        error.value = "Введите данные для импорта";
        return;
    }

    loading.value = true;
    error.value = "";

    setTimeout(() => {
        const result = importAuto(importText.value);
        loading.value = false;

        if (result.success && result.colors) {
            emit("import", result.colors);
            emit("close");
        } else {
            error.value = result.error || "Ошибка импорта";
        }
    }, 100);
};

const examples = [
    {
        title: "JSON",
        code: `["#667eea", "#764ba2", "#f093fb"]`,
    },
    {
        title: "CSS переменные",
        code: `:root {
  --primary: #667eea;
  --secondary: #764ba2;
}`,
    },
    {
        title: "URL",
        code: `https://example.com?colors=667eea,764ba2,f093fb`,
    },
];

const loadExample = (code: string) => {
    importText.value = code;
    error.value = "";
};
</script>

<template>
    <Modal
        title="Импорт палитр"
        @close="emit('close')">
        <p class="description">Вставьте JSON, CSS переменные или URL с параметром colors</p>

        <textarea
            v-model="importText"
            class="import-textarea"
            placeholder="Вставьте данные для импорта..."
            rows="8"></textarea>

        <div
            v-if="error"
            class="error-message">
            ⚠️ {{ error }}
        </div>

        <div class="examples">
            <p class="examples-title">Примеры форматов:</p>
            <div class="examples-grid">
                <button
                    v-for="example in examples"
                    :key="example.title"
                    class="example-button"
                    @click="loadExample(example.code)">
                    <span class="example-title">{{ example.title }}</span>
                    <pre class="example-code">{{ example.code }}</pre>
                </button>
            </div>
        </div>

        <div class="action-buttons">
            <button
                @click="emit('close')"
                class="btn-cancel button">
                Отмена
            </button>
            <button
                @click="handleImport"
                class="btn-import button"
                :disabled="loading">
                {{ loading ? "Импорт..." : "Импортировать" }}
            </button>
        </div>
    </Modal>
</template>

<style scoped>
.description {
    margin: 0 0 16px 0;
    color: var(--text-muted);
    font-size: 14px;
}

.import-textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: monospace;
    background-color: var(--bg-light);
    border: 2px solid var(--border);
    font-size: 13px;
    line-height: 1.6;
    resize: vertical;
    transition: border-color 0.2s;
}

.error-message {
    margin-top: 12px;
    padding: 12px 16px;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 14px;
}

.examples {
    margin: 24px 0;
}

.examples-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-muted);
    margin: 0 0 12px 0;
}

.examples-grid {
    display: grid;
    gap: 12px;
}

.example-button {
    background: var(--bg-light);
    border-radius: 8px;
    padding: 12px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
}

.example-button:hover {
    background: var(--bg);
    border-color: var(--border);
}

.example-title {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 8px;
}

.example-code {
    margin: 0;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-muted);
    white-space: pre-wrap;
    word-break: break-all;
}

.action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.btn-cancel,
.btn-import {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancel {
    background: #f3f4f6;
    color: #374151;
}

.btn-import:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
