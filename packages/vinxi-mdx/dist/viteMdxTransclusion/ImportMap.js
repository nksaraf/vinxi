export class ImportMap {
    constructor() {
        /** Track importers by their imports */
        this.importers = new Map();
        /** Track imports by their importers */
        this.imports = new Map();
    }
    addImport(id, importer) {
        let imports = this.imports.get(importer);
        if (!imports)
            this.imports.set(importer, (imports = new Set()));
        imports.add(id);
        let importers = this.importers.get(id);
        if (!importers)
            this.importers.set(id, (importers = new Set()));
        importers.add(importer);
    }
    deleteImporter(importer) {
        if (this.imports.delete(importer))
            this.importers.forEach((importers, id) => {
                importers.delete(importer);
                if (!importers.size) {
                    this.importers.delete(id);
                }
            });
    }
}
//# sourceMappingURL=ImportMap.js.map