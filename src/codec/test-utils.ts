import assert from 'node:assert'
import type { AsciiByte, Codec, Num1_300 } from './common.ts'

const rand_in_range = (min: number, max: number) => () =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const rand_arr_of_num1_300 = (length: number) =>
  Array.from({ length }, rand_in_range(1, 300))

export const encode_decode_cycle =
  (codec: Codec<Num1_300[], AsciiByte[], number[]>) =>
  (input: number[]) =>
  () => {
    const encoded_bytes = codec.encode(input as Num1_300[])
    const actual = codec.decode(encoded_bytes)
    assert.deepStrictEqual(actual, input)
  }
