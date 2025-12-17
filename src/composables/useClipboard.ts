import { ref } from "vue";
import { useClipboard as useVueUseClipboard } from "@vueuse/core";

export function useClipboard() {
    const { copy, copied, isSupported } = useVueUseClipboard();
    const notification = ref<string>("");
    const showNotification = ref(false);

    const copyToClipboard = async (text: string) => {
        if (!isSupported.value) {
            notification.value = "Копирование не поддерживается";
            showNotification.value = true;
            setTimeout(() => {
                showNotification.value = false;
            }, 2000);
            return;
        }

        await copy(text);
        notification.value = `Скопировано: ${text}`;
        showNotification.value = true;

        setTimeout(() => {
            showNotification.value = false;
        }, 2000);
    };

    return {
        copyToClipboard,
        copied,
        notification,
        showNotification,
        isSupported,
    };
}
