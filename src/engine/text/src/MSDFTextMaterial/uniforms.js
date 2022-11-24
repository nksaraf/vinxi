// Vendor
import { Color } from 'three';

export default {
    // Common
    common: {
        uOpacity: { value: 1 },
        uColor: { value: new Color('#ffffff') },
        uMap: { value: null },
    },

    // Rendering
    rendering: {
        uThreshold: { value: 0.05 },
        uAlphaTest: { value: 0.01 },
    },

    // Strokes
    strokes: {
        uStrokeColor: { value: new Color('#ff0000') },
        uStrokeOutsetWidth: { value: 0.0 },
        uStrokeInsetWidth: { value: 0.3 },
    },

};
