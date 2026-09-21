# Afrikaans copy pending native-speaker review (TODO(review-af))

Phase 5 wired `useTranslations`/`getTranslations` across the app. Where a key
already existed in both `src/messages/en.json` and `src/messages/af.json`,
the existing (already-reviewed) Afrikaans copy was reused as-is. Every key
listed below is **new** in this phase: plain, correct Afrikaans in the school
register, "jy" form, written by the agent doing the wiring — not yet checked
by a native speaker.

JSON has no comment syntax, so there is no literal `// TODO(review-af)`
marker at each key in `af.json` itself — this list **is** that marker, grouped
by message namespace (which corresponds 1:1 with the file/component that
introduced the keys). Treat every entry below as carrying a `TODO(review-af)`.

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
- `auth.normalSessionMessage`
- `auth.goToDashboard`
- `auth.checkingSession`

## Task 5.1 sweep (dashboard, progress, papers, formulas, subjects, topics,
practice, quiz, layout, install prompt, camera scan, verify page)

218 new keys across 16 namespaces, listed below. Existing keys reused as-is
where a matching one already existed (e.g. `nav.papers`, `nav.aiSkills`,
`topics.grade`, `topics.locked`, `common.offline`, `common.error`,
`common.retry`) are not repeated here.

### `cameraScan` namespace

- `cameraScan.askAngelo`
- `cameraScan.askAnotherQuestion`
- `cameraScan.capturedQuestionAlt`
- `cameraScan.failedToAnalyze`
- `cameraScan.failedToConnect`
- `cameraScan.hintLimitReached`
- `cameraScan.mayTakeSeconds`
- `cameraScan.readingQuestion`
- `cameraScan.scanQuestion`
- `cameraScan.scanQuestionWithCamera`

### `examCountdown` namespace

- `examCountdown.adviceNormal`
- `examCountdown.adviceUrgent`
- `examCountdown.adviceWarning`
- `examCountdown.angelosAdvice`
- `examCountdown.days`
- `examCountdown.mathsP2`
- `examCountdown.scienceP2`
- `examCountdown.title`
- `examCountdown.until`
- `examCountdown.yearProgress`

### `formulas` namespace

- `formulas.all`
- `formulas.collapseAll`
- `formulas.expandAll`
- `formulas.formulaCount`
- `formulas.grAbbrev`
- `formulas.mathematics`
- `formulas.noFormulasFound`
- `formulas.pageSubtitle`
- `formulas.physicalScience`
- `formulas.practiceArrow`
- `formulas.tryAdjustingSearch`
- `formulas.worksOffline`

### `home` namespace

- `home.accuracy`
- `home.answerToSeeWeakSpots`
- `home.capsCurriculum`
- `home.chartsLeaderboard`
- `home.continueLearning`
- `home.continueWhereLeftOff`
- `home.correct`
- `home.dashboardTitle`
- `home.dayStreak`
- `home.examPapersMemos`
- `home.goodAfternoon`
- `home.goodEvening`
- `home.goodMorning`
- `home.gradeCurriculum`
- `home.incorrect`
- `home.learnToUseAI`
- `home.noRecentActivity`
- `home.practice`
- `home.questionsAnswered`
- `home.recentActivity`
- `home.recently`
- `home.startPracticingToTrack`
- `home.streakActive`
- `home.streakStart`
- `home.studentFallback`
- `home.timeAgoDays`
- `home.timeAgoHours`
- `home.timeAgoJustNow`
- `home.timeAgoMinutes`
- `home.timeAgoYesterday`
- `home.topicsStarted`
- `home.viewProgress`

### `installPrompt` namespace

- `installPrompt.androidInstructions`
- `installPrompt.dismiss`
- `installPrompt.gotIt`
- `installPrompt.install`
- `installPrompt.iosInstructions`
- `installPrompt.notNow`
- `installPrompt.title`

### `papers` namespace

