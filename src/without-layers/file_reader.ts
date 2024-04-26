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
export const gImpl = {
  readFileE: readFileE,
  // writeFile: readFileE,
} as const

export const gImpl2 = {
  readFileE: readFileE,
  // writeFile: readFileE,
} as const


export const impl = E.succeed(gImpl)
type FileServiceType = typeof gImpl

// To create context -> Service type and unique identifier is needed
export let File2Tag = Context.GenericTag<FileServiceType>("File2")
export let File2Context = Context.make(File2Tag,gImpl)
export let File2Service = Context.get(File2Context,File2Tag)

