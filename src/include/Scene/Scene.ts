import { AiNode } from "./AiNode";

interface Asset {
    root: AiNode;
    animations?: Animation[];
}

export interface Scene {
    assets: Asset[];
    buffers: ArrayBuffer[];
    isLoaded: false;
}

export const checkLoaded = (scene: Scene): boolean => {
    return scene.isLoaded;
}