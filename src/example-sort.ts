const ascent = (a: number, b: number) => a - b

export const sortNumbersAscending = (arr: number[]) => {
  arr.sort(ascent)
  return arr
}
