const isReferenceValid = require('../src/naming')

const allowedBranchNamingConfig = {
  allowedNames: ['superbranch', 'ultrabranch'],
  allowedPrefixes: ['chore', 'docs']
}

describe('Naming convention for the branches', () => {
  describe('Non-prefixed names', () => {
    test('rejects names that are not GitFlow names', () => {
      expect(isReferenceValid('refs/heads/foo').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/Develop').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/majster').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/masteR').result).toBeFalsy()
    })

    test('accepts names that are valid GitGlow names', () => {
      expect(isReferenceValid('refs/heads/master').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/develop').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/main').result).toBeTruthy()
    })
  })

  describe('Prefixed branch names', () => {
    test('allowed feature prefix', () => {
      expect(isReferenceValid('refs/heads/feature/foo-bar-123').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/feature/foobar123').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/feature/foobar').result).toBeTruthy()
    })
    test('allowed bugfix prefix', () => {
      expect(isReferenceValid('refs/heads/bugfix/foo-bar-123').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/bugfix/foobar123').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/bugfix/foobar').result).toBeTruthy()
    })
    test('allowed hotfix prefix', () => {
      expect(isReferenceValid('refs/heads/hotfix/foo-bar-123').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/hotfix/foobar123').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/hotfix/foobar').result).toBeTruthy()
    })
    test('allowed release prefix', () => {
      expect(isReferenceValid('refs/heads/release/foo-bar-123').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/release/foobar123').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/release/foobar').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/release/0.1.2-foo').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/release/0.1.2').result).toBeTruthy()
    })

    test('allowed just the release as the branch name', () => {
      expect(isReferenceValid('refs/heads/release').result).toBeTruthy()
    })

    test('random branch name prefixes are not allowed', () => {
      expect(isReferenceValid('refs/heads/foobar/another-one').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/release123/another-one').result).toBeFalsy()
    })

    test('prefixes should be lowercase', () => {
      expect(isReferenceValid('refs/heads/RELEASE/foo-bar-123').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/Release/foo-bar-123').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/ReLeAse/foo-bar-123').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/HOTfix/foo-bar-123').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/Feature/foo-bar-123').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/bugFIX/foo-bar-123').result).toBeFalsy()
    })

    test('prefixed branches should not have more than 1 named part', () => {
      expect(isReferenceValid('refs/heads/hotfix/foo/bar-123').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/release/foo/bar-123').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/feature/foo/bar-123').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/bugfix/foo/bar-123').result).toBeFalsy()
    })

    test('prefixed branches should have no stupid characters and accept lowercase', () => {
      expect(isReferenceValid('refs/heads/hotfix/FOO-BAR-2').result).toBeTruthy()
      expect(isReferenceValid('refs/heads/release/foo bar 2').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/feature/foo!').result).toBeFalsy()
      expect(isReferenceValid('refs/heads/bugfix/foo\\blah').result).toBeFalsy()
    })

    test('prefixed branches allowed should br overridden if present', () => {
      expect(isReferenceValid('refs/heads/feature/foo-bar-123', allowedBranchNamingConfig).result).toBeFalsy()
      expect(isReferenceValid('refs/heads/chore/foo-bar-123', allowedBranchNamingConfig).result).toBeTruthy()
      expect(isReferenceValid('refs/heads/docs/foo-bar-123', allowedBranchNamingConfig).result).toBeTruthy()
    })

    test('non prefixed branches allowed should br overridden if present', () => {
      expect(isReferenceValid('refs/heads/master', allowedBranchNamingConfig).result).toBeFalsy()
      expect(isReferenceValid('refs/heads/superbranch', allowedBranchNamingConfig).result).toBeTruthy()
      expect(isReferenceValid('refs/heads/ultrabranch', allowedBranchNamingConfig).result).toBeTruthy()
    })
  })
})
