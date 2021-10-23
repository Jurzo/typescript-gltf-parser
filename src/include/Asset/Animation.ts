export interface Sampler {
    output: ArrayBuffer;
    interpolation: string; //"LINEAR" | "STEP" | "CUBICSPLINE"
}

export interface AnimChannel {
    target: number;
    sampler: number;
    property: string; // "translation" | "rotation" | "scale"
}

export interface Animation {
    channels: AnimChannel[];
    input: number[];
    samplers: Sampler[];
    min: number;
    max: number;
}