import { Uri, ExtensionContext, workspace, commands } from 'coc.nvim'
import path from 'path'
import fs from 'fs'
import util from 'util'

let bufnr: number
let { nvim } = workspace

export async function activate(context: ExtensionContext): Promise<void> {
  let { subscriptions } = context

  subscriptions.push(commands.registerCommand('script.run', runScript))
}

async function resolveRoot(): Promise<string> {
  let document = await workspace.document
  let cwd: string
  if (document) {
    let u = Uri.parse(document.uri)
    cwd = u.scheme == 'file' ? path.dirname(u.fsPath) : workspace.cwd
  } else {
    cwd = workspace.cwd
  }
  let dir = await findUp(['package.json'], cwd)
  return dir || cwd
}

async function existAsync(filepath: string): Promise<boolean> {
  let stat: fs.Stats = null
  try {
    stat = await util.promisify(fs.stat)(filepath)
  } catch (e) {
    return false
  }
  return stat && stat.isFile()
}

async function findUp(filenames: string[], cwd: string): Promise<string> {
  const { root } = path.parse(cwd)
  while (cwd != root) {
    for (let file of filenames) {
      let p = path.join(cwd, file)
      let exists = await existAsync(p)
      if (exists) return cwd
        cwd = path.dirname(cwd)
    }
  }
  return null
}

async function runScript(cmd: string): Promise<void> {
  let cwd = await resolveRoot()
  if (bufnr) {
    await nvim.command(`silent! bd! ${bufnr}`)
  }
  let document = await workspace.document
  let config = workspace.getConfiguration('jest', document ? document.uri : undefined)
  let position = config.get<string>('terminalPosition')
  bufnr = await nvim.call('coc#util#open_terminal', {
    autoclose: 0,
    keepfocus: 1,
    position,
    cwd,
    cmd
  })
}
