import baseSchema from './baseSchema'

describe('baseSchema', () => {
  const validBase = {
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('createdAt と updatedAt', () => {
    it('日付型のcreatedAtとupdatedAtを受け入れること', () => {
      expect(() => {
        baseSchema.parse({
          ...validBase,
          createdAt: new Date(2023, 0, 1),
          updatedAt: new Date(2023, 0, 2),
        })
      }).not.toThrow()
    })

    it('日付型でないcreatedAtを拒否すること', () => {
      expect(() => {
        baseSchema.parse({
          ...validBase,
          createdAt: 'not-a-date',
        })
      }).toThrow()
    })

    it('日付型でないupdatedAtを拒否すること', () => {
      expect(() => {
        baseSchema.parse({
          ...validBase,
          updatedAt: 'not-a-date',
        })
      }).toThrow()
    })
  })
})
