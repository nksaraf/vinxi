// Attributes
import attributes from './attributes.glsl';
import varyings from './varyings.glsl';

// Vertex
import vertex from './vertex.glsl';

// Utils
import median from './median.glsl';

// Common
import common from './common.glsl';
import commonUniforms from './common-uniforms.glsl';

// Strokes
import strokes from './strokes.glsl';
import strokesUniforms from './strokes-uniforms.glsl';

// Alpha Test
import alphaTest from './alpha-test.glsl';

// Outputs
import commonOutput from './common-output.glsl';
import strokesOutput from './strokes-output.glsl';

export default {
    // Attributes
    three_msdf_attributes: attributes,

    // Varyings
    three_msdf_varyings: varyings,

    // Vertex
    three_msdf_vertex: vertex,

    // Utils
    three_msdf_median: median,

    // Common
    three_msdf_common: common,
    three_msdf_common_uniforms: commonUniforms,

    // Strokes
    three_msdf_strokes: strokes,
    three_msdf_strokes_uniforms: strokesUniforms,

    // Alpha test
    three_msdf_alpha_test: alphaTest,

    // Output
    three_msdf_common_output: commonOutput,
    three_msdf_strokes_output: strokesOutput,
};
