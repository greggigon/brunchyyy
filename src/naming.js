const DEFAULT_GITFLOW_BRANCH_NAMES = ['develop', 'master', 'main', 'release']
const DEFAULT_GITFLOW_BRANCH_PREFIXES = ['release', 'bugfix', 'hotfix', 'feature']

const POSTFIX_BRANCH_REGEX = /^[a-zA-Z0-9\-#_.]*$/

const isNonPrefixedBranchValid = (candidateBranch, allowedNonPrefixedNaming) => {
  const allowedNames = allowedNonPrefixedNaming || DEFAULT_GITFLOW_BRANCH_NAMES;
  return allowedNames.indexOf(candidateBranch) > -1
}

const inPrefixedBranchNameValid = (candidateBranch, allowedPrefixedNaming) => {
  const allowedPrefixes = allowedPrefixedNaming || DEFAULT_GITFLOW_BRANCH_PREFIXES;
  if (allowedPrefixes.indexOf(candidateBranch[0]) > -1) {
    return candidateBranch[1].match(POSTFIX_BRANCH_REGEX)
  }
  return false
}

module.exports = (pushRefs, allowedBranchNaming={}) => {
  const branchNameParts = pushRefs.split('/').splice(2)
  const {allowedNames = null, allowedPrefixes = null} = allowedBranchNaming;
  if (branchNameParts.length === 1) {
    if (isNonPrefixedBranchValid(branchNameParts[0], allowedNames)) {
      return { result: true }
    }
    return { result: false, branchName: branchNameParts[0], message: 'Only develop and master are allowed for the non-prefixed branches' }
  }
  if (branchNameParts.length > 2) {
    return { result: false, branchName: branchNameParts.join('/'), message: 'Prefixed branches should not have more than 1 Named part, eg. feature/123-feature-bar' }
  }
  if (inPrefixedBranchNameValid(branchNameParts, allowedPrefixes)) {
    return { result: true }
  }

  const allowedNamesString = (allowedNames || DEFAULT_GITFLOW_BRANCH_NAMES).join('/*, ').replace(/, ([^,]*)$/, ' and $1/*');
  const allowedPrefixesString = (allowedPrefixes || DEFAULT_GITFLOW_BRANCH_PREFIXES).join('/*, ').replace(/, ([^,]*)$/, ' and $1/*');

  return {
    result: false,
    branchName: branchNameParts.join('/'),
    message: `Only ${allowedNamesString} branches or ${allowedPrefixesString} prefixed branches are allowed.` +
      'Only characters, digits and following special characters are allowed in names "-", "_", ".", "#"'
  }
}
