// Vendor
import { ShaderMaterial, FrontSide, ShaderChunk } from 'three';

// Uniforms
import uniforms from './uniforms';

// Shaders
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

// Shunks
import shaderChunks from './shaderChunks';

// Add chunks
for (const key in shaderChunks) {
    ShaderChunk[key] = shaderChunks[key];
}

const defaultOptions = {
    side: FrontSide,
    transparent: true,
    defines: {
        IS_SMALL: false,
    },
    extensions: {
        derivatives: true,
    },
    uniforms: {
        // Common
        ...uniforms.common,
        // Rendering
        ...uniforms.rendering,
        // Strokes
        ...uniforms.strokes,
    },
    vertexShader,
    fragmentShader,
};

export {
    uniforms,
    defaultOptions,
    shaderChunks
};

export default class MSDFTextMaterial extends ShaderMaterial {
    constructor(options = {}) {
        options = Object.assign(defaultOptions, options);
        super(options);
    }
}
