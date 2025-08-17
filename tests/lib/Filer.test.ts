import      _                                /**/ from 'lodash'
import      { expect }                            from 'chai'
import      { promises as fs }                    from 'fs'
import      path                                  from 'path'
import      os                                    from 'os'
import type * as TY                               from '@freeword/meta'
import      { Filer, UF }                         from '@freeword/meta'

const {
  _abspathForPathparts,  _abspathForPathname,  pathinfoFor, starlines,
  dumptext, dumpjson, mkdirp, starjsonl,
} = Filer

describe('Filer', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'filer-test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('_abspathForPathparts', () => {
    it('should convert Pathinfo to absolute path with extension', () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'test',
        fext: '.txt',
        dirpath: '/tmp'
      }
      const result = _abspathForPathparts(pathinfo)
      expect(result).to.equal(path.resolve('/tmp/test.txt'))
    })

    it('should convert Pathinfo to absolute path without extension', () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'test',
        fext: '',
        dirpath: '/tmp'
      }
      const result = _abspathForPathparts(pathinfo)
      expect(result).to.equal(path.resolve('/tmp/test'))
    })

    it('should handle relative dirpath', () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'test',
        fext: '.json',
        dirpath: './relative'
      }
      const result = _abspathForPathparts(pathinfo)
      expect(result).to.equal(path.resolve('./relative/test.json'))
    })

    it('should throw for blank dirpath', () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'test',
        fext: '.txt',
        dirpath: ''
      }
      expect(() => _abspathForPathparts(pathinfo)).to.throw('Blank path is not a reasonable input')
    })

    it('should throw for blank barename', () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: '',
        fext: '.txt',
        dirpath: '/tmp'
      }
      expect(() => _abspathForPathparts(pathinfo)).to.throw('Blank path is not a reasonable input')
    })
  })

  describe('_abspathForPathname', () => {
    it('should convert absolute pathname to absolute path', () => {
      const pathname = '/tmp/test.txt'
      const result = _abspathForPathname(pathname)
      expect(result).to.equal(path.resolve(pathname))
    })

    it('should convert relative pathname to absolute path', () => {
      const pathname = './relative/file.json'
      const result = _abspathForPathname(pathname)
      expect(result).to.equal(path.resolve(pathname))
    })

    it('should throw for blank pathname', () => {
      expect(() => _abspathForPathname('')).to.throw('Blank path is not a reasonable input')
    })

    it('should throw for all-whitespace pathname', () => {
      expect(() => _abspathForPathname('   ')).to.throw('Blank path is not a reasonable input')
    })

    it('should throw for non-string input', () => {
      expect(() => _abspathForPathname(null as any)).to.throw('Blank path is not a reasonable input')
    })
  })

  describe('pathinfoFor', () => {
    it('should parse absolute path string', () => {
      const input = '/tmp/test.txt'
      const result = pathinfoFor(input)
      expect(result).to.eql({
        barename: 'test',
        fext: '.txt',
        dirpath: '/tmp',
        ok: true,
        abspath: '/tmp/test.txt'
      })
    })

    it('should parse relative path string', () => {
      const input = './relative/file.json'
      const result = pathinfoFor(input)
      expect(result).to.eql({
        barename: 'file',
        fext: '.json',
        dirpath: path.dirname(path.resolve(input)),
        ok: true,
        abspath: path.resolve(input)
      })
    })

    it('should parse path without extension', () => {
      const input = '/tmp/file'
      const result = pathinfoFor(input)
      expect(result).to.eql({
        barename: 'file',
        fext: '',
        dirpath: '/tmp',
        ok: true,
        abspath: '/tmp/file'
      })
    })

    it('should parse Pathinfo object', () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'test',
        fext: '.txt',
        dirpath: '/tmp'
      }
      const result = pathinfoFor(pathinfo)
      expect(result).to.eql({
        barename: 'test',
        fext: '.txt',
        dirpath: '/tmp',
        ok: true,
        abspath: '/tmp/test.txt'
      })
    })

    it('should handle blank paths', () => {
      const result = pathinfoFor('')
      expect(result.ok).to.be.false
      if (!result.ok) {
        expect(result.gist).to.equal('blankPath')
        expect(result.err).to.be.instanceOf(Error)
        expect(result.err!.message).to.include('Blank path is not a reasonable input')
        expect(result.origmsg).to.equal('Blank path provided')
        expect((result as any).args).to.deep.equal({ anypath: '' })
      }
    })

    it('should handle null/undefined paths', () => {
      const result = pathinfoFor(null as any)
      expect(result.ok).to.be.false
      if (!result.ok) {
        expect(result.gist).to.equal('blankPath')
        expect(result.err).to.be.instanceOf(Error)
        expect(result.origmsg).to.equal('Blank path provided')
        expect((result as any).args).to.deep.equal({ anypath: null })
      }
    })
  })

  describe('mkdirp', () => {
    it('should create directory', async () => {
      const dirPath = path.join(tempDir, 'newdir')
      const result = await mkdirp(dirPath)
      expect(result).to.eql({
        barename: 'newdir',
        fext: '',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: dirPath,
        val: result.val
      })
    })

    it('should create nested directories', async () => {
      const nestedPath = path.join(tempDir, 'nested', 'deep', 'dir')
      const result = await mkdirp(nestedPath)
      expect(result).to.eql({
        barename: 'dir',
        fext: '',
        dirpath: path.join(tempDir, 'nested', 'deep'),
        ok: true,
        gist: 'ok',
        abspath: nestedPath,
        val: result.val
      })
    })

    it('should work with Pathinfo', async () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'testdir',
        fext: '',
        dirpath: tempDir
      }
      const result = await mkdirp(pathinfo)
      expect(result).to.eql({
        barename: 'testdir',
        fext: '',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: path.join(tempDir, 'testdir'),
        val: result.val
      })
    })
  })

  describe('starlines', () => {
    let testFile: string

    beforeEach(async () => {
      testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'line1\nline2\nline3\n')
    })

    it('should yield lines from file', async () => {
      const lines: string[] = []
      const generator = starlines(testFile)
      for await (const line of generator) {
        lines.push(line)
      }
      expect(lines).to.deep.equal(['line1', 'line2', 'line3'])
    })

    it('should work with Pathinfo', async () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'test',
        fext: '.txt',
        dirpath: tempDir
      }
      const lines: string[] = []
      const generator = starlines(pathinfo)
      for await (const line of generator) {
        lines.push(line)
      }
      expect(lines).to.deep.equal(['line1', 'line2', 'line3'])
    })

    it('should handle empty file', async () => {
      const emptyFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(emptyFile, '')
      const lines: string[] = []
      const generator = starlines(emptyFile)
      for await (const line of generator) {
        lines.push(line)
      }
      expect(lines).to.deep.equal([])
    })

    it('should handle file not found', async () => {
      let err: TY.ExtError = undefined!
      try {
        const generator = starlines('/nonexistent/file.txt')
        for await (const line of generator) {
          expect.fail(`Should not yield any lines for non-existent file: ${line}`)
        }
      } catch (caught) { err = caught as TY.ExtError }
      expect((err as Error).message).to.eql(`Path /nonexistent/file.txt is absent: ENOENT: no such file or directory, open '/nonexistent/file.txt'`)
      expect(err).property('errno').to.eql(-2)
      expect(err).property('path').to.eql('/nonexistent/file.txt')
      expect(err).property('extensions').to.eql({
        lineNumber: 0,
        filepath:   '/nonexistent/file.txt',
        args:       { anypath: '/nonexistent/file.txt' },
        gist:       'fileNotFound',
        errno:      -2,
        code:       'ENOENT',
        syscall:    'open',
        path:       '/nonexistent/file.txt',
        origmsg:    "ENOENT: no such file or directory, open '/nonexistent/file.txt'"
      })
    })
  })
  function fixturePath(filename: TY.Relpath) { return Filer.__relname(import.meta.url!, '../fixtures', filename) }
  const expectedWu = [
    { nick: 'RZA',              fullname: 'Robert Fitzgerald Diggs' },
    { nick: 'GZA',              fullname: 'Gary Grice' },
    { nick: 'ODB',              fullname: 'Ol\' Dirty Bastard' },
    { nick: 'Method Man',       fullname: 'Clifford Smith' },
    { nick: 'Ghostface Killah', fullname: 'Dennis Coles' },
    { nick: 'Raekwon',          fullname: 'Corey Woods' },
    { nick: 'Inspectah Deck',   fullname: 'Darryl McDaniels' },
    { nick: 'U-God',            fullname: 'Lamont Jody Hawkins' },
    { nick: 'Masta Killa',      fullname: 'Darryl Hill' },
    { nick: 'Cappadonna',       fullname: 'Shawn Wigs' },
  ]
  const expectedWuKVEntries   = _.map(expectedWu, (wu, seq) => [wu.nick, wu, seq])
  const expectedWuArrEntries  = _.map(expectedWu, (wu, seq) => [seq,     wu, seq])
  describe('starjsonEntries', () => {
    it('should handle empty file', async () => {
      const lines: any[] = []
      for await (const line of Filer.starjsonEntries(fixturePath('empty'))) { lines.push(line) }
      expect(lines).to.deep.equal([])
    })
    it('should handle newline-separated JSON file', async () => {
      const lines: any[] = []
      for await (const line of Filer.starjsonEntries(fixturePath('goodjsonl.jsonl'))) { lines.push(line) }
      expect(lines).to.deep.equal(expectedWuArrEntries)
    })
    it('should handle dual-mode JSON array file', async () => {
      const lines: any[] = []
      for await (const line of Filer.starjsonEntries(fixturePath('goodjsonl.l.json'))) { lines.push(line) }
      expect(lines).to.deep.equal(expectedWuArrEntries)
    })
    it('should handle dual-mode JSON key-value file', async () => {
      const lines: any[] = []
      for await (const line of Filer.starjsonEntries(fixturePath('goodjsonkv.kv.json'))) { lines.push(line) }
      expect(lines).to.deep.equal(expectedWuKVEntries)
    })
  })
  describe('starjsonl', () => {
    it('should handle empty file', async () => {
      const lines: any[] = []
      for await (const line of starjsonl(fixturePath('empty'))) { lines.push(line) }
      expect(lines).to.deep.equal([])
    })
    it('should handle newline-separated JSON file', async () => {
      const lines: any[] = []
      for await (const line of starjsonl(fixturePath('goodjsonl.jsonl'))) { lines.push(line) }
      expect(lines).to.deep.equal(expectedWu)
    })
    it('should handle dual-mode JSON array file', async () => {
      const lines: any[] = []
      for await (const line of starjsonl(fixturePath('goodjsonl.l.json'))) { lines.push(line) }
      expect(lines).to.deep.equal(expectedWu)
    })
    it('should handle dual-mode JSON key-value file', async () => {
      const lines: any[] = []
      for await (const line of starjsonl(fixturePath('goodjsonkv.kv.json'))) { lines.push(line) }
      expect(lines).to.deep.equal(expectedWu)
    })
    it('should handle parse errors', async () => {
      let err: TY.ExtError = undefined!
      let lines: any[] = []
      const abspath = fixturePath('badjson')
      try {
        const generator = starjsonl(abspath)
        for await (const line of generator) { lines.push(line) }
      } catch (caught) { err = caught as TY.ExtError }
      expect((err as Error).message).to.eql(
        `Failed to parse JSON at line 3: Unterminated string in JSON at position 56 (line 1 column 57)`,
      )
      expect(err).property('extensions').to.eql({
        line:        `{"nick": "ODB",              "fullname": "Ol' Dirty Bast`,
        lineNumber:  3,
        filepath:    abspath,
        args:        { anypath: abspath },
        gist:        'parseErr',
        origmsg:     'Unterminated string in JSON at position 56 (line 1 column 57)',
      })
    })
  })

  describe('dumptext', () => {
    it('should write lines from iterable', async () => {
      const outputFile = path.join(tempDir, 'output.txt')
      const lines = ['line1', 'line2', 'line3']

      const result = await dumptext(outputFile, lines)

      expect(result).to.eql({
        barename: 'output',
        fext: '.txt',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: outputFile,
        val: result.val
      })

      const content = await fs.readFile(outputFile, 'utf8')
      expect(content).to.equal('line1\nline2\nline3\n')
    })

    it('should write lines from async iterable', async () => {
      const outputFile = path.join(tempDir, 'output.txt')
      const asyncLines = (async function* () {
        yield 'async1'
        yield 'async2'
      })()

      const result = await dumptext(outputFile, asyncLines)

      expect(result).to.eql({
        barename: 'output',
        fext: '.txt',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: outputFile,
        val: result.val
      })

      const content = await fs.readFile(outputFile, 'utf8')
      expect(content).to.equal('async1\nasync2\n')
    })

    it('should create directory if it does not exist', async () => {
      const outputFile = path.join(tempDir, 'nested', 'deep', 'output.txt')
      const lines = ['test']

      const result = await dumptext(outputFile, lines)

      expect(result).to.eql({
        barename: 'output',
        fext: '.txt',
        dirpath: path.join(tempDir, 'nested', 'deep'),
        ok: true,
        gist: 'ok',
        abspath: outputFile,
        val: result.val
      })

      const content = await fs.readFile(outputFile, 'utf8')
      expect(content).to.equal('test\n')
    })

    it('should work with Pathinfo', async () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'output',
        fext: '.txt',
        dirpath: tempDir
      }
      const lines = ['test']

      const result = await dumptext(pathinfo, lines)

      expect(result).to.eql({
        barename: 'output',
        fext: '.txt',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: path.join(tempDir, 'output.txt'),
        val: result.val
      })

      const outputFile = path.join(tempDir, 'output.txt')
      const content = await fs.readFile(outputFile, 'utf8')
      expect(content).to.equal('test\n')
    })

    it('should handle empty iterable', async () => {
      const outputFile = path.join(tempDir, 'empty.txt')
      const lines: string[] = []

      const result = await dumptext(outputFile, lines)

      expect(result).to.eql({
        barename: 'empty',
        fext: '.txt',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: outputFile,
        val: result.val
      })

      const content = await fs.readFile(outputFile, 'utf8')
      expect(content).to.equal('')
    })
  })

  describe('dumpjson', () => {
    it('should pretty print JSON object', async () => {
      const outputFile = path.join(tempDir, 'data.json')
      const data = { name: 'test', value: 42, nested: { key: 'value' } }

      const result = await dumpjson(outputFile, data)

      expect(result).to.eql({
        barename: 'data',
        fext: '.json',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: outputFile,
        val: result.val
      })

      const content = await fs.readFile(outputFile, 'utf8')
      const parsed = JSON.parse(content)
      expect(parsed).to.deep.equal(data)
      expect(content).to.include('\n  "name": "test",\n')
    })

    it('should handle primitive values', async () => {
      const outputFile = path.join(tempDir, 'primitive.json')
      const data = 'simple string'
      const result = await dumpjson(outputFile, data)

      expect(result).to.eql({
        barename: 'primitive',
        fext: '.json',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: outputFile,
        val: result.val
      })

      const content = await fs.readFile(outputFile, 'utf8')
      expect(content).to.equal('"simple string"\n')
    })

    it('should work with Pathinfo', async () => {
      const pathinfo: TY.PathinfoDNA = {
        barename: 'data',
        fext: '.json',
        dirpath: tempDir
      }
      const data = { test: true }

      const result = await dumpjson(pathinfo, data)

      expect(result).to.eql({
        barename: 'data',
        fext: '.json',
        dirpath: tempDir,
        ok: true,
        gist: 'ok',
        abspath: path.join(tempDir, 'data.json'),
        val: result.val
      })

      const outputFile = path.join(tempDir, 'data.json')
      const content = await fs.readFile(outputFile, 'utf8')
      const parsed = JSON.parse(content)
      expect(parsed).to.deep.equal(data)
    })

    it('should handle JSON stringify errors', async () => {
      const outputFile = path.join(tempDir, 'error.json')
      const circularData: any = {}
      circularData.self = circularData

      const result = await dumpjson(outputFile, circularData)

      expect(result.ok).to.be.false
      if (!result.ok) {
        expect(result.gist).to.equal('parseErr')
        expect(result.err).to.be.instanceOf(Error)
        expect(result.err!.message).to.include('Failed to stringify data to JSON')
        expect(result.origmsg).to.include('Converting circular structure to JSON')
        expect((result as any).args).to.equal(outputFile)
      }
    })
  })

  describe('type compatibility', () => {
    it('should accept Anypath type', () => {
      const stringPath: TY.Anypath = '/tmp/test.txt'
      const pathinfo: TY.Anypath = {
        barename: 'test',
        fext: '.txt',
        dirpath: '/tmp'
      }

      const stringResult = pathinfoFor(stringPath)
      const pathinfoResult = pathinfoFor(pathinfo)

      expect(stringResult).to.have.property('ok')
      expect(stringResult).to.have.property('barename')
      expect(stringResult).to.have.property('fext')
      expect(stringResult).to.have.property('dirpath')
      expect(stringResult).to.have.property('abspath')

      expect(pathinfoResult).to.have.property('ok')
      expect(pathinfoResult).to.have.property('barename')
      expect(pathinfoResult).to.have.property('fext')
      expect(pathinfoResult).to.have.property('dirpath')
      expect(pathinfoResult).to.have.property('abspath')
    })

    it('should return proper result types', () => {
      const result = pathinfoFor('/tmp/test.txt')
      expect(result).to.have.property('ok')
      expect(result).to.have.property('barename')
      expect(result).to.have.property('fext')
      expect(result).to.have.property('dirpath')
      expect(result).to.have.property('abspath')
    })
  })
})