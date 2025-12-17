declare global {
    export interface Color {
        id: string;
        hex: string;
        rgb: { r: number; g: number; b: number };
        locked: boolean;
    }

    export interface Palette {
        id: string;
        name?: string;
        colors: Color[];
        createdAt: number;
    }

    export type ColorFormat = "hex" | "rgb";

    export type HarmonyType =
        | "analogous"
        | "complementary"
        | "split-complementary"
        | "triadic"
        | "tetradic"
        | "monochromatic";

    export type MoodType = "calm" | "energetic" | "professional" | "random";

    export interface ColorGeneratorOptions {
        count: number;
        lockedColors?: Color[];
        harmonyType?: HarmonyType;
        baseColor?: string;
        mood?: MoodType;
    }
}
