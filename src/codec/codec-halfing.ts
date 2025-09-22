import type { AsciiByte, Brand, Codec, Num1_300 } from './common.ts'

type Bits = { value: number; bits_left: number }
type SourceBits = Bits & Brand<'SourceBits'>

type FrameCfg = {
  is_head?: true
  frame_mask: number
  head_mask: number
  payload_bit_size: number
  frame_bit_size: number
}

const HEAD_CFG: FrameCfg = {
  is_head: true,
  frame_mask: 0b0,
  head_mask: 0b0,
  payload_bit_size: 2,
  frame_bit_size: 2,
}

const FRAME_5: FrameCfg = {
  frame_mask: 0b0,
  head_mask: 0b0,
  payload_bit_size: 4,
  frame_bit_size: 5,
}
const FRAME_9: FrameCfg = {
  frame_mask: 0b10 << 7,
  head_mask: 0b10,
  payload_bit_size: 7,
  frame_bit_size: 9,
}
const FRAME_11: FrameCfg = {
  frame_mask: 0b11 << 9,
  head_mask: 0b11,
  payload_bit_size: 9,
  frame_bit_size: 11,
}

const FRAME_CONFIGS = [FRAME_5, FRAME_9, FRAME_11]
const ASCII_BYTE_LENGTH = 7

export const source_bits = (n: Num1_300): SourceBits => {
  /** biome-ignore lint/style/noNonNullAssertion: n argument is sanitized */
  const frame_config = FRAME_CONFIGS.find(cfg => n < 1 << cfg.payload_bit_size)!
  return {
    value: frame_config.frame_mask | n,
    bits_left: frame_config.frame_bit_size,
  } as SourceBits
}

const mask = (bits_count: number) => (1 << bits_count) - 1

const roll = (source: SourceBits, target: Bits, sink: (n: number) => void) => {
  let offset = source.bits_left - target.bits_left
  while (offset >= 0) {
    sink(target.value | (source.value >> offset))

    /** reset target */
    target.value = 0
    target.bits_left = ASCII_BYTE_LENGTH

    source.value &= mask(offset)
    source.bits_left = offset

    offset = source.bits_left - target.bits_left
  }
  offset = -offset
  target.value |= source.value << offset
  target.bits_left = offset
}

export const codec_halfing: Codec<Num1_300[], AsciiByte[], number[]> = {
  encode: (ns: Num1_300[]) => {
    const encoded: AsciiByte[] = []
    const push = (n: number) => encoded.push(n as AsciiByte)

    const target = {
      value: 0,
      bits_left: ASCII_BYTE_LENGTH,
    }
    for (const n of ns) roll(source_bits(n), target, push)

    if (target.value) push(target.value)
    return encoded
  },

  decode: (ns: AsciiByte[]) => {
    const decoded = []
    let value_left = 0
    let bits_left = 0
    let cfg = HEAD_CFG
    for (const n of ns) {
      bits_left += ASCII_BYTE_LENGTH
      value_left = (value_left << ASCII_BYTE_LENGTH) | n
      while (bits_left >= cfg.frame_bit_size) {
        const offset = bits_left - cfg.frame_bit_size
        const value = (value_left >> offset) & mask(cfg.payload_bit_size)
        if (cfg.is_head)
          cfg = FRAME_CONFIGS.find(c => value === c.head_mask) || FRAME_5
        else {
          value_left &= mask(offset)
          bits_left = offset
          value && decoded.push(value)
          cfg = HEAD_CFG
        }
      }
    }
    if (value_left > 0) {
      value_left = value_left << (cfg.frame_bit_size - bits_left)
      decoded.push(value_left & mask(cfg.payload_bit_size))
    }
    return decoded
  },
}
