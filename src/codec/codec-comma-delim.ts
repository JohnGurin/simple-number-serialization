import type { AsciiByte, Codec, Digit, Num1_300, Positive } from './common.js'

const COMMA_CHAR_CODE = ','.charCodeAt(0) as AsciiByte
const ZERO_CHAR_CODE_OFFSET = '0'.charCodeAt(0)
const char_code = (digit: Digit) => (digit + ZERO_CHAR_CODE_OFFSET) as AsciiByte

export const digits_from_positive_number = (n: Positive): Digit[] => {
  const digits = []
  let num: number = n
  while (num > 0) {
    digits.unshift(num % 10)
    num = (num / 10) | 0
  }
  return digits as Digit[]
}

export const codec_comma_delim: Codec<Num1_300[], AsciiByte[], number[]> = {
  encode: (ns: Num1_300[]): AsciiByte[] => {
    const encoded = []
    for (const n of ns) {
      encoded.push(COMMA_CHAR_CODE)
      for (const byte of digits_from_positive_number(n).map(char_code)) {
        encoded.push(byte)
      }
    }
    encoded.shift()
    return encoded
  },

  decode: (ns: AsciiByte[]): number[] => {
    let current = 0
    const decoded = []
    for (const n of ns) {
      if (n === COMMA_CHAR_CODE) {
        decoded.push(current)
        current = 0
      } else {
        current = current * 10 + (n - ZERO_CHAR_CODE_OFFSET)
      }
    }
    decoded.push(current)
    return decoded
  },
}
