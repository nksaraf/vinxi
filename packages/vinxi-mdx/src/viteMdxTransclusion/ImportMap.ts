export class ImportMap {
  /** Track importers by their imports */
  importers = new Map<string, Set<string>>()
  /** Track imports by their importers */
  imports = new Map<string, Set<string>>()

  addImport(id: string, importer: string) {
    let imports = this.imports.get(importer)
    if (!imports) this.imports.set(importer, (imports = new Set()))
    imports.add(id)

    let importers = this.importers.get(id)
    if (!importers) this.importers.set(id, (importers = new Set()))
    importers.add(importer)
  }

  deleteImporter(importer: string) {
    if (this.imports.delete(importer))
      this.importers.forEach((importers, id) => {
        importers.delete(importer)
        if (!importers.size) {
          this.importers.delete(id)
        }
      })
  }
}
