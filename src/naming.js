const GITFLOW_BRANCH_NAMES = ['develop', 'master']
const GITFLOW_BRANCH_PREFIXES = ['release', 'bugfix', 'hotfix', 'feature']

const POSTFIX_BRANCH_REGEX = /^[a-zA-Z0-9\-#_.]*$/

const isNonPrefixedBranchValid = (candidateBranch) => {
  return GITFLOW_BRANCH_NAMES.indexOf(candidateBranch) > -1
}

const inPrefixedBranchNameValid = (candidateBranch) => {
  if (GITFLOW_BRANCH_PREFIXES.indexOf(candidateBranch[0]) > -1) {
    return candidateBranch[1].match(POSTFIX_BRANCH_REGEX)
  }
  return false
}

module.exports = (pushRefs) => {
  let branchNameParts = pushRefs.split('/').splice(2)
  if (branchNameParts.length === 1) {
    if (isNonPrefixedBranchValid(branchNameParts[0])) {
      return { result: true }
    }
    return { result: false, branchName: branchNameParts[0], message: 'Only develop and master are allowed for the non-prefixed branches' }
  }
  if (branchNameParts.length > 2) {
    return { result: false, branchName: branchNameParts.join('/'), message: 'Prefixed branches should not have more than 1 Named part, eg. feature/123-feature-bar' }
  }
  if (inPrefixedBranchNameValid(branchNameParts)) {
    return { result: true }
  }
  return {
    result: false,
    branchName: branchNameParts.join('/'),
    message: 'Only feature/*, bugfix/*, hotfix/* and release/* prefixed branches are allowed.' +
      'Only characters, digits and following special characters are allowed in names "-", "_", ".", "#"'
  }
}
