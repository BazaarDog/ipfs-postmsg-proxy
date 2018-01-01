import createFilesAdd from './add'
import createFilesCat from './cat'
import createFilesGet from './get'
import createFilesLs from './ls'

export default function (opts) {
  return Object.assign(
    createFilesAdd(opts),
    createFilesCat(opts),
    createFilesGet(opts),
    createFilesLs(opts)
  )
}
