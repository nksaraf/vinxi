export declare class ImportMap {
    /** Track importers by their imports */
    importers: Map<string, Set<string>>;
    /** Track imports by their importers */
    imports: Map<string, Set<string>>;
    addImport(id: string, importer: string): void;
    deleteImporter(importer: string): void;
}
//# sourceMappingURL=ImportMap.d.ts.map