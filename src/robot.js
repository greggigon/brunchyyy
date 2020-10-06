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
  let thisRepo = context.repo({})
  let newIssue = prepareNewIssue(validationResult, context.payload.pusher.name)
  Object.assign(newIssue, thisRepo)
  try {
    await context.github.issues.create(newIssue)
  } catch (exception) {
    context.log.error(`Unable to create issue ${exception}`)
  }
}

const deleteBranch = async (context, ref, validationResult) => {
  let reference = context.repo({ ref: `heads/${validationResult.branchName}` })
  try {
    await context.github.git.deleteRef(reference)
  } catch (exception) {
    context.log.error(`Issue with deleting reference ${reference.ref} ${exception}`)
  }
}

module.exports = app => {
  app.on('push', async context => {
    let ref = context.payload.ref
    let deleted = context.payload.deleted
    if (!deleted && ref && ref.match(HEADS_REFS_REGEX)) {
      app.log.debug('Pushed HEADS which means branches. Will examine closely :)')

      let config = DEFAULT_CONFIG
      try {
        config = await context.config(CONFIG_FILE_NAME, DEFAULT_CONFIG)
        app.log.debug(config.deleteBranch)
      } catch (exception) {
        app.log.error(`Unable to load configuration ${exception}`)
      }

      let validationResult = isReferenceValid(ref)
      if (!validationResult.result && !config.brunchyyyDisable) {
        if (config.deleteBranch) {
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
  })
}
