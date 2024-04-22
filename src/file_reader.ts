import { readFile } from 'node:fs/promises'
import { Effect as E, Context, Layer, Effect } from 'effect'

export class FileReadError {
  readonly _tag = 'FileReadError'
}

export const reader = async () => {
  const contents = await readFile('./files/1.txt', { encoding: 'utf8' })
  return contents
}

export const readFileE = (filePath: string) =>
  E.tryPromise({
    try: () => {
      return readFile(filePath, { encoding: 'utf8' })
    },
    catch: () => {
      return new FileReadError()
    },
  })
const gImpl = {
  readFileE: readFileE,
  // writeFile: readFileE,
} as const

const gImplWrite = {
  // readFileE: readFileE,
  writeFile: readFileE,
} as const

export const impl = E.succeed(gImpl)
type FileServiceType = E.Effect.Success<typeof impl>

export class FileService extends Context.Tag('File')<
  File,
  E.Effect.Success<typeof impl>
>() {
   static Live: Layer.Layer<File, never, never> = Layer.effect(FileService, impl)

   static Fake: Layer.Layer<File, never, never> = Layer.effect(FileService, impl)
}

// To create context -> Service type and unique identifier is needed
export let FileTag = Context.GenericTag<FileServiceType>("File2")
export let File2Context = Context.make(FileTag,gImpl)

let File3Tag = Context.GenericTag<typeof gImplWrite>("File3")
let File3Service = Context.make(File3Tag,gImplWrite)

let mergedContext = Context.merge(File2Context)(File3Service)
export let NeededContext = Context.get(mergedContext,FileTag)

function test() {
  if(10 == 10) {
    if(11 == 11) {
      console.log("true")
    }
  }
}
