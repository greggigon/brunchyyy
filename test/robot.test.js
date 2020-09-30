const myProbotApp = require('../src/robot')
const { Probot } = require('probot')

const payload = require('./fixtures/valid.tags.push')
const invalidBranchPush = require('./fixtures/push.branch.invalid')
const invalidBranchDeletePush = require('./fixtures/push.branch.invalid.delete')

const configDeleteBranchTrue = require('./fixtures/responses/config.delete.branch.true')
const configDeleteBranchFalse = require('./fixtures/responses/config.delete.branch.false')
const configDisableTrue = require('./fixtures/responses/config.disable.true.json')

const fs = require('fs')
const path = require('path')

const nock = require('nock')

nock.disableNetConnect()

describe('My Probot app', () => {
  let probot
  let mockCert

  beforeAll((done) => {
    fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err, cert) => {
      if (err) return done(err)
      mockCert = cert
      done()
    })
  })

  beforeEach(() => {
    probot = new Probot({ id: 123, cert: mockCert })
    probot.load(myProbotApp)
    nock.cleanAll()
  })

  test('should ignore pushes of tags', async () => {
    await probot.receive({ name: 'push', payload })
  })

  test('should raise issue when config is set to not delete branches', async () => {
    let repo = invalidBranchPush.repository.name
    let owner = invalidBranchPush.repository.owner.name
    let installation = invalidBranchPush.installation.id

    let scope = nock('https://api.github.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: 'test' })

    scope
      .get(/^\/repos.*\/contents.*$/)
      .reply(200, configDeleteBranchFalse)

    scope
      .post(`/repos/${owner}/${repo}/issues`, body => body.title === 'Invalid Branch name - [bolox-branch-name]')
      .reply(201, { id: 2 })

    await probot.receive({ name: 'push', payload: invalidBranchPush })

    scope.done()
  })

  test('should disable brunchyyy when config is set to true', async () => {
    let installation = invalidBranchPush.installation.id

    let scope = nock('https://api.github.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: 'test' })

    scope
      .get(/^\/repos.*\/contents.*$/)
      .reply(200, configDisableTrue)

    await probot.receive({ name: 'push', payload: invalidBranchPush })

    scope.done()
  })

  test('should delete reference when config is set to delete branches', async () => {
    let repo = invalidBranchPush.repository.name
    let owner = invalidBranchPush.repository.owner.name
    let installation = invalidBranchPush.installation.id
    let ref = invalidBranchPush.ref

    let scope = nock('https://api.github.com').persist()

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: 'test' })

    scope
      .get(/^\/repos.*\/contents.*$/)
      .reply(200, configDeleteBranchTrue)

    scope
      .delete(`/repos/${owner}/${repo}/git/${ref}`)
      .reply(204)

    await probot.receive({ name: 'push', payload: invalidBranchPush })
    scope.done()
  })

  test('should ignore if push is for deleted branch', async () => {
    let installation = invalidBranchDeletePush.installation.id

    let scope = nock('https://api.github.com').persist()

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: 'test' })

    await probot.receive({ name: 'push', payload: invalidBranchDeletePush })

    scope.done()
  })
})
