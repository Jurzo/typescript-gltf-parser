import { v3, v4 } from "./Math";

export const interpolateValue = (last: number, next: number, current: number): number => {
    return (current - last) / (next - last);
}

export const lerp = (previousPoint: number[], nextPoint: number[], t: number): number[] => {
    const newPoint: number[] = [];
    for (let i = 0; i < previousPoint.length; i++) {
        newPoint.push(previousPoint[i] + t * (nextPoint[i] - previousPoint[i]));
    }
    return newPoint;
}

export const slerp = (previousPoint: number[], nextPoint: number[], t: number): number[] => {
    const newPoint: number[] = [];
    let next = nextPoint;
    let dotProduct: number;
    if (previousPoint.length === 3)
        dotProduct = v3.dot(previousPoint, nextPoint);
    if (previousPoint.length === 4)
        dotProduct = v4.dot(previousPoint, nextPoint);

    if (dotProduct < 0) {
        dotProduct = dotProduct * -1;
        next = nextPoint.map(x => x * -1);
    }

    if (dotProduct > 0.9995) {
        return v4.normalize(lerp(previousPoint, next, t));
    }

    const theta0 = Math.acos(dotProduct);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);
    const sinTheta0 = Math.sin(theta0);
    const cosTheta = Math.cos(theta);

    const previousScale = cosTheta - dotProduct * sinTheta / sinTheta0;
    const nextScale = sinTheta / sinTheta0;

    for (let i = 0; i < previousPoint.length; i++) {
        newPoint[i] = previousScale * previousPoint[i] + nextScale * next[i];
    }

    return newPoint;
}