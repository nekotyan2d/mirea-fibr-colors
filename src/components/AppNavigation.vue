<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
    <nav class="app-navigation">
        <div class="nav-container">
            <div class="nav-brand">
                <span class="logo"><Icon icon="mdi:palette" /></span>
                <h1>Color Palette</h1>
            </div>

            <div class="nav-links">
                <router-link
                    to="/"
                    class="nav-link"
                    :class="{ active: route.path === '/' }">
                    Генератор
                </router-link>
                <router-link
                    to="/library"
                    class="nav-link"
                    :class="{ active: route.path === '/library' }">
                    Библиотека
                </router-link>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.app-navigation {
    background: var(--bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo {
    font-size: 32px;
    display: flex;
    align-items: center;
}

.nav-brand h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-links {
    display: flex;
    gap: 8px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    text-decoration: none;
    font-weight: 500;
    font-size: 15px;
    transition: all 0.2s;
    border: 2px solid transparent;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.nav-link.active {
    background-color: var(--primary);
    color: black;
    font-weight: 600;
}

.icon {
    font-size: 18px;
}

@media (max-width: 640px) {
    .nav-container {
        flex-direction: column;
        gap: 16px;
    }

    .nav-brand h1 {
        font-size: 20px;
    }

    .nav-links {
        width: 100%;
        justify-content: center;
    }

    .nav-link {
        flex: 1;
        justify-content: center;
    }
}
</style>
