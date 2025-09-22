import assert from 'node:assert'
import { describe, it } from 'node:test'
import { codec_comma_delim } from './codec-comma-delim.ts'
import { codec_halfing } from './codec-halfing.ts'
import type { Num1_300 } from './common.ts'
import { rand_arr_of_num1_300 } from './test-utils.ts'

const TARGET_RATIO_PERCENT = 50

const compare = (title: string, ns: number[]) => {
  const input = ns as Num1_300[]
  const encoded_reference = codec_comma_delim.encode(input)
  const encoded_target = codec_halfing.encode(input)
  const ratio = (encoded_target.length / encoded_reference.length) * 100
  it(`${title} ${ratio.toFixed(2)}%`, () =>
    assert(ratio <= TARGET_RATIO_PERCENT))
}

describe(`\`codec-halfing\` encodes to ratio less than or equal ${TARGET_RATIO_PERCENT}% of \`codec-comma-delim\``, () => {
  compare('   5 4-bit single digit numbers', [1, 3, 4, 7, 9])
  compare('   5 4-bit double digit numbers', [15, 14, 13, 12, 10])
  compare('   5 7-bit double digit numbers', [99, 99, 99, 99, 99])
  compare('   5 7-bit triple digit numbers', [127, 125, 110, 105, 100])
  compare('   5 9-bit triple digit numbers', [128, 130, 200, 260, 300])
  compare(' 100 4-bit single digit numbers', Array(1000).fill(1))
  compare(' 100 7-bit double digit numbers', Array(1000).fill(22))
  compare(' 100 9-bit double digit numbers', Array(5).fill(99))
  compare('1000 4-bit single digit numbers', Array(1000).fill(1))
  compare('1000 7-bit double digit numbers', Array(1000).fill(22))
  compare('1000 9-bit double digit numbers', Array(5).fill(99))
  compare('   5 random numbers', rand_arr_of_num1_300(5))
  compare(' 100 random numbers', rand_arr_of_num1_300(100))
  compare('1000 random numbers', rand_arr_of_num1_300(1000))
})