- `papers.active`
- `papers.allGrades`
- `papers.allSubjects`
- `papers.allYears`
- `papers.clearFilters`
- `papers.filters`
- `papers.grade10`
- `papers.grade11`
- `papers.grade12`
- `papers.gradeAndPaper`
- `papers.gradeLabel`
- `papers.mathematics`
- `papers.memoButton`
- `papers.noPapersFound`
- `papers.noPapersYet`
- `papers.officialSource`
- `papers.pageSubtitle`
- `papers.paperButton`
- `papers.physicalScience`
- `papers.showingCount`
- `papers.sourcedPrefix`
- `papers.sourcedSuffix`
- `papers.subject`
- `papers.topicsLabel`
- `papers.tryAdjustingFilters`

### `practice` namespace

- `practice.all`
- `practice.backToNotes`
- `practice.easy`
- `practice.hard`
- `practice.loadErrorMessage`
- `practice.medium`
- `practice.title`

### `progress` namespace

- `progress.accuracyByTopic`
- `progress.activityCalendarTitle`
- `progress.gradeLeaderboard`
- `progress.less`
- `progress.more`
- `progress.name`
- `progress.noLeaderboardData`
- `progress.oneToFive`
- `progress.questionsCount`
- `progress.rank`
- `progress.school`
- `progress.sixToTen`
- `progress.subtitle`
- `progress.tenPlus`
- `progress.title`
- `progress.xp`
- `progress.xpEarned`
- `progress.you`
- `progress.zeroQuestions`

### `quiz` namespace

- `quiz.accuracyPercent`
- `quiz.angeloSays`
- `quiz.angeloThinking`
- `quiz.askAngeloWhy`
- `quiz.dailyHintLimitReached`
- `quiz.excellentWork`
- `quiz.goodEffort`
- `quiz.heartsRemainingLabel`
- `quiz.keepPracticing`
- `quiz.loadingQuestions`
- `quiz.nextQuestion`
- `quiz.nextTopic`
- `quiz.noQuestionsYet`
- `quiz.notSavedRetry`
- `quiz.outOfHearts`
- `quiz.outOfHeartsMessage`
- `quiz.questionOfTotal`
- `quiz.retryButton`
- `quiz.scoreOf`
- `quiz.somethingWentWrongRetry`
- `quiz.tryAgain`
- `quiz.unlimited`
- `quiz.unlimitedHeartsLabel`
- `quiz.xpEarned`

### `studyPlan` namespace

- `studyPlan.allTopicsCovered`
- `studyPlan.reasonAnalytical`
- `studyPlan.reasonEuclidean`
- `studyPlan.reasonStatistics`
- `studyPlan.reasonTrig`
- `studyPlan.startWith`
- `studyPlan.summary`
- `studyPlan.title`
- `studyPlan.topicAnalytical`
- `studyPlan.topicEuclidean`
- `studyPlan.topicStatistics`
- `studyPlan.topicTrig`

### `subjects` namespace

- `subjects.backToAllSubjects`
- `subjects.backToSubjects`
- `subjects.capsAligned`
- `subjects.capsAlignedDesc`
- `subjects.chooseSubject`
- `subjects.chooseSubjectDesc`
- `subjects.mathematics`
- `subjects.mathsDescription`
- `subjects.noTopicsForGrade`
- `subjects.percentComplete`
- `subjects.physicalScience`
- `subjects.previewingGrade`
- `subjects.scienceDescription`
- `subjects.subjectNotFound`
- `subjects.subjectNotFoundMessage`
- `subjects.title`
- `subjects.topicCount`

### `topbar` namespace

- `topbar.userFallback`
- `topbar.userMenu`

### `topicPage` namespace

