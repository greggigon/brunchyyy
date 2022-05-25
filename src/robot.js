const isReferenceValid = require('./naming')

const HEADS_REFS_REGEX = /^refs\/heads\/.*$/
const CONFIG_FILE_NAME = 'brunchyyy.yml'
const DEFAULT_CONFIG = { deleteBranch: false, brunchyyyDisable: false }

const prepareNewIssue = (validationResult, author) => {
  return {
    title: `Invalid Branch name - [${validationResult.branchName}]`,
    body: `The branch name **${validationResult.branchName}** is not valid according to [Brunchyyy](https://github.com/greggigon/brunchyyy). 
    ${validationResult.message}`,
    assignees: [author]
  }
}

const raiseIssue = async (context, validationResult) => {
  const thisRepo = context.repo({})
  const newIssue = prepareNewIssue(validationResult, context.payload.pusher.name)
  Object.assign(newIssue, thisRepo)
  try {
    await context.octokit.issues.create(newIssue)
  } catch (exception) {
    context.log.error(`Unable to create issue ${exception}`)
  }
}

const deleteBranch = async (context, ref, validationResult) => {
  const reference = context.repo({ ref: `heads/${validationResult.branchName}` })
  try {
    await context.octokit.git.deleteRef(reference)
  } catch (exception) {
    context.log.error(`Issue with deleting reference ${reference.ref} ${exception}`)
  }
}

const loadConfiguration = async (context, app) => {
  try {
    const config = await context.config(CONFIG_FILE_NAME, DEFAULT_CONFIG)
    return config
  } catch (exception) {
    app.log.error(`Unable to load configuration ${exception}`)
  }
  return DEFAULT_CONFIG
}

module.exports = (app) => {
  app.on('push', (context) => onPush(context, app))
}

const onPush = async (context, app) => {
  const ref = context.payload.ref
  const deleted = context.payload.deleted
  if (!deleted && ref && ref.match(HEADS_REFS_REGEX)) {
    app.log.debug('Pushed HEADS a means branches. Will examine closely :)')

    const {brunchyyyDisable = false, deleteBranch:shouldDeleteBranch = false, allowedBranchNaming = {}} = await loadConfiguration(context, app)
    const validationResult = isReferenceValid(ref, allowedBranchNaming)

    if (!validationResult.result && !brunchyyyDisable) {
      if (shouldDeleteBranch) {
        app.log.debug(`Seems like deleteBranch is setup in repository. Removing branch. ${ref}`)
        await deleteBranch(context, ref, validationResult)
      } else {
        app.log.debug('Looks like someone uses naughty names for the branches. Will raise as ISSUE.')
        await raiseIssue(context, validationResult)
      }
    }
  } else {
    app.log.debug('Not something I will be interested in')
  }
}
