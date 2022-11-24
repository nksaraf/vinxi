// Vendor
import wordWrap from 'word-wrapper';

const X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z'];
const M_WIDTHS = ['m', 'w'];
const CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const TAB_ID = '\t'.charCodeAt(0);
const SPACE_ID = ' '.charCodeAt(0);
const ALIGN_LEFT = 0;
const ALIGN_CENTER = 1;
const ALIGN_RIGHT = 2;

class TextLayout {
    constructor(options = {}) {
        this.glyphs = [];
        this._measure = this.computeMetrics.bind(this);
        this.update(options);
    }

    /**
     * Getters
     */
    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get descender() {
        return this._descender;
    }

    get ascender() {
        return this._ascender;
    }

    get xHeight() {
        return this._xHeight;
    }

    get baseline() {
        return this._baseline;
    }

    get capHeight() {
        return this._capHeight;
    }

    get lineHeight() {
        return this._lineHeight;
    }

    get linesTotal() {
        return this._linesTotal;
    }

    get lettersTotal() {
        return this._lettersTotal;
    }

    get wordsTotal() {
        return this._wordsTotal;
    }

    update(options) {
        options = Object.assign({ measure: this._measure }, options);

        this._options = options;
        this._options.tabSize = number(this._options.tabSize, 4);

        if (!options.font) { throw new Error('must provide a valid bitmap font'); }

        const glyphs = this.glyphs;
        const text = options.text || '';
        const font = options.font;
        this._setupSpaceGlyphs(font);

        const lines = wordWrap.lines(text, options);
        const minWidth = options.width || 0;

        const wordsTotal = text.split(' ').filter(word => word !== '\n').length;
        const lettersTotal = text.split('').filter(char => char !== '\n' && char !== ' ').length;

        // clear glyphs
        glyphs.length = 0;

        // get max line width
        const maxLineWidth = lines.reduce(function(prev, line) {
            return Math.max(prev, line.width, minWidth);
        }, 0);

        // the pen position
        let x = 0;
        let y = 0;
        const lineHeight = number(options.lineHeight, font.common.lineHeight);
        const baseline = font.common.base;
        const descender = lineHeight - baseline;
        const letterSpacing = options.letterSpacing || 0;
        const height = lineHeight * lines.length - descender;
        const align = getAlignType(this._options.align);

        // draw text along baseline
        y -= height;

        // the metrics for this text layout
        this._width = maxLineWidth;
        this._height = height;
        this._descender = lineHeight - baseline;
        this._baseline = baseline;
        this._xHeight = getXHeight(font);
        this._capHeight = getCapHeight(font);
        this._lineHeight = lineHeight;
        this._ascender = lineHeight - descender - this._xHeight;

        let wordIndex = 0;
        let letterIndex = 0;

        // layout each glyph
        lines.forEach((line, lineIndex) => {
            const start = line.start;
            const end = line.end;
            const lineWidth = line.width;
            const lineString = text.slice(start, end);

            const lineWordsTotal = lineString.split(' ').filter((item) => item !== '').length;
            const lineLettersTotal = text.slice(start, end).split(' ').join('').length;
            let lineLetterIndex = 0;
            let lineWordIndex = 0;

            let lastGlyph;

            // for each glyph in that line...
            for (let i = start; i < end; i++) {
                const id = text.charCodeAt(i);
                const glyph = this.getGlyph(font, id);

                if (glyph) {
                    if (lastGlyph) {
                        x += getKerning(font, lastGlyph.id, glyph.id);
                    }

                    let tx = x;
                    if (align === ALIGN_CENTER) {
                        tx += (maxLineWidth - lineWidth) / 2;
                    } else if (align === ALIGN_RIGHT) {
                        tx += (maxLineWidth - lineWidth);
                    }

                    glyphs.push({
                        position: [tx, y],
                        data: glyph,
                        index: i,
                        // Line
                        linesTotal: lines.length,
                        lineIndex,
                        lineLettersTotal,
                        lineLetterIndex,
                        lineWordsTotal,
                        lineWordIndex,
                        // Word
                        wordsTotal,
                        wordIndex,
                        // Letter
                        lettersTotal,
                        letterIndex,
                    });

                    if (glyph.id === SPACE_ID && lastGlyph.id !== SPACE_ID) {
                        lineWordIndex++;
                        wordIndex++;
                    }

                    if (glyph.id !== SPACE_ID) {
                        lineLetterIndex++;
                        letterIndex++;
                    }

                    // move pen forward
                    x += glyph.xadvance + letterSpacing;
                    lastGlyph = glyph;
                }
            }

            // next line down
            y += lineHeight;
            x = 0;
        });

        this._lettersTotal = lettersTotal;
        this._wordsTotal = wordsTotal;
        this._linesTotal = lines.length;
    }

