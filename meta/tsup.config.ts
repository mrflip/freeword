import { defineConfig } from 'tsup'

export default defineConfig({
  entry:        { index: 'index.ts' },
  format:       ['cjs'],
  outDir:       'built-cjs',
  dts:          true,
  sourcemap:    true,
  platform:     'node',
  target:       'node18',
  // With "type": "module" in package.json, tsup uses .cjs/.d.cts extensions
  // automatically for CJS format output
})
