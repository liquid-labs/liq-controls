import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import yaml from 'js-yaml'

const getQuestionControls = async({ app, controlsName, projectName, reporter }) => {
  const { packageJSON, projectPath } = await app.ext._liqProjects.playgroundMonitor.getProjectData(projectName)

  const packageControlsPath = fsPath.join(projectPath, 'controls', controlsName + '.qcontrols.yaml')
  let controlsContent
  // load controlsContent
  reporter.log(`attempting to load '${controlsName}' controls from: ${packageControlsPath}...`)
  try {
    controlsContent = await fs.readFile(packageControlsPath, { encoding : 'utf8' })
    reporter.log('  success')

    const controlsSpec = yaml.load(controlsContent)
    return controlsSpec
  }
  catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    } // else, no problem, just doesn't define the control at the package level
    reporter.log('  not found')
    let [orgKey, basename] = projectName.split('/')
    if (basename === undefined) {
      // then we have an unscoped project and we look at the package.json to determine the org key
      orgKey = packageJSON._comply?.orgKey
      if (orgKey === undefined) {
        throw new Error("Did not find expected '_comply.orgKey' in the 'package.json' file. This value must be defined for unscoped packages.")
      }
    }
    const org = app.ext._liqOrgs.orgs[orgKey]
    if (org !== undefined) {
      const controlsSpec = org.controls.getControl(controlsName)

      return controlsSpec
    }
  } // controlsContent load section

  return undefined
}

export { getQuestionControls }
