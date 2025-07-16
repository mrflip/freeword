const Filepath = require('path')

module.exports = {
  testPathForConsistencyCheck: 'tests/foo/example.test.js',

  /** Resolve snapshot file path from given test file path and snapshot extension to be used
   * turns  ./tests/foo/Post.spec.js
   * into  ./.snaps/foo/Post.spec.ts.snap
   * @param {string} testSourcePath @param {string} snapshotExtension */
  resolveSnapshotPath(testSourcePath, snapshotExtension) {
    const testDirectory = Filepath.dirname(testSourcePath)
    const testFilename  = Filepath.basename(testSourcePath)
    const snapDirectory = testDirectory.replace(/tests/, '.snaps')
    const snapshotPath  = Filepath.join(snapDirectory, `${testFilename}${snapshotExtension}`)
    return snapshotPath
  },

  /** Resolve test file path that gave rise to the given snapshot file path and extension of
   * turns ./.snaps/foo/Post.spec.ts.snap
   * into   ./tests/foo/Post.spec.js
   * @param {string} snapshotPath @param {string} snapshotExtension */
  resolveTestPath(snapshotPath, snapshotExtension) {
    const snapDirectory = Filepath.dirname(snapshotPath)
    const snapFilename  = Filepath.basename(snapshotPath)
    const testDirectory = snapDirectory.replace(/\.snaps\//, 'tests/').replace('__snapshots__/', '')
    const testFilename  = snapFilename.slice(0, (-snapshotExtension.length))
    const testPath      = Filepath.join(testDirectory, testFilename)
    return testPath
  },
}
