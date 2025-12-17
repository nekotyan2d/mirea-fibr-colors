<template>
    <div class="color-wheel-container">
        <div class="wheel-header">
            <h3>Цветовой круг</h3>
            <p class="subtitle">Визуализация палитры</p>
        </div>

        <div class="wheel-wrapper">
            <canvas
                ref="canvasRef"
                :width="size"
                :height="size"
                class="color-wheel"></canvas>
            <svg
                :width="size"
                :height="size"
                class="markers-layer">
                <g :transform="`translate(${center}, ${center})`">
                    <!-- Маркеры цветов из палитры -->
                    <g
                        v-for="(color, index) in colors"
                        :key="`marker-${color.id}`">
                        <circle
                            :cx="getColorX(color.hex)"
                            :cy="getColorY(color.hex)"
                            :r="markerRadius"
                            :fill="color.hex"
                            :stroke="color.locked ? '#FFD700' : '#fff'"
                            :stroke-width="color.locked ? 3 : 2"
                            class="color-marker"
                            @click.stop="$emit('colorClick', color)" />
                        <text
                            :x="getColorX(color.hex)"
                            :y="getColorY(color.hex)"
                            text-anchor="middle"
                            dominant-baseline="central"
                            class="color-index"
                            :fill="getTextColor(color.hex)">
                            {{ index + 1 }}
                        </text>
                    </g>
                </g>
            </svg>
        </div>

        <div class="wheel-legend">
            <div class="legend-item">
                <div class="legend-dot normal"></div>
                <span>Обычный цвет</span>
            </div>
            <div class="legend-item">
                <div class="legend-dot locked"></div>
                <span>Закреплённый</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { colord } from "colord";

interface Props {
    colors: Color[];
    size?: number;
}

interface Emits {
    (e: "colorClick", color: Color): void;
}

const props = withDefaults(defineProps<Props>(), {
    size: 300,
});

const emit = defineEmits<Emits>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const center = computed(() => props.size / 2);
const radius = computed(() => props.size / 2 - 30);
const markerRadius = computed(() => 12);

const drawColorWheel = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    const centerX = center.value;
    const centerY = center.value;
    const outerRadius = radius.value;
    const innerRadius = outerRadius * 0.3;

    // Очищаем canvas
    ctx.clearRect(0, 0, props.size, props.size);

    // Рисуем цветовой круг попиксельно для плавности
    const imageData = ctx.createImageData(props.size, props.size);
    const data = imageData.data;

    for (let y = 0; y < props.size; y++) {
        for (let x = 0; x < props.size; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Проверяем, попадает ли точка в кольцо
            if (distance >= innerRadius && distance <= outerRadius) {
                // Вычисляем угол (hue)
                let angle = Math.atan2(dy, dx);
                const hue = ((angle * 180) / Math.PI + 90 + 360) % 360;

                // Вычисляем насыщенность на основе расстояния от внутреннего радиуса
                const saturation = ((distance - innerRadius) / (outerRadius - innerRadius)) * 100;

                // Преобразуем HSL в RGB
                const color = colord({ h: hue, s: saturation, l: 50 });
                const rgb = color.toRgb();

                const index = (y * props.size + x) * 4;
                data[index] = rgb.r;
                data[index + 1] = rgb.g;
                data[index + 2] = rgb.b;
                data[index + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Рисуем центральный белый круг с границей
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Рисуем внешнюю границу
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 2;
    ctx.stroke();
};

const getColorX = (hex: string): number => {
    const hsl = colord(hex).toHsl();
    const angle = ((hsl.h - 90) * Math.PI) / 180; // -90 для начала с верха
    const outerRadius = radius.value;
    const innerRadius = outerRadius * 0.3;
    const distance = innerRadius + (hsl.s / 100) * (outerRadius - innerRadius);
    return Math.cos(angle) * distance;
};

const getColorY = (hex: string): number => {
    const hsl = colord(hex).toHsl();
    const angle = ((hsl.h - 90) * Math.PI) / 180; // -90 для начала с верха
    const outerRadius = radius.value;
    const innerRadius = outerRadius * 0.3;
    const distance = innerRadius + (hsl.s / 100) * (outerRadius - innerRadius);
    return Math.sin(angle) * distance;
};

const getTextColor = (hex: string): string => {
    return colord(hex).isDark() ? "#ffffff" : "#000000";
};

onMounted(() => {
    drawColorWheel();
});

watch(
    () => props.size,
    () => {
        drawColorWheel();
    }
);
</script>

<style scoped>
.color-wheel-container {
    background: var(--bg);
    box-shadow: 0 0 0 2px var(--color-border);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.wheel-header {
    text-align: center;
    margin-bottom: 24px;
    width: 100%;
}

.wheel-wrapper {
    position: relative;
    display: inline-block;
}

.color-wheel {
    display: block;
    border-radius: 50%;
}

.markers-layer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
}

.markers-layer g {
    pointer-events: all;
}

.wheel-header h3 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
}

.subtitle {
    margin: 0;
    color: var(--text-muted);
    font-size: 14px;
}

.color-wheel {
    cursor: crosshair;
}

.color-marker {
    cursor: pointer;
    transition: all 0.2s;
}

.color-marker:hover {
    r: 14;
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));
}

.color-index {
    font-size: 12px;
    font-weight: 700;
    pointer-events: none;
}

.wheel-legend {
    display: flex;
    gap: 24px;
    margin-top: 16px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-muted);
}

.legend-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
}

.legend-dot.normal {
    background: var(--primary);
    border: 2px solid var(--text);
    box-shadow: 0 0 0 2px var(--primary);
}

.legend-dot.locked {
    background: #ed8936;
    border: 3px solid #ffd700;
}

@media (max-width: 768px) {
    .color-wheel-container {
        padding: 16px;
    }

    .wheel-legend {
        flex-direction: column;
        gap: 12px;
    }
}
</style>
