import { doListControls, getControlsListEndpointParameters } from './_lib/list-lib'

const { help, method, parameters } = getControlsListEndpointParameters({ workDesc : 'named' })

const path = ['orgs', ':orgKey', 'controls', 'list']

const func = ({ app, cache, model, reporter }) => async(req, res) => {
  const { orgKey } = req.vars

  await doListControls({ app, cache, model, orgKey, reporter, req, res })
}

export { func, help, method, parameters, path }
