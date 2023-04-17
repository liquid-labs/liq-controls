import createError from 'http-errors'

import { commonOutputParams, formatOutput } from '@liquid-labs/liq-handlers-lib'

const allFields = ['controlSet', 'name', 'source', 'description']
const defaultFields = ['controlSet', 'name']

const reIndexControls = (controls) => {
  return controls.reduce((acc, c) => {
    if (!(c.controlSet in acc)) {
      acc[c.controlSet] = []
    }
    acc[c.controlSet].push(c)
    return acc
  }, {})
}

const mdFormatter = ({ data, title, fields }) => {
  let md = `# ${title}\n\n`
  for (const [controlSetName, controls] of Object.entries(reIndexControls(data))) {
    md += `## ${controlSetName}\n\n`
    for (const { name, description, source } of controls) {
      md += `- ${name}: ${description} (from '${source}')\n`
      md += (fields.includes('source') ? ` (from '${source}')` : '') + '\n'
    }
  }

  return md
}

const textFormatter = ({ data, fields }) => {
  let text = ''
  for (const [controlSetName, controls] of Object.entries(reIndexControls(data))) {
    if (text !== '') { text += '\n' }
    text += controlSetName + '\n'
    for (const { name, description, source } of controls) {
      text += `- ${name}: ${description}`
      text += (fields.includes('source') ? ` (from '${source}')` : '') + '\n'
    }
  }

  return text
}

const terminalFormatter = ({ data, fields }) => {
  let text = ''
  for (const [controlSetName, controls] of Object.entries(reIndexControls(data))) {
    if (text !== '') { text += '\n' }
    text += `<h2>${controlSetName}<rst>\n`
    for (const { name, description, source } of controls) {
      text += `- <em>${name}<rst>: ${description}`
      text += (fields.includes('source') ? ` (from <bold>${source}<rst>)` : '') + '\n'
    }
  }

  return text
}

const doListControls = ({ app, cache, model, orgKey, reporter, req, res }) => {
  const org = model.orgs[orgKey]
  if (org === undefined) {
    throw createError.NotFound(`No such org '${orgKey}'.`)
  }

  const data = []
  for (const [controlSetName, sourcedControlSets] of Object.entries(org.innerState.controlsMap).filter(([k]) => !k.startsWith('_'))) {
    for (const [sourceKey, controlData] of Object.entries(sourcedControlSets)) {
      const [sourceOrg, sourceProject] = sourceKey.split('/')
      const source = sourceOrg + '/' + sourceProject
      for (const { name, description } of controlData.controls) {
        data.push({ controlSet : controlSetName, name, source, description })
      }
    }
  }
  data.sort((a, b) => a.controlSet.localeCompare(b.controlSet) || a.name.localeCompare(b.name))

  formatOutput({
    basicTitle : `${orgKey} Controls`,
    data,
    allFields,
    defaultFields,
    mdFormatter,
    terminalFormatter,
    textFormatter,
    reporter,
    req,
    res,
    ...req.vars
  })
}

const getControlsListEndpointParameters = ({ workDesc }) => {
  const help = {
    name        : 'orgs controls list',
    summary     : `Lists controls for the ${workDesc} organization.`,
    description : `Lists the controls loaded into the ${workDesc} organization.`
  }

  const method = 'get'

  const parameters = commonOutputParams()

  return { help, method, parameters }
}

export { doListControls, getControlsListEndpointParameters }
