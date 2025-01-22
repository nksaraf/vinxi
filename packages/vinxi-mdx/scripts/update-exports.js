import pkg from '../package.json' with { type: "json" }
import { writeFileSync } from 'node:fs'

/**
 * @param {string} from
 * @param {string} to
 */
export function updateExports(from, to) {
  const originalImport = pkg.exports['.'].import
  const originalRequire = pkg.exports['.'].require

  pkg.exports['.'].import = pkg.exports['.'].import.replace(from, to)
  pkg.exports['.'].require = pkg.exports['.'].import.replace(from, to)

  console.log(`Changed import from ${originalImport} to ${pkg.exports['.'].import}`)
  console.log(`Changed require from ${originalRequire} to ${pkg.exports['.'].require}`)

  writeFileSync('package.json', JSON.stringify(pkg, null, 2))
}