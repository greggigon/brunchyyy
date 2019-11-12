# Brunchyyy - a friendly Neighbourhood Branch Naming Police Robot

> A GitHub App (Robot) built with [Probot](https://github.com/probot/probot).
> Robot monitors repositories for branch names and ensures those names are valid.
> Brunchyyy validates branch names agains standard set of branches in [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow model.

## How Brunchyyy works

Brunchyyy is monitoring **PUSH** events in the GitHub. As soon as event is received, it will compare if the branch for the event (refs/heads/* element of event payload) has name that complies with the following requirements:

* non-prefixed branches are only **master** or **develop**
* prefixed branches use one of the following prefixes: **feature/**, **bugfix/**, **hotfix/** and **release/**, lowercase only
* branch names schould contain alphanumeric characters, digits and following special characters `-`, `_`, `.` and `#`

If the branch is named outside of the above rules, by default it will raise an issue against the repository and assigne the user who pushed the branch to it.
If **Brunchyyy** users would like for the Robot to be a bit more firm, they can use **Brunchyyy** configuration file, to setup branch deletion option.
It will cause the offending branch to be **DELETED** instead of **issue raised** against the repository.

### Configuring branchy

At this moment, there is only one configuration option for **Brunchyyy**, it tells the Robot if Branch with invalid name should be deleted, instead of Issue raised against it.

Configuration is stored in repository, in **.github** folder in **brunchyyy.yml** file.

```bash
  2019-11-08 14:49:07 ⌚  Mac in ~/projects/sample-brunchyyy-repository
  ± |master ✓| → ls .github/
  brunchyyy.yml
```

The configuration parameter is called `deleteBranch` and is by default set to `false`.
To enable branch delation, modify/create file **.github/brunchyyy.yml** in the repository with the following content:

```yaml
  deleteBranch: true
```

## Technicalities

Brunchyyy Bot is build with Probot and Designed to run on AWS Lambda service. [app.yml](app.yml) file constains list of Permissions required and Events Bot listens to.

To build Brunchyyy and run it locally follow guide for [Probot](https://probot.github.io/docs/development/).

Once you clone this repository, simply run:

```sh
# Install dependencies
npm install

# Run the bot
npm start

# Run tests
npm run test
```

To build Webpack compressed Lambda function run:

```sh
  npm run dist
```

Resulting zip file is ready to be uploaded to AWS Lambda function with the following example command:

```sh
 2019-11-08 15:44:45 ⌚  Mac in ~/projects/brunchy
± |master ✓| → aws lambda update-function-code --function-name Brunchyyy --zip-file fileb://brunchyyy.bundle.zip
```

## Contributing

If you have suggestions for how Brunchyyy could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

Open issue with suggestion or a PR.

## License

[ISC](LICENSE) © 2019 Greg Gigon <greg.gigon@gmail.com> (https://greggigon.com/brunchyyy)