    getGlyph(font, id) {
        const glyph = getGlyphById(font, id);

        if (glyph) {
            return glyph;
        } else if (id === TAB_ID) {
            return this._fallbackTabGlyph;
        } else if (id === SPACE_ID) {
            return this._fallbackSpaceGlyph;
        }

        return null;
    }

    computeMetrics(text, start, end, width) {
        const letterSpacing = this._options.letterSpacing || 0;
        const font = this._options.font;
        let curPen = 0;
        let curWidth = 0;
        let count = 0;
        let glyph;
        let lastGlyph;

        if (!font.chars || font.chars.length === 0) {
            return {
                start,
                end: start,
                width: 0,
            };
        }

        end = Math.min(text.length, end);

        for (let i = start; i < end; i++) {
            const id = text.charCodeAt(i);
            glyph = this.getGlyph(font, id);

            if (glyph) {
                glyph.char = text[i];
                // move pen forward
                const xoff = glyph.xoffset;
                const kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
                curPen += kern;

                const nextPen = curPen + glyph.xadvance + letterSpacing;
                const nextWidth = curPen + glyph.width;

                // we've hit our limit; we can't move onto the next glyph
                if (nextWidth >= width || nextPen >= width) { break; }

                // otherwise continue along our line
                curPen = nextPen;
                curWidth = nextWidth;
                lastGlyph = glyph;
            }
            count++;
        }

        // make sure rightmost edge lines up with rendered glyphs
        if (lastGlyph) { curWidth += lastGlyph.xoffset; }

        return {
            start,
            end: start + count,
            width: curWidth,
        };
    }

    /**
     * Private
     */
    _setupSpaceGlyphs(font) {
        // These are fallbacks, when the font doesn't include
        // ' ' or '\t' glyphs
        this._fallbackSpaceGlyph = null;
        this._fallbackTabGlyph = null;

        if (!font.chars || font.chars.length === 0) return;

        // try to get space glyph
        // then fall back to the 'm' or 'w' glyphs
        // then fall back to the first glyph available
        const space = getGlyphById(font, SPACE_ID) || getMGlyph(font) || font.chars[0];

        // and create a fallback for tab
        const tabWidth = this._options.tabSize * space.xadvance;
        this._fallbackSpaceGlyph = space;
        const spaceClone = Object.assign({}, space);
        this._fallbackTabGlyph = Object.assign(spaceClone, {
            x: 0,
            y: 0,
            xadvance: tabWidth,
            id: TAB_ID,
            xoffset: 0,
            yoffset: 0,
            width: 0,
            height: 0,
        });
    }
}

function createLayout(options) {
    return new TextLayout(options);
}

function getGlyphById(font, id) {
    if (!font.chars || font.chars.length === 0) { return null; }

    const glyphIdx = findChar(font.chars, id);

    if (glyphIdx >= 0) {
        const glyph = font.chars[glyphIdx];
        return glyph;
    }

    return null;
}

function getXHeight(font) {
    for (let i = 0; i < X_HEIGHTS.length; i++) {
        const id = X_HEIGHTS[i].charCodeAt(0);
        const idx = findChar(font.chars, id);
        if (idx >= 0) { return font.chars[idx].height; }
    }
    return 0;
}

function getMGlyph(font) {
    for (let i = 0; i < M_WIDTHS.length; i++) {
        const id = M_WIDTHS[i].charCodeAt(0);
        const idx = findChar(font.chars, id);
        if (idx >= 0) { return font.chars[idx]; }
    }
    return 0;
}

function getCapHeight(font) {
    for (let i = 0; i < CAP_HEIGHTS.length; i++) {
        const id = CAP_HEIGHTS[i].charCodeAt(0);
        const idx = findChar(font.chars, id);
        if (idx >= 0) { return font.chars[idx].height; }
    }
    return 0;
}

function getKerning(font, left, right) {
    if (!font.kernings || font.kernings.length === 0) { return 0; }

    const table = font.kernings;
    for (let i = 0; i < table.length; i++) {
        const kern = table[i];
        if (kern.first === left && kern.second === right) { return kern.amount; }
    }
    return 0;
}

function getAlignType(align) {
    if (align === 'center') { return ALIGN_CENTER; } else if (align === 'right') { return ALIGN_RIGHT; }
    return ALIGN_LEFT;
}

function findChar(array, value, start) {
    start = start || 0;
    for (let i = start; i < array.length; i++) {
        if (array[i].id === value) {
            return i;
        }
    }
    return -1;
}

function number(num, def) {
    return typeof num === 'number' ? num : (typeof def === 'number' ? def : 0);
}

export {
    createLayout,
};

export default TextLayout;
