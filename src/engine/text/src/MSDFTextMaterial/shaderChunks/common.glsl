// Texture sample
vec3 s = texture2D(uMap, vUv).rgb;

// Signed distance
float sigDist = median(s.r, s.g, s.b) - 0.5;

float afwidth = 1.4142135623730951 / 2.0;

#ifdef IS_SMALL
    float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
#else
    float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
#endif
