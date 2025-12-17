<template>
    <div class="library-page">
        <div class="page-intro">
            <div class="intro-content">
                <p class="intro-text">Сохранённые палитры: {{ palettesCount }}</p>
            </div>
        </div>

        <div class="container">
            <!-- Поиск и фильтры -->
            <div class="controls-section">
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Поиск по названию..."
                    class="search-input" />

                <div class="filter-controls">
                    <label class="filter-label">Сортировка:</label>
                    <select
                        v-model="sortBy"
                        class="sort-select">
                        <option value="newest">Новые первыми</option>
                        <option value="oldest">Старые первыми</option>
                        <option value="name">По названию (А-Я)</option>
                        <option value="colors">По количеству цветов</option>
                    </select>
                </div>
            </div>

            <!-- Список палитр -->
            <div
                v-if="filteredPalettes.length > 0"
                class="palettes-grid">
                <PaletteCard
                    v-for="palette in filteredPalettes"
                    :key="palette.id"
                    :palette="palette"
                    @load="handleLoad"
                    @duplicate="handleDuplicate"
                    @edit="handleEdit"
                    @delete="handleDelete" />
            </div>

            <!-- Пустое состояние -->
            <div
                v-else
                class="empty-state">
                <div class="empty-icon">🎨</div>
                <h2>{{ searchQuery ? "Ничего не найдено" : "Библиотека пуста" }}</h2>
                <p>
                    {{
                        searchQuery
                            ? "Попробуйте изменить поисковый запрос"
                            : "Создайте палитру в генераторе и сохраните её"
                    }}
                </p>
                <button
                    v-if="!searchQuery"
                    class="btn-primary"
                    @click="$router.push('/')">
                    Создать палитру
                </button>
            </div>
        </div>

        <!-- Модальное окно редактирования -->
        <Teleport to="body">
            <Modal
                title="Редактировать палитру"
                v-if="editingPalette"
                @close="closeEdit">
                <input
                    v-model="editName"
                    type="text"
                    placeholder="Название палитры"
                    class="edit-input" />
                <div class="modal-actions">
                    <button
                        class="button-secondary"
                        @click="closeEdit">
                        Отмена
                    </button>
                    <button
                        class="button"
                        @click="saveEdit">
                        Сохранить
                    </button>
                </div>
            </Modal>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { usePaletteStore } from "../stores/palettes";
import PaletteCard from "../components/PaletteCard.vue";
import Modal from "../components/Modal.vue";

const router = useRouter();
const paletteStore = usePaletteStore();

const searchQuery = ref("");
const sortBy = ref<"newest" | "oldest" | "name" | "colors">("newest");
const editingPalette = ref<string | null>(null);
const editName = ref("");

const palettesCount = computed(() => paletteStore.palettesCount);

const filteredPalettes = computed(() => {
    let palettes = paletteStore.searchPalettes(searchQuery.value);

    // Сортировка
    switch (sortBy.value) {
        case "newest":
            palettes = [...palettes].sort((a, b) => b.createdAt - a.createdAt);
            break;
        case "oldest":
            palettes = [...palettes].sort((a, b) => a.createdAt - b.createdAt);
            break;
        case "name":
            palettes = [...palettes].sort((a, b) => (a.name || "").localeCompare(b.name || "", "ru"));
            break;
        case "colors":
            palettes = [...palettes].sort((a, b) => b.colors.length - a.colors.length);
            break;
    }

    return palettes;
});

const handleLoad = (palette: Palette) => {
    // Загружаем палитру в генератор
    localStorage.setItem("color-palette", JSON.stringify(palette.colors));
    router.push("/");
};

const handleDuplicate = (id: string) => {
    paletteStore.duplicatePalette(id);
};

const handleEdit = (id: string) => {
    const palette = paletteStore.getPaletteById(id);
    if (palette) {
        editingPalette.value = id;
        editName.value = palette.name || "";
    }
};

const handleDelete = (id: string) => {
    if (confirm("Удалить эту палитру?")) {
        paletteStore.removePalette(id);
    }
};

const closeEdit = () => {
    editingPalette.value = null;
    editName.value = "";
};

const saveEdit = () => {
    if (editingPalette.value && editName.value.trim()) {
        paletteStore.updatePalette(editingPalette.value, {
            name: editName.value.trim(),
        });
        closeEdit();
    }
};
</script>

<style scoped>
.library-page {
    min-height: 100vh;
    padding: 20px;
}

.page-intro {
    margin-bottom: 24px;
}

.intro-content {
    max-width: 1200px;
    margin: 0 auto;
}

.intro-text {
    font-size: 18px;
    color: var(--text);
    margin: 0;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.controls-section {
    margin-bottom: 32px;
    background: var(--bg-light);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: center;
}

.search-input {
    flex: 1;
    min-width: 200px;
    padding: 12px 16px;
    font-size: 15px;
    border: 2px solid var(--border);
    border-radius: 8px;
    transition: border-color 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary);
}

.filter-controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.filter-label {
    font-weight: 500;
    color: var(--text);
    font-size: 14px;
}

.sort-select {
    padding: 10px 14px;
    font-size: 14px;
    border: 2px solid var(--border);
    border-radius: 8px;
    background: var(--bg-light);
    cursor: pointer;
    transition: border-color 0.2s;
}

.sort-select:focus {
    outline: none;
    border-color: var(--primary);
}

.sort-select:hover {
    border-color: var(--border);
}

.palettes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    background: var(--bg-light);
    border-radius: 12px;
}

.empty-icon {
    font-size: 80px;
    margin-bottom: 24px;
}

.empty-state h2 {
    font-size: 32px;
    color: var(--text);
    margin: 0 0 16px 0;
}

.empty-state p {
    font-size: 18px;
    color: var(--text-secondary);
    margin: 0 0 32px 0;
}

.edit-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid var(--border);
    border-radius: 8px;
    margin-bottom: 24px;
}

.edit-input:focus {
    outline: none;
    border-color: var(--primary);
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

@media (max-width: 768px) {
    .page-header h1 {
        font-size: 32px;
    }

    .palettes-grid {
        grid-template-columns: 1fr;
    }
}
</style>
