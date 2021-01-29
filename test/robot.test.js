const myProbotApp = require('../src/robot')
const { Probot, ProbotOctokit } = require('probot')

const pushTagsPayload = require('./fixtures/valid.tags.push')
const invalidBranchPush = require('./fixtures/push.branch.invalid')
const invalidBranchDeletePush = require('./fixtures/push.branch.invalid.delete')

const nock = require('nock')
const rawContentTypeHeader = { 'content-type': 'application/vnd.github.v3.raw; charset=utf-8' }

nock.disableNetConnect()

describe('My Probot app', () => {
  let probot
  const githubToken = 'test'

  beforeEach(() => {
    nock.cleanAll()
    const octokit = ProbotOctokit.defaults({
      retry: { enabled: false },
      throttle: { enabled: false }
      // log: console
    })
    probot = new Probot({ id: 123, githubToken, Octokit: octokit })
    probot.load(myProbotApp)
  })

  test('should ignore pushes of tags', async () => {
    await probot.receive({ name: 'push', payload: pushTagsPayload })
  })

  test('should raise issue when config is set to not delete branches', async () => {
    const repo = invalidBranchPush.repository.name
    const owner = invalidBranchPush.repository.owner.name
    const installation = invalidBranchPush.installation.id

    const scope = nock('https://api.github.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: githubToken })

    scope
      .get(/^\/repos.*\/contents.*$/)
      .reply(200, 'deleteBranch: false', rawContentTypeHeader)

    scope
      .post(`/repos/${owner}/${repo}/issues`, body => body.title === 'Invalid Branch name - [bolox-branch-name]')
      .reply(201, { id: 2 })

    await probot.receive({ name: 'push', payload: invalidBranchPush })

    expect(scope.pendingMocks()).toStrictEqual([])
  })

  test('should disable brunchyyy when config is set to true', async () => {
    const installation = invalidBranchPush.installation.id

    const scope = nock('https://api.github.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: githubToken })

    scope
      .get(/^.*\/repos.*\/contents.*$/)
      .reply(200, 'brunchyyyDisable: true', rawContentTypeHeader)

    await probot.receive({ name: 'push', payload: invalidBranchPush })

    expect(scope.pendingMocks()).toStrictEqual([])
  })

  test('should delete reference when config is set to delete branches', async () => {
    const repo = invalidBranchPush.repository.name
    const owner = invalidBranchPush.repository.owner.name
    const installation = invalidBranchPush.installation.id
    const ref = invalidBranchPush.ref
    const res = encodeURIComponent(ref.substring('refs/'.length))

    const scope = nock('https://api.github.com').persist()

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: 'test' })

    scope
      .get(/^\/repos.*\/contents.*$/)
      .reply(200, 'deleteBranch: true', rawContentTypeHeader)

    scope
      .delete(`/repos/${owner}/${repo}/git/refs/${res}`)
      .reply(204)

    await probot.receive({ name: 'push', payload: invalidBranchPush })
    expect(scope.pendingMocks()).toStrictEqual([])
  })

  test('should ignore if push is for deleted branch', async () => {
    const installation = invalidBranchDeletePush.installation.id

    const scope = nock('https://api.github.com').persist()

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: 'test' })

    await probot.receive({ name: 'push', payload: invalidBranchDeletePush })

    expect(scope.pendingMocks()).toStrictEqual([])
  })

  test('should use default values when yml file is not present', async () => {
    const repo = invalidBranchPush.repository.name
    const owner = invalidBranchPush.repository.owner.name
    const installation = invalidBranchPush.installation.id

    const scope = nock('https://api.github.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })

    scope
      .post(`/app/installations/${installation}/access_tokens`)
      .optionally()
      .reply(200, { token: 'test' })

    scope
      .get(/^\/repos.*\/contents.*$/)
      .reply(404, 'Not Found')
      .persist()

    scope
      .post(`/repos/${owner}/${repo}/issues`, body => body.title === 'Invalid Branch name - [bolox-branch-name]')
      .reply(201, { id: 2 })

    await probot.receive({ name: 'push', payload: invalidBranchPush })

    expect(scope.pendingMocks()).toStrictEqual([])
  })
})
