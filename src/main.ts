import { argv, exit, stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'
import {
  codec_ascii,
  codec_comma_delim,
  codec_halfing,
  is_num1_300,
  new_num1_300_arr,
} from '@/codec/index.js'

const usage_exit = () => {
  console.info(`usage: ${COMMANDS.join('|')} ${CODECS.join('|')}`)
  console.info('echo 1 2 3 4 5 | npm run cli enc s')
  exit()
}

const COMMANDS = ['encode', 'decode']
const CODECS = ['simple', 'halfing']

let [cmd, codec] = argv.slice(2)
cmd = COMMANDS.find(c => cmd && c.startsWith(cmd))
codec = CODECS.find(c => codec && c.startsWith(codec))

if (!cmd || !codec) usage_exit()

const encode = (() => {
  switch (`${cmd} ${codec}`) {
    case 'encode simple':
      return codec_comma_delim.encode
    case 'encode halfing':
      return codec_halfing.encode
    default:
      return
  }
})()

const decode = (() => {
  switch (`${cmd} ${codec}`) {
    case 'decode simple':
      return codec_comma_delim.decode
    case 'decode halfing':
      return codec_halfing.decode
    default:
      return
  }
})()

const readline = createInterface({
  input: stdin,
  output: stdout,
  terminal: false,
})

const DELIM = ' '

encode &&
  (() => {
    let numbers = new_num1_300_arr()
    readline.on('line', line => {
      const line_items = line.split(DELIM).map(Number).filter(is_num1_300)
      numbers = numbers.concat(line_items)
    })

    readline.on('close', () => {
      const bytes = encode(numbers)
      const output = codec_ascii.encode(bytes)
      print(output)
    })
  })()

decode &&
  (() => {
    let content = ''
    readline.on('line', line => {
      content += line
    })

    readline.on('close', () => {
      const bytes = codec_ascii.decode(content)
      const output = decode(bytes).join(DELIM)
      print(output)
    })
  })()

const print = (output: string) => {
  if (stdout.isTTY) {
    console.log('======')
    console.log(output)
    console.log('======')
  } else {
    stdout.write(output)
  }
}
