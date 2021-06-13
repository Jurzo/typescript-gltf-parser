// Row major notation used for matrices
export const m4 = {
    identity: function (): number[] {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    // returns an orthographic projection matrix
    // with bounds within -1 <-> 1 and center at 0
    // and Z growing towards the front
    orthographic: function (aspectRatio: number, near: number, far: number): number[] {
        const sub = far - near;
        const sum = far + near;
        return [
            2 / aspectRatio, 0, 0, 0,
            0, 2, 0, 0,
            0, 0, 2 / (sub), 0,
            0, 0, -(sum) / (sub), 1
        ];
    },

    perspective: function(fov: number, aspectRatio: number, near: number, far: number): number[] {
        const rad = fov / 180 * Math.PI;
        const f = Math.tan(Math.PI * 0.5 - 0.5 * rad);
        const rangeInv = 1.0 / (near - far);

        return [
            f / aspectRatio, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    lookAt: function(cameraPosition: number[], target: number[], up: number[]): number[] {
        const zAxis = v3.normalize(v3.subtract(cameraPosition, target));
        const xAxis = v3.normalize(v3.cross(up, zAxis));
        const yAxis = v3.normalize(v3.cross(zAxis, xAxis));

        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0],
            cameraPosition[1],
            cameraPosition[2],
            1
        ];
    },

    translate: function(mat4: number[], tx: number, ty: number, tz: number): number[] {
        return m4.multiply(mat4, m4.translation(tx, ty, tz));
    },

    rotate: function(mat4: number[], angleDeg: number, rotAxis: number[]): number[] {
        return m4.multiply(mat4, m4.quatRotation(rotAxis, angleDeg));
    },

    scale: function(mat4: number[], sx: number, sy: number, sz: number): number[] {
        return m4.multiply(mat4, m4.scaling(sx, sy, sz));
    },

    translation: function (tx: number, ty: number, tz: number): number[] {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },

    scaling: function(sx: number, sy: number, sz: number): number[] {
        return [
            sx, 0,  0,  0,
            0, sy,  0,  0,
            0,  0, sz,  0,
            0,  0,  0,  1
        ];
    },

    quatRotation: function(axis: number[], angle: number): number[] {
        const rad = angle / 180 * Math.PI;
        const halfSin = Math.sin(rad / 2);
        const halfCos = Math.cos(rad / 2);

        const w = halfCos;
        const x = axis[0] * halfSin;
        const y = axis[1] * halfSin;
        const z = axis[2] * halfSin;

        const n = 1.0 / Math.sqrt(x*x + y*y + z*z + w*w);

        const qx = x*n;
        const qy = y*n;
        const qz = z*n;
        const qw = w*n;

        return [
            1.0 - 2.0*qy*qy - 2.0*qz*qz, 2.0*qx*qy - 2.0*qz*qw, 2.0*qx*qz + 2.0*qy*qw, 0.0,
            2.0*qx*qy + 2.0*qz*qw, 1.0 - 2.0*qx*qx - 2.0*qz*qz, 1.0*qy*qz - 2.0*qx*qw, 0.0,
            2.0*qx*qz - 2.0*qy*qw, 2.0*qy*qz + 2.0*qx*qw, 1.0 - 2.0*qx*qx - 2.0*qy*qy, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
    },

    multiply: function (mat4a: number[], mat4b: number[]): number[] {
        const b00 = mat4b[0 * 4 + 0];
        const b01 = mat4b[0 * 4 + 1];
        const b02 = mat4b[0 * 4 + 2];
        const b03 = mat4b[0 * 4 + 3];
        const b10 = mat4b[1 * 4 + 0];
        const b11 = mat4b[1 * 4 + 1];
        const b12 = mat4b[1 * 4 + 2];
        const b13 = mat4b[1 * 4 + 3];
        const b20 = mat4b[2 * 4 + 0];
        const b21 = mat4b[2 * 4 + 1];
        const b22 = mat4b[2 * 4 + 2];
        const b23 = mat4b[2 * 4 + 3];
        const b30 = mat4b[3 * 4 + 0];
        const b31 = mat4b[3 * 4 + 1];
        const b32 = mat4b[3 * 4 + 2];
        const b33 = mat4b[3 * 4 + 3];
        const a00 = mat4a[0 * 4 + 0];
        const a01 = mat4a[0 * 4 + 1];
        const a02 = mat4a[0 * 4 + 2];
        const a03 = mat4a[0 * 4 + 3];
        const a10 = mat4a[1 * 4 + 0];
        const a11 = mat4a[1 * 4 + 1];
        const a12 = mat4a[1 * 4 + 2];
        const a13 = mat4a[1 * 4 + 3];
        const a20 = mat4a[2 * 4 + 0];
        const a21 = mat4a[2 * 4 + 1];
        const a22 = mat4a[2 * 4 + 2];
        const a23 = mat4a[2 * 4 + 3];
        const a30 = mat4a[3 * 4 + 0];
        const a31 = mat4a[3 * 4 + 1];
        const a32 = mat4a[3 * 4 + 2];
        const a33 = mat4a[3 * 4 + 3];

        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    }
}

export const v3 = {
    cross: function(v1: number[], v2: number[]): number[] {
        return [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
    },

    subtract: function(v1: number[], v2: number[]): number[] {
        return [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]];
    },

    add: function(v1: number[], v2: number[]): number[] {
        return [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]];
    },

    normalize: function(v: number[]): number[] {
        const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);

        if (len > 0.000001) {
            return [v[0] / len, v[1] / len, v[2] / len];
        }
        return [0, 0, 0];
    }
}