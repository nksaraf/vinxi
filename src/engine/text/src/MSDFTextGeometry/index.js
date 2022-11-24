// Lib
import { createLayout } from './TextLayout';
import utils from './utils';
import vertices from './vertices';

// Vendor
import createIndices from 'quad-indices';
import { BufferGeometry, Sphere, Box3, BufferAttribute } from 'three';

export default class MSDFTextGeometry extends BufferGeometry {
    constructor(options) {
        super();

        // Set text as object property
        if (typeof options === 'string') options = { text: options };

        // use these as default values for any subsequent
        // calls to update()
        this._options = Object.assign({}, options);

        this._layout = null;
        this._visibleGlyphs = [];

        this.update(this._options);
    }

    /**
     * Getters
     */
    get layout() {
        return this._layout;
    }

    get visibleGlyphs() {
        return this._visibleGlyphs;
    }

    /**
     * Public
     */
    update(options) {
        options = this._validateOptions(options);

        if (!options) return;

        this._layout = createLayout(options);

        // get vec2 texcoords
        const flipY = options.flipY !== false;

        // the desired BMFont data
        const font = options.font;

        // determine texture size from font file
        const texWidth = font.common.scaleW;
        const texHeight = font.common.scaleH;

        // get visible glyphs
        const glyphs = this._layout.glyphs.filter((glyph) => {
            const bitmap = glyph.data;
            return bitmap.width * bitmap.height > 0;
        });

        // provide visible glyphs for convenience
        this._visibleGlyphs = glyphs;

        // get common vertex data
        const attributes = vertices.attributes(glyphs, texWidth, texHeight, flipY, this._layout);
        const infos = vertices.infos(glyphs, this._layout);
        const indices = createIndices([], {
            clockwise: true,
            type: 'uint16',
            count: glyphs.length,
        });

        // update vertex data
        this.setIndex(indices);

        this.setAttribute('position', new BufferAttribute(attributes.positions, 2));
        this.setAttribute('center', new BufferAttribute(attributes.centers, 2));
        this.setAttribute('uv', new BufferAttribute(attributes.uvs, 2));
        this.setAttribute('layoutUv', new BufferAttribute(attributes.layoutUvs, 2));

        // this.setAttribute('linesTotal', new BufferAttribute(infos.linesTotal, 1)); // Use uniforms instead
        this.setAttribute('lineIndex', new BufferAttribute(infos.lineIndex, 1));

        this.setAttribute('lineLettersTotal', new BufferAttribute(infos.lineLettersTotal, 1));
        this.setAttribute('lineLetterIndex', new BufferAttribute(infos.lineLetterIndex, 1));

        this.setAttribute('lineWordsTotal', new BufferAttribute(infos.lineWordsTotal, 1));
        this.setAttribute('lineWordIndex', new BufferAttribute(infos.lineWordIndex, 1));

        // this.setAttribute('wordsTotal', new BufferAttribute(infos.wordsTotal, 1)); // Use uniforms instead
        this.setAttribute('wordIndex', new BufferAttribute(infos.wordIndex, 1));

        // this.setAttribute('lettersTotal', new BufferAttribute(infos.lettersTotal, 1)); // Use uniforms instead
        this.setAttribute('letterIndex', new BufferAttribute(infos.letterIndex, 1));

        // update multipage data
        if (!options.multipage && 'page' in this.attributes) {
            // disable multipage rendering
            this.deleteAttribute('page');
        } else if (options.multipage) {
            // enable multipage rendering
            const pages = vertices.pages(glyphs);
            this.setAttribute('page', new BufferAttribute(pages, 1));
        }
    }

    computeBoundingSphere() {
        if (this.boundingSphere === null) this.boundingSphere = new Sphere();

        const positions = this.attributes.position.array;
        const itemSize = this.attributes.position.itemSize;

        if (!positions || !itemSize || positions.length < 2) {
            this.boundingSphere.radius = 0;
            this.boundingSphere.center.set(0, 0, 0);
            return;
        }

        utils.computeSphere(positions, this.boundingSphere);

        if (isNaN(this.boundingSphere.radius)) console.error('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.');
    }

    computeBoundingBox() {
        if (this.boundingBox === null) {
            this.boundingBox = new Box3();
        }

        const bbox = this.boundingBox;
        const positions = this.attributes.position.array;
        const itemSize = this.attributes.position.itemSize;

        if (!positions || !itemSize || positions.length < 2) {
            bbox.makeEmpty();
            return;
        }

        const box = utils.computeBox(positions, bbox);

        return box;
    }

    /**
     * Utils
     */
    _validateOptions(options) {
        // Set text as object property
        if (typeof options === 'string') options = { text: options };

        // Use constructor defaults
        options = Object.assign({}, this._options, options);

        // Check for font property
        if (!options.font) throw new TypeError('must specify a { font } in options');

        return options;
    }
}
