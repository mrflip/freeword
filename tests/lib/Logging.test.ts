import { expect } from 'chai'
import { UF } from '@freeword/meta'

describe('Logging', () => {
  describe('getLogger', () => {
    it('should return a logger', () => {
      const logger = UF.getLogger({})
      expect(logger).to.include.keys(['trace', 'debug', 'info', 'warn', 'error'])
      expect(logger).to.equal(console)
    })
  })
})