const BrandTypeId: unique symbol = Symbol()
export interface Brand<in out K extends string | symbol> {
  readonly [BrandTypeId]: {
    readonly [k in K]: K
  }
}

export type Codec<I, A, O = I> = {
  encode: (ns: I) => A
  decode: (ns: A) => O
}

export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export const is_digit = (n: number): n is Digit => n >= 0 && n <= 9

export type NonNegative = number & Brand<'NonNegative'>
export const is_non_negative = (n: number): n is NonNegative => n >= 0

export type Positive = NonNegative & Brand<'Positive'>
export const is_positive = (n: number): n is Positive => n > 0

export type Num1_300 = Positive & AsciiByte & Brand<'Num_1_300'>
export const is_num1_300 = (n: number): n is Num1_300 => n >= 1 && n <= 300
export const new_num1_300_arr = () => [] as Num1_300[]

export type AsciiByte = NonNegative & Brand<'AsciiByte'>
export const is_ascii_byte = (n: number): n is AsciiByte => n >= 0 && n <= 127

export const codec_ascii: Codec<AsciiByte[], string> = {
  encode: (ns: AsciiByte[]): string =>
    new TextDecoder('ascii').decode(Buffer.from(ns)),
  decode: (ns: string): AsciiByte[] =>
    Array.from(new TextEncoder().encode(ns)) as AsciiByte[],
}

export function assertOrThrow<T>(
  arg: unknown,
  /** biome-ignore lint/suspicious/noExplicitAny: guard must be versatile */
  guard: (arg: any) => arg is T,
): asserts arg is T {
  if (!guard(arg)) {
    const guard_name = guard.name || `[${guard.toString()}]`
    throw Error(`${arg} is not ${guard_name}`)
  }
}
