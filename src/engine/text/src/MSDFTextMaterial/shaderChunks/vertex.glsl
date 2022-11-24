// Output
vec4 mvPosition = vec4(position, 1.0);
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;

// Varyings
vUv = uv;
vLayoutUv = layoutUv;
vViewPosition = -mvPosition.xyz;
vNormal = normal;

vLineIndex = lineIndex;

vLineLettersTotal = lineLettersTotal;
vLineLetterIndex = lineLetterIndex;

vLineWordsTotal = lineWordsTotal;
vLineWordIndex = lineWordIndex;

vWordIndex = wordIndex;

vLetterIndex = letterIndex;
