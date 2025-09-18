import assert from 'node:assert'
import { describe, it } from 'node:test'

import { codec_halfing, source_bits } from './codec-halfing.js'
import type { AsciiByte, Num1_300 } from './common.js'
import { encode_decode_cycle, rand_arr_of_num1_300 } from './test-utils.js'

const frame_data = (value: number, bits_left: number) => ({
  value,
  bits_left,
})

const encodes = (input: number[], expected: number[]) => {
  const actual = codec_halfing.encode(input as Num1_300[])
  assert.deepStrictEqual(actual, expected)
}
const decodes = (input: number[], expected: number[]) => {
  const actual = codec_halfing.decode(input as AsciiByte[])
  assert.deepStrictEqual(actual, expected)
}

describe('codec-halfing', () => {
  it('encodes [1..300] number into suitable frame data', () => {
    const vars = [
      /* 4-bit numbers */
      { arg: 0b0001, expected: frame_data(0b0_0001, 5) },
      { arg: 0b0011, expected: frame_data(0b0_0011, 5) },
      { arg: 0b0111, expected: frame_data(0b0_0111, 5) },
      { arg: 0b1111, expected: frame_data(0b0_1111, 5) },
      /* 7-bit numbers */
      { arg: 0b0011111, expected: frame_data(0b10_0011111, 9) },
      { arg: 0b0111111, expected: frame_data(0b10_0111111, 9) },
      { arg: 0b1111111, expected: frame_data(0b10_1111111, 9) },
      /* 9-bit numbers */
      { arg: 0b011111111, expected: frame_data(0b11_011111111, 11) },
      { arg: 0b100000000, expected: frame_data(0b11_100000000, 11) },
    ]
    for (const { arg, expected } of vars) {
      const actual = source_bits(arg as Num1_300)
      assert.deepStrictEqual(actual, expected, `number: ${arg.toString(2)}`)
    }
  })

  it('encodes -> 4-bit number into 5-bit `0b0`-headed frame then to ASCII byte tailed with zeros', () =>
    encodes([0b1011], [0b0_1011_00]))

  it('encodes -> 7-bit number into 9-bit `0b10`-headed frame then to two ASCII bytes', () =>
    encodes([0b1011111], [0b10_10111, 0b11_00000]))

  it('encodes -> 9-bit number into 11-bit `0b11`-headed frame then to two ASCII bytes', () =>
    encodes([0b100101100], [0b11_10010, 0b1100_000]))

  it('encodes -> drops last ASCII byte if all bits are zeros', () =>
    encodes([0b10001_0000], [0b11_10001 /*, 0b0000_000 */]))

  it('encodes -> uses free bits of a previous byte', () =>
    encodes([0b11011_00, 0b100_1111], [0b10_11011, 0b00_10_100, 0b1111_000]))
  //                                 head^^         head^^

  it('decodes <- 4-bit number', () => decodes([0b0_1011_00], [0b1011]))

  it('decodes <- 7-bit number', () =>
    decodes([0b10_10011, 0b11_00000], [0b1001111]))

  it('decodes <- 9-bit number', () =>
    decodes([0b11_10010, 0b1100_000], [0b100101100]))

  it('decodes <- adds zeros at the end of the input if needed', () =>
    decodes([0b11_10001 /* 0b0000_000 */], [0b10001_0000]))
  //       head^^            ^^^^zeros to be added

  it('decodes <- payload split', () =>
    decodes([0b10_11011, 0b00_10_100, 0b1111_000], [0b11011_00, 0b100_1111]))
  //       head^^         head^^

  it('decodes <- head split', () =>
    decodes(
      [0b11_10000, 0b0011_10_1, 0b000111_1, 0b0_100111, 0b1_000000],
      // ^^head       head^^         head^----^head
      [0b10000_0011, 0b100_0111, 0b100_1111],
    ))

  it(
    'encode - decode cycle equals input',
    encode_decode_cycle(codec_halfing)(rand_arr_of_num1_300(100)),
  )
  it(
    'encode - decode cycle equals input, drops last zeros',
    encode_decode_cycle(codec_halfing)([16, 16, 16, 16, 16]),
  )
})
