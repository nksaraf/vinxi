// Varyings
varying vec2 vUv;

// Uniforms
#include <three_msdf_common_uniforms>
#include <three_msdf_strokes_uniforms>

// Utils
#include <three_msdf_median>

void main() {
    // Common
    #include <three_msdf_common>

    // Strokes
    #include <three_msdf_strokes>

    // Alpha Test
    #include <three_msdf_alpha_test>

    // Outputs
    #include <three_msdf_common_output>
    // #include <three_msdf_strokes_output>
}
