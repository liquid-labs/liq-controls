/* global afterAll afterEach beforeAll describe expect jest test */
import * as fsPath from 'node:path'

import request from 'supertest'

import { appInit, model, Reporter } from '@liquid-labs/liq-core'

const logs = []
const errors = []
const reporter = new Reporter({ silent : true })
reporter.log = jest.fn((msg) => { logs.push(msg) })
reporter.error = jest.fn((msg) => { errors.push(msg) })

const LIQ_PLAYGROUND_PATH = fsPath.resolve(__dirname, 'data', 'playgroundA')
const projectA01Path = fsPath.resolve(LIQ_PLAYGROUND_PATH, 'orgA', 'projectA01')
// const controlsMapPath = fsPath.resolve(LIQ_PLAYGROUND_PATH, 'orgA', 'projectA01', 'data', 'orgs', 'controlsMap.json')
const expectedControlsMap = [{ controlSet : 'project-create-controls', name : 'project-uses-database-queries' }]
const pkgRoot = fsPath.resolve(__dirname, '..', '..', '..', '..', '..')
// const pkgPath = fsPath.join(pkgRoot, 'package.json')
// const packageJSON = JSON.parse(readFileSync(pkgPath, { encoding : 'utf8' }))

describe('GET:/orgs/:orgKey/controls/list and GET:/orgs/controls/list', () => {
  let app
  let cache

  beforeAll(async() => {
    model.initialize({ LIQ_PLAYGROUND_PATH, reporter });
    ({ app, cache } = await appInit({ model, skipCorePlugins : true, pluginDirs : [pkgRoot], reporter }))
  })

  afterEach(() => {
    logs.splice(0, logs.length)
    errors.splice(0, errors.length)
  })

  afterAll(() => { cache.release() }) /* cache has timers that must be stopped */

  test('will list named org controls', async() => {
    const { body, headers, status } = await request(app)
      .get('/orgs/orgA/controls/list') // it reads weird, but this MUST go first
      .set('Accept', 'application/json')

    expect(status).toBe(200)
    expect(errors).toHaveLength(0)
    expect(headers['content-type']).toMatch(/application\/json/)
    expect(body).toBeTruthy()
    expect(body).toStrictEqual(expectedControlsMap)
  })

  test('will list implicit org controls', async() => {
    const { body, headers, status } = await request(app)
      .get('/orgs/orgA/controls/list') // it reads weird, but this MUST go first
      .set('Accept', 'application/json')
      .set('X-CWD', projectA01Path)

    expect(status).toBe(200)
    expect(errors).toHaveLength(0)
    expect(headers['content-type']).toMatch(/application\/json/)
    expect(body).toBeTruthy()
    expect(body).toStrictEqual(expectedControlsMap)
  })
})
