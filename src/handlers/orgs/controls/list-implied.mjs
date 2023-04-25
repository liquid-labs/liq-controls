import createError from 'http-errors'

import { determineImpliedProject } from '@liquid-labs/liq-projects-lib'

import { doListControls, getControlsListEndpointParameters } from './_lib/list-lib'

const { help, method, parameters } = getControlsListEndpointParameters({ workDesc : 'named' })

const path = ['orgs', 'controls', 'list']

const func = ({ app, cache, model, reporter }) => async(req, res) => {
  reporter = reporter.isolate()

  const cwd = req.get('X-CWD')
  if (cwd === undefined) {
    throw createError.BadRequest("Called 'work document' with implied work, but 'X-CWD' header not found.")
  }
  const [orgKey] = determineImpliedProject({ currDir : cwd }).split('/')

  await doListControls({ app, cache, model, orgKey, reporter, req, res })
}

export { func, help, method, parameters, path }
