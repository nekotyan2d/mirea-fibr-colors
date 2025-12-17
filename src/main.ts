import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import indexPage from "./pages/index.vue";

const pinia = createPinia();

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: indexPage,
        },
        {
            path: "/library",
            component: () => import("./pages/library.vue"),
        },
    ],
});

createApp(App).use(pinia).use(router).mount("#app");
