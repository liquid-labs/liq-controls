import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import yaml from 'js-yaml'

const getQuestionControls = async({ app, controlsName, projectName, reporter }) => {
  const { projectPath } = app.ext._liqProjects.playgroundMonitor.getProjectData(projectName)

  const packageControlsPath = fsPath.join(projectPath, 'controls', controlsName + '.qcontrols.yaml')
  let controlsContent
  // load controlsContent
  reporter.log(`attempting to load '${controlsName}' controls from: ${packageControlsPath}...`)
  try {
    controlsContent = await fs.readFile(packageControlsPath, { encoding : 'utf8' })
    reporter.log('  success')
  }
  catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    } // else, no problem, just doesn't define the control at the package level
    reporter.log('  not found')
    const [orgKey] = projectName.split('/')
    const org = app.ext._liqOrgs.orgs[orgKey]
    if (org !== undefined) {
      const { projectPath: orgProjectPath } = org
      const orgControlsPath =
        fsPath.join(orgProjectPath, 'data', 'org', 'controls', controlsName + '.qcontrols.yaml')
      reporter.log(`attempting to load '${controlsName}' controls from: ${orgControlsPath}...`)
      try {
        controlsContent = await fs.readFile(orgControlsPath)
        reporter.log('  success')
      }
      catch (e) {
        if (e.code !== 'ENOENT') {
          throw (e)
        }
        reporter.log('  not found')
      }
    }
  } // controlsContent load section

  if (controlsContent === undefined) {
    return undefined
  } // else

  const controlsSpec = yaml.load(controlsContent)

  return controlsSpec
}

export { getQuestionControls }
