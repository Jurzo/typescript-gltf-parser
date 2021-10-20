interface Sampler {
    // check min/max from accessor?
    input: number;
    output: number;
    interpolation: "LINEAR" | "STEP" | "CUBICSPLINE";
}

interface AnimChannel {
    target: number;
    property: "translation" | "rotation" | "scale";
}

export interface Animation {
    channels: AnimChannel[];
    samplers: Sampler[];
    min: number;
    max: number;
}