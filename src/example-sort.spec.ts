import { it } from 'node:test'
import FC from 'fast-check'
import assert from 'node:assert'
import { sortNumbersAscending } from './example-sort.js'

it('should sort numeric elements from the smallest to the largest one', () => {
  FC.assert(
    FC.property(FC.array(FC.integer()), data => {
      const sortedData = sortNumbersAscending(data)
      for (let i = 1; i < data.length; ++i)
        // biome-ignore lint/style/noNonNullAssertion: _
        assert(sortedData[i - 1]! <= sortedData[i]!)
    }),
  )
})
