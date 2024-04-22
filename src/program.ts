import { readFileE, FileService, NeededContext, File2Context, FileTag } from './file_reader'
import { Effect as E, pipe, Match as M, Context } from 'effect'

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

const p3 = pipe(
  E.Do,
  E.bind('file', () => E.succeed(Context.get(File2Context,FileTag))),
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

const runnable = E.provide(p3, FileService.Live)

const result = await E.runPromise(runnable)
console.log('result', result)
