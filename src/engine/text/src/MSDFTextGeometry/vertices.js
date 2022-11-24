function pages(glyphs) {
    const pages = new Float32Array(glyphs.length * 4 * 1);
    let i = 0;
    glyphs.forEach(function(glyph) {
        const id = glyph.data.page || 0;
        pages[i++] = id;
        pages[i++] = id;
        pages[i++] = id;
        pages[i++] = id;
    });
    return pages;
}

function attributes(glyphs, texWidth, texHeight, flipY, layout) {
    const uvs = new Float32Array(glyphs.length * 4 * 2);
    const layoutUvs = new Float32Array(glyphs.length * 4 * 2);
    const positions = new Float32Array(glyphs.length * 4 * 2);
    const centers = new Float32Array(glyphs.length * 4 * 2);

    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;

    glyphs.forEach(function(glyph) {
        const bitmap = glyph.data;

        // UV
        const bw = (bitmap.x + bitmap.width);
        const bh = (bitmap.y + bitmap.height);

        // top left position
        const u0 = bitmap.x / texWidth;
        let v1 = bitmap.y / texHeight;
        const u1 = bw / texWidth;
        let v0 = bh / texHeight;

        if (flipY) {
            v1 = (texHeight - bitmap.y) / texHeight;
            v0 = (texHeight - bh) / texHeight;
        }

        // BL
        uvs[i++] = u0;
        uvs[i++] = v1;
        // TL
        uvs[i++] = u0;
        uvs[i++] = v0;
        // TR
        uvs[i++] = u1;
        uvs[i++] = v0;
        // BR
        uvs[i++] = u1;
        uvs[i++] = v1;

        // Layout UV: Text block UVS

        // BL
        layoutUvs[l++] = glyph.position[0] / layout.width;
        layoutUvs[l++] = (glyph.position[1] + layout.height) / layout.height;

        // TL
        layoutUvs[l++] = glyph.position[0] / layout.width;
        layoutUvs[l++] = (glyph.position[1] + layout.height + bitmap.height) / layout.height;
        // TR
        layoutUvs[l++] = (glyph.position[0] + bitmap.width) / layout.width;
        layoutUvs[l++] = (glyph.position[1] + layout.height + bitmap.height) / layout.height;
        // BR
        layoutUvs[l++] = (glyph.position[0] + bitmap.width) / layout.width;
        layoutUvs[l++] = (glyph.position[1] + layout.height) / layout.height;

        // Positions, Centers

        // bottom left position
        const x = glyph.position[0] + bitmap.xoffset;
        const y = glyph.position[1] + bitmap.yoffset;

        // quad size
        const w = bitmap.width;
        const h = bitmap.height;

        // Position

        // BL
        positions[j++] = x;
        positions[j++] = y;
        // TL
        positions[j++] = x;
        positions[j++] = y + h;
        // TR
        positions[j++] = x + w;
        positions[j++] = y + h;
        // BR
        positions[j++] = x + w;
        positions[j++] = y;

        // Center
        centers[k++] = x + w / 2;
        centers[k++] = y + h / 2;

        centers[k++] = x + w / 2;
        centers[k++] = y + h / 2;

        centers[k++] = x + w / 2;
        centers[k++] = y + h / 2;

        centers[k++] = x + w / 2;
        centers[k++] = y + h / 2;
    });

    return { uvs, layoutUvs, positions, centers };
}

function infos(glyphs, layout) {
    const linesTotal = new Float32Array(glyphs.length * 4);
    const lineIndex = new Float32Array(glyphs.length * 4);

    const lineLettersTotal = new Float32Array(glyphs.length * 4);
    const lineLetterIndex = new Float32Array(glyphs.length * 4);

    const lineWordsTotal = new Float32Array(glyphs.length * 4);
    const lineWordIndex = new Float32Array(glyphs.length * 4);

    const wordsTotal = new Float32Array(glyphs.length * 4);
    const wordIndex = new Float32Array(glyphs.length * 4);

    const lettersTotal = new Float32Array(glyphs.length * 4);
    const letterIndex = new Float32Array(glyphs.length * 4);

    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;
    let m = 0;
    let n = 0;
    let o = 0;
    let p = 0;
    let q = 0;
    let r = 0;

    for (let index = 0; index < glyphs.length; index++) {
        const glyph = glyphs[index];

        // i
        linesTotal[i++] = glyph.linesTotal;
        linesTotal[i++] = glyph.linesTotal;
        linesTotal[i++] = glyph.linesTotal;
        linesTotal[i++] = glyph.linesTotal;

        // j
        lineIndex[j++] = glyph.lineIndex;
        lineIndex[j++] = glyph.lineIndex;
        lineIndex[j++] = glyph.lineIndex;
        lineIndex[j++] = glyph.lineIndex;

        // k
        lineLettersTotal[k++] = glyph.lineLettersTotal;
        lineLettersTotal[k++] = glyph.lineLettersTotal;
        lineLettersTotal[k++] = glyph.lineLettersTotal;
        lineLettersTotal[k++] = glyph.lineLettersTotal;

        // l
        lineLetterIndex[l++] = glyph.lineLetterIndex;
        lineLetterIndex[l++] = glyph.lineLetterIndex;
        lineLetterIndex[l++] = glyph.lineLetterIndex;
        lineLetterIndex[l++] = glyph.lineLetterIndex;

        // m
        lineWordsTotal[m++] = glyph.lineWordsTotal;
        lineWordsTotal[m++] = glyph.lineWordsTotal;
        lineWordsTotal[m++] = glyph.lineWordsTotal;
        lineWordsTotal[m++] = glyph.lineWordsTotal;

        // n
        lineWordIndex[n++] = glyph.lineWordIndex;
        lineWordIndex[n++] = glyph.lineWordIndex;
        lineWordIndex[n++] = glyph.lineWordIndex;
        lineWordIndex[n++] = glyph.lineWordIndex;

        // o
        wordsTotal[o++] = glyph.wordsTotal;
        wordsTotal[o++] = glyph.wordsTotal;
        wordsTotal[o++] = glyph.wordsTotal;
        wordsTotal[o++] = glyph.wordsTotal;

        // p
        wordIndex[p++] = glyph.wordIndex;
        wordIndex[p++] = glyph.wordIndex;
        wordIndex[p++] = glyph.wordIndex;
        wordIndex[p++] = glyph.wordIndex;

        // q
        lettersTotal[q++] = glyph.lettersTotal;
        lettersTotal[q++] = glyph.lettersTotal;
        lettersTotal[q++] = glyph.lettersTotal;
        lettersTotal[q++] = glyph.lettersTotal;

        // r
        letterIndex[r++] = glyph.letterIndex;
        letterIndex[r++] = glyph.letterIndex;
        letterIndex[r++] = glyph.letterIndex;
        letterIndex[r++] = glyph.letterIndex;
    }

    return {
        linesTotal,
        lineIndex,

        lineLettersTotal,
        lineLetterIndex,

        lineWordsTotal,
        lineWordIndex,

        wordsTotal,
        wordIndex,

        lettersTotal,
        letterIndex,
    };
}

export default {
    pages,
    attributes,
    infos,
};
