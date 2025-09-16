# Serialize numbers 1..300
This project implements a custom number serialization algorithm  
that compresses integers in the range **1–300** into an ASCII-based format.  
The serializer guarantees at least **50% reduction** in size  
compared to a simple comma-separated representation.

## Requirements
- Input: integers in the range **1–300**
- Reference serializer: joins numbers with commas (e.g., `10,20,30`)
- Target serializer must produce an output that is **≤ 50% the size** of the reference serializer
- Minimum input: **5 numbers**
- Output encoding: **7-bit ASCII characters**

## Reference serializer output sizes
For the smallest inputs, the simple (comma-joined) serializer produces:
```
1,1,1,1,1           →  9 characters
10,10,10,10,10      → 14 characters
100,100,100,100,100 → 19 characters
```
Target serializer must therefore produce:
```
≤ 4 characters ( 9 / 2)
≤ 7 characters (14 / 2)
≤ 8 characters (19 / 2)
```
Each number is encoded as a **frame**, consisting of:
- `head` (prefix bits indicating the payload size)
- `payload` (the number itself, in fixed-width binary)

Frames are then concatenated and split into **7-bit ASCII characters** for output.

### Frame Types
| Head  | Bit size | Range     | Frame size |
|-------|----------|-----------|------------|
| `0b0` | 4-bit    | 1 – 15    | 5 bits     |
| `0b10`| 7-bit    | 16 – 127  | 9 bits     |
| `0b11`| 9-bit    | 128 – 300 | 11 bits    |

## Examples

### Encoding Number 9
- Range: `1–15` → use **4-bit payload**
- Head: `0b0`
- Payload: `1001` (binary for 9)
- Frame: `01001` (5 bits)

### Ratios for smallest inputs
| Input Sequence      | Frames    | Total Bits | Chars | Ratio         |
|---------------------|-----------|------------|-------|---------------|
| 9,9,9,9,9           | 5 × 5-bit | 25 bits    | 4     | 4 / 9  = 0.45 |
| 99,99,99,99,99      | 5 × 9-bit | 45 bits    | 7     | 7 / 14 = 0.50 |
| 299,299,299,299,299 | 5 × 9-bit | 45 bits    | 7     | 7 / 19 = 0.37 |

## Install
Requirements: `node >= 24.x`
```
npm install
npm test
```

## CLI usage
```
$ npm run cli
usage: encode|decode simple|halfing
```
```
$ echo 1 2 3 4 5 | npm run cli encode simple
```
