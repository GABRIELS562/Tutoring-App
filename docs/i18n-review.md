# Afrikaans copy pending native-speaker review

Phase 5 wired `useTranslations`/`getTranslations` across the app. Where a key
already existed in both `src/messages/en.json` and `src/messages/af.json`,
the existing (already-reviewed) Afrikaans copy was reused as-is. Every key
listed below is **new** in this phase: plain, correct Afrikaans in the school
register, "jy" form, written by the agent doing the wiring — not yet checked
by a native speaker. Each is marked `// TODO(review-af)` at its call site (or
grouped by file below where a single component uses several).

Once reviewed, delete a row here after confirming (or correcting) the
`af.json` value; no code change is needed unless the copy itself changes.

## `auth` namespace (src/messages/{en,af}.json)

Added for the login/signup pages and the new forgot-password/reset-password
flow (`src/app/(auth)/forgot-password`, `src/app/(auth)/reset-password`):

- `auth.welcomeBack`
- `auth.signInSubtitle`
- `auth.emailPlaceholder`
- `auth.passwordPlaceholder`
- `auth.signingIn`
- `auth.or`
- `auth.continueAsDemo`
- `auth.fullName`
- `auth.fullNamePlaceholder`
- `auth.school`
- `auth.schoolPlaceholder`
- `auth.grade`
- `auth.gradeSelectPlaceholder`
- `auth.createAccount`
- `auth.creatingAccount`
- `auth.createAccountSubtitle`
- `auth.fullNameRequired`
- `auth.emailRequired`
- `auth.emailInvalid`
- `auth.passwordRequired`
- `auth.passwordMinLength`
- `auth.gradeRequired`
- `auth.passwordsDoNotMatch`
- `auth.supabaseNotConfigured`
- `auth.unexpectedError`
- `auth.forgotPasswordTitle`
- `auth.forgotPasswordSubtitle`
- `auth.sendResetLink`
- `auth.sendingResetLink`
- `auth.resetLinkSentTitle`
- `auth.resetLinkSentMessage`
- `auth.backToSignIn`
- `auth.resetPasswordTitle`
- `auth.resetPasswordSubtitle`
- `auth.newPassword`
- `auth.confirmPassword`
- `auth.updatePassword`
- `auth.updatingPassword`
- `auth.invalidResetLink`
- `auth.requestNewLink`
- `auth.passwordUpdatedFlash`
- `auth.demoModeResetMessage`

<!-- Further sections appended per file as Phase 5 task 5.1 (dashboard,
progress, papers, formulas, subjects, topics, practice, quiz) adds new keys. -->
