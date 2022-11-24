// Outset
float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;

// Inset
float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;

#ifdef IS_SMALL
    float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
    float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
#else
    float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
    float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
#endif

// Border
float border = outset * inset;
