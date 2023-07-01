import { normalizePath } from "vite";
import path from "node:path";

export function createViteManifest(config, bundle, format) {
  let manifest = {};
  function getChunkName(chunk) {
    if (chunk.facadeModuleId) {
      let name = normalizePath(
        path.relative(config.root, chunk.facadeModuleId)
      );
      if (format === "system" && !chunk.name.includes("-legacy")) {
        const ext = path.extname(name);
        const endPos = ext.length !== 0 ? -ext.length : undefined;
        name = name.slice(0, endPos) + `-legacy` + ext;
      }
      return name.replace(/\0/g, "");
    } else {
      return `_` + path.basename(chunk.fileName);
    }
  }

  function getInternalImports(imports) {
    const filteredImports = [];

    for (const file of imports) {
      if (bundle[file] === undefined) {
        continue;
      }

      filteredImports.push(getChunkName(bundle[file]));
    }

    return filteredImports;
  }

  function createChunk(chunk) {
    const manifestChunk = {
      file: chunk.fileName,
    };

    if (chunk.facadeModuleId) {
      manifestChunk.src = getChunkName(chunk);
    }
    if (chunk.isEntry) {
      manifestChunk.isEntry = true;
    }
    if (chunk.isDynamicEntry) {
      manifestChunk.isDynamicEntry = true;
    }

    if (chunk.imports.length) {
      const internalImports = getInternalImports(chunk.imports);
      if (internalImports.length > 0) {
        manifestChunk.imports = internalImports;
      }
    }

    if (chunk.dynamicImports.length) {
      const internalImports = getInternalImports(chunk.dynamicImports);
      if (internalImports.length > 0) {
        manifestChunk.dynamicImports = internalImports;
      }
    }

    if (chunk.viteMetadata?.importedCss.size) {
      manifestChunk.css = [...chunk.viteMetadata.importedCss];
    }
    if (chunk.viteMetadata?.importedAssets.size) {
      manifestChunk.assets = [...chunk.viteMetadata.importedAssets];
    }

    return manifestChunk;
  }

  function createAsset(asset, src, isEntry) {
    const manifestChunk = {
      file: asset.fileName,
      src,
    };
    if (isEntry) manifestChunk.isEntry = true;
    return manifestChunk;
  }

  const fileNameToAssetMeta = new Map();
  // const assets = generatedAssets.get(config);
  // assets.forEach((asset, referenceId) => {
  // 	const fileName = this.getFileName(referenceId);
  // 	fileNameToAssetMeta.set(fileName, asset);
  // });
  const fileNameToAsset = new Map();

  for (const file in bundle) {
    const chunk = bundle[file];
    if (chunk.type === "chunk") {
      manifest[getChunkName(chunk)] = createChunk(chunk);
    } else if (chunk.type === "asset" && typeof chunk.name === "string") {
      // Add every unique asset to the manifest, keyed by its original name
      const assetMeta = fileNameToAssetMeta.get(chunk.fileName);
      const src = assetMeta?.originalName ?? chunk.name;
      const asset = createAsset(chunk, src, assetMeta?.isEntry);
      manifest[src] = asset;
      fileNameToAsset.set(chunk.fileName, asset);
    }
  }

  // Add deduplicated assets to the manifest
  // assets.forEach(({ originalName }, referenceId) => {
  // 	if (!manifest[originalName]) {
  // 		const fileName = this.getFileName(referenceId);
  // 		const asset = fileNameToAsset.get(fileName);
  // 		if (asset) {
  // 			manifest[originalName] = asset;
  // 		}
  // 	}
  // });

  return manifest;
}
