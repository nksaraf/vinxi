// Output
vec4 strokedFragColor = vec4(uStrokeColor, uOpacity * border);

gl_FragColor = strokedFragColor;
