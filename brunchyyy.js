const { createProbot } = require('probot')
const { resolve } = require('probot/lib/helpers/resolve-app-function')
const { getPrivateKey } = require('@probot/get-private-key')

const robot = require('./src/robot')

let probot

const loadProbot = appFn => {
  probot = probot || createProbot({
    id: process.env.APP_ID,
    secret: process.env.WEBHOOK_SECRET,
    cert: getPrivateKey()
  })

  if (typeof appFn === 'string') {
    appFn = resolve(appFn)
  }

  probot.load(appFn)

  return probot
}

const lowerCaseKeys = obj =>
  Object.keys(obj).reduce((accumulator, key) =>
    Object.assign(accumulator, { [key.toLocaleLowerCase()]: obj[key] }), {})

const brunchyyy = theRobot => {
  return async (event, context) => {
    // 🤖 A friendly homepage if there isn't a payload
    if (event.httpMethod === 'GET' && event.path === '/probot') {
      const res = {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html'
        },
        body: '<html><body>Information on Brunchyyy can be found at <a href="https://greggigon.com/brunchyyy">https://greggigon.com/brunchyyy</a></body></html>'
      }
      return context.done(null, res)
    }

    // Otherwise let's listen handle the payload
    probot = probot || loadProbot(theRobot)

    // Ends function immediately after callback
    context.callbackWaitsForEmptyEventLoop = false

    // Determine incoming webhook event type
    const headers = lowerCaseKeys(event.headers)
    const githubEventHeader = headers['x-github-event']

    // Convert the payload to an Object if API Gateway stringifies it
    event.body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body

    if (event) {
      try {
        await probot.receive({
          name: githubEventHeader,
          payload: event.body
        })
        const res = {
          statusCode: 200,
          body: JSON.stringify({
            message: `Received ${githubEventHeader}.${event.body.action}`
          })
        }
        return context.done(null, res)
      } catch (err) {
        console.error(err)
        return context.done(null, {
          statusCode: 500,
          body: JSON.stringify(err)
        })
      }
    } else {
      console.error({ event, context })
      context.done(null, 'unknown error')
    }
    return context.done(null, {
      statusCode: 200,
      body: 'Nothing to do.'
    })
  }
}

module.exports.brunchyRobot = brunchyyy(robot)
