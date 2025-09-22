import { describe, it } from 'node:test'

import assert from 'node:assert'
import {
  codec_comma_delim,
  digits_from_positive_number,
} from './codec-comma-delim.ts'
import {
  type Num1_300,
  assertOrThrow,
  codec_ascii,
  is_positive,
} from './common.ts'
import { encode_decode_cycle, rand_arr_of_num1_300 } from './test-utils.ts'

describe('codec-comma-delim', () => {
  it(digits_from_positive_number.name, () => {
    const vars = [
      { arg: 1, expected: [1] },
      { arg: 56, expected: [5, 6] },
      { arg: 123, expected: [1, 2, 3] },
    ]
    for (const { arg, expected } of vars) {
      assertOrThrow(arg, is_positive)
      const actual = digits_from_positive_number(arg)
      assert.deepStrictEqual(actual, expected, `number: ${arg}`)
    }
  })

  it('enocdes', () => {
    const input = [1, 2, 3, 4, 5] as Num1_300[]
    const expected = `${input}`

    const encoded_bytes = codec_comma_delim.encode(input)
    const actual = codec_ascii.encode(encoded_bytes)

    assert.equal(encoded_bytes.length, expected.length)
    assert.strictEqual(actual, expected)
  })

  it('decodes', () => {
    const expected = [1, 3, 10, 55, 129]

    const input = `${expected}`
    const actual = codec_comma_delim.decode(codec_ascii.decode(input))

    assert.deepStrictEqual(actual, expected)
  })

  it(
    'encode - decode cycle equals input',
    encode_decode_cycle(codec_comma_delim)(rand_arr_of_num1_300(100)),
  )
})