- `topicPage.contentBlocksCount`
- `topicPage.contents`
- `topicPage.freeLimitReached`
- `topicPage.highPriority`
- `topicPage.highPriorityDesc`
- `topicPage.jumpToSection`
- `topicPage.offlineDescription`
- `topicPage.paperWord`
- `topicPage.percentOfPaper`
- `topicPage.practiceThisTopic`
- `topicPage.saveFailed`
- `topicPage.saveNotesForOffline`
- `topicPage.savedForOffline`
- `topicPage.saving`
- `topicPage.sectionsCount`
- `topicPage.topicInfo`
- `topicPage.youAreOffline`

### `verify` namespace

- `verify.averageScore`
- `verify.certificateIdLabel`
- `verify.certificateNotFound`
- `verify.completedCourse`
- `verify.goToAngelo`
- `verify.issued`
- `verify.issuedBy`
- `verify.modulesCompleted`
- `verify.modulesOutOf`
- `verify.notFoundPrefix`
- `verify.notFoundSuffix`
- `verify.scoreOutOf`
- `verify.validCertificate`

### `weaknessCard` namespace

- `weaknessCard.attempted`
- `weaknessCard.fixNow`
- `weaknessCard.issueDescription`
- `weaknessCard.spotted`

## `boss` namespace (src/messages/{en,af}.json)

Added for the Phase 7 Boss Battle prototype (`src/components/boss/*`,
`src/app/(app)/topics/[slug]/boss/page.tsx`), plus the entry-point strings
in `TopicPageClient.tsx` (the "Battle the boss" card) and the dashboard's
"Boss battles" section:

- `boss.allStepsDone`
- `boss.announceDamage`
- `boss.announceShieldGained`
- `boss.announceShieldLost`
- `boss.askAngeloCost`
- `boss.askAngeloError`
- `boss.backToNotes`
- `boss.battleAgain`
- `boss.bestCombo`
- `boss.bossHpAriaLabel`
- `boss.bossHpPreview`
- `boss.bossSleepingBody`
- `boss.bossSleeping`
- `boss.cancel`
- `boss.closeVideo`
- `boss.comboMultiplier`
- `boss.comboStreak`
- `boss.confirmAskAngeloAction`
- `boss.confirmAskAngeloBody`
- `boss.confirmAskAngeloTitle`
- `boss.confirmRetreatBody`
- `boss.confirmRetreatTitle`
- `boss.continue`
- `boss.correctHit`
- `boss.dailyHintLimitReached`
- `boss.dashboardSectionTitle`
- `boss.didYouHaveThis`
- `boss.download`
- `boss.entryCardCta`
- `boss.entryCardSubtitle`
- `boss.fight`
- `boss.hpLabel`
- `boss.iKnowThis`
- `boss.marksDealt`
- `boss.nextRound`
- `boss.noExplanationAvailable`
- `boss.noIDidNot`
- `boss.noShieldsLeft`
- `boss.questionCount`
- `boss.readiness.got_this`
- `boss.readiness.kind_of`
- `boss.readiness.not_sure`
- `boss.readinessQuestion`
- `boss.retreatBody`
- `boss.retreatTitle`
- `boss.retreat`
- `boss.reviewTitle`
- `boss.roundOf`
- `boss.shareCardHeadline`
- `boss.shareCardMarks`
- `boss.shareCardShareText`
- `boss.shareCardStats`
- `boss.shareCardXp`
- `boss.share`
- `boss.shieldsRemainingAriaLabel`
- `boss.shortAnswerIntro`
- `boss.showMeTheSteps`
- `boss.startBattle`
- `boss.stepByStepTitle`
- `boss.stepOf`
- `boss.timeTaken`
- `boss.title`
- `boss.tryAgain`
- `boss.victoryTitle`
- `boss.videoModalLabel`
- `boss.videoShieldEarned`
- `boss.videoShieldHint`
- `boss.watchTheoryFirst`
- `boss.worthMarks`
- `boss.wrongAnswerHitBack`
- `boss.xpEarned`
- `boss.yesIHadThis`
