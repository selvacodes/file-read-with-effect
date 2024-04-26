import {
  readFileE,
  File2Context,
  File2Tag,
  gImpl,
  gImpl2,
  File2Service,
} from './file_reader'
import {
  Effect as E,
  pipe,
  Match as M,
  Context,
  Option as O,
  Effect,
} from 'effect'

const isEmpty = (x: string) => x != ''

const addFileBasePath = (x: string) => `./files/${x}`

const splitWithNewLine = (x: string) => x.split('\n')

const rootFilePath = './files/file_list.txt'

const readRootFile = readFileE(rootFilePath)

const program = pipe(
  readRootFile,
  E.map((x) => splitWithNewLine(x).filter(isEmpty).map(addFileBasePath)),
  E.flatMap((files) => E.allSuccesses(files.map(readFileE))),
  E.map((fileContents) =>
    fileContents.map((x) => {
      return splitWithNewLine(x).filter(isEmpty)
    })
  )
)

let a = pipe(
  E.serviceOption(File2Tag),
  E.map((x) => O.getOrThrow(x))
)
const p3 = pipe(
  E.Do,
  // E.bind('file', () => a),
  E.bind('file', () => E.succeed(Context.get(File2Context, File2Tag))),
  E.bind('rootFileContents', ({ file }) => {
    return file.readFileE(rootFilePath)
  }),
  E.let('filesList', ({ rootFileContents }) => {
    return splitWithNewLine(rootFileContents)
      .filter(isEmpty)
      .map(addFileBasePath)
  }),
  E.bind('allFileContents', ({ file, filesList }) => {
    return E.allSuccesses(filesList.map(file.readFileE))
  }),
  E.let('allContents', ({ allFileContents }) => {
    return allFileContents.map((x) => {
      return splitWithNewLine(x).filter(isEmpty)
    })
  })
)
const p4 = Effect.gen(function* (_) {
  let file = yield* _(E.succeed(File2Service))
  let rootFileContents = yield* _(file.readFileE(rootFilePath))
  let filesList = splitWithNewLine(rootFileContents)
    .filter(isEmpty)
    .map(addFileBasePath)
  let fileContentEffect = E.all(filesList.map(file.readFileE))
  let allFileContents = yield* _(fileContentEffect)
  let toReturn = allFileContents.map((x) => {
    return splitWithNewLine(x).filter(isEmpty)
  })
  return toReturn
})
const runnable = E.provideService(File2Tag, gImpl2)(p3)

const result = await E.runPromise(runnable)
console.log('result', result)
