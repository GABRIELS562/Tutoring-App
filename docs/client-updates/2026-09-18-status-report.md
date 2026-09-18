---
title: "Angelo Tutoring Platform"
subtitle: "Project Status Report and Decisions Required"
date: "18 September 2026"
---

**Prepared for:** [Client name]

**Prepared by:** [Your company]

**Version:** 1.0

# 1. Purpose of this report

This report sets out the current state of the Angelo Tutoring application, the work completed in the past week, the infrastructure we propose for launch and its running cost, and the decisions we need from you to plan the remaining work. It is based on a full review of the source code carried out on 17 and 18 September 2026, not on a feature list.

Percentages in this report are engineering estimates of effort remaining. They are not delivery dates. A timeline can be produced once the decisions in Section 6 are made.

# 2. Executive summary

The application's software foundation is approximately 70% complete. The curriculum content is approximately 15% complete. Taken together, and allowing for the fact that students value content more than infrastructure, the product is roughly 45 to 50% of the way to a version that could be offered commercially.

| Measure | Position at 18 September 2026 |
|-----------------------------|-----------------------------|
| Software foundation | Approximately 70% complete |
| Curriculum content | Approximately 15% complete |
| Product overall | Approximately 45 to 50% of a commercially ready version |
| Topics with verified videos loaded | 28 of 28 (English); 26 of 28 (Afrikaans) |
| Practice questions in the bank | 6 (one topic) |
| Automated tests | 159 passing on every change |
| Deployed environment | None yet |

Three points deserve your attention before anything else:

1. **Content strategy.** The platform is now built to play curated YouTube lessons inside the app rather than to host lessons written from scratch. This week we identified, verified and loaded provisional video selections for all 28 curriculum topics in English, and for 26 of them in Afrikaans. These selections are a starting point for your review, not a final choice.

2. **Security.** Our review found that the application's server routes did not verify the identity of the caller. This has been corrected this week. The correction passed two rounds of independent security review and has been merged. No student data was exposed because the platform has not yet been deployed with real users.

3. **Decisions.** Six decisions listed in Section 6 change the scope of the remaining work substantially. We recommend these are answered first. The remaining questions can follow at your convenience.

# 3. Current state of the application

## 3.1 Summary by area

| Area | Complete | Comment |
|--------------------------|------:|------------------------|
| Application foundation (login, navigation, mobile install, English and Afrikaans interface) | 80% | Password reset is not yet built. |
| AI Skills course (five modules, prompt challenge, certificate) | 85% | The most complete feature in the product. |
| AI tutor "Angelo" (hints, wrong-answer help, photo scan) | 65% | Built but not yet tested against a live AI account. |
| Administration panel (topics and questions) | 65% | Cannot edit lesson text or video selections. |
| Past papers (50 NSC papers, 2019 to 2024) | 55% | Screen shows a fixed list; papers are hosted on a third-party site. |
| Quiz, points, streaks and progress tracking | 40% | Screens exist; results are not yet saved. |
| Hosting and release pipeline | 40% | Automated checks are now in place; nothing is deployed. |
| Curriculum content (curated video) | 15% | Player and structure built; provisional videos loaded this week. |
| Premium tier and payments | 0% | No code exists. |
| Email | 0% | No code exists. |

## 3.2 What is working

| Feature | Status | Detail |
|--------------|-----------|----------------------------------------|
| Sign up and log in | Built | Email and password. Protected pages redirect to the login screen. No Google or Apple sign-in and no password reset yet. |
| English and Afrikaans interface | Built | 84 interface strings translated. The AI tutor also answers in Afrikaans. Lesson content itself is English only. |
| Install as an app | Built | Installs on phones from the browser and caches topic pages and the formula sheet for offline reading. |
| AI Skills course | Built | Five modules, a prompt-writing challenge graded by AI, and a downloadable certificate with a public verification link and QR code. |
| Formula sheet | Built | Static reference, available offline. |
| In-app video player | Built | YouTube videos play inside the topic page. Each video slot can carry a separate Afrikaans video. The link that previously sent students out to YouTube has been removed. |
| AI tutor (Angelo) | Built, untested live | Six modes and a defined tutoring personality. Daily limits for free users (five hints and one photo scan). Not yet exercised against a live AI account. |
| Administration panel | Built, untested live | Create topics, write multiple-choice questions with worked solutions, and generate solution steps with AI. Cannot edit lesson text or video selections; those require a developer. |
| Past papers | Partial | 50 papers are loaded in the database, but the screen shows a fixed list of 30. The PDF files are hosted by a third party (stanmorephysics.com). |
| Quizzes and progress | Screens only | The quiz engine, points, hearts, streaks and leaderboard all display, but quiz results are not saved and the dashboard shows sample figures. Questions are multiple-choice only. |
| Premium tier | Not started | The application distinguishes free from premium users, but there is no way to become a premium user. No payment integration exists. |
| Email | Not started | No welcome, password-reset or certificate emails. |
| Hosting | Not deployed | There is no staging or production address today. |

## 3.3 An important caveat

The application has only ever been run in a demonstration mode, without a database, a login service or an AI account. Every feature marked "Built" has been exercised with sample data. Connecting real services is the first step of the remaining work and will surface issues that cannot be found any other way. We will do this on our own development accounts so that it does not depend on you.

# 4. Work completed this week

The following was completed between 17 and 18 September 2026 and does not depend on any decision from you.

| Area | Completed | Effect |
|--------------|------------------------------------|--------------------------|
| Engineering quality | Automated checks now run on every change: code style, type checking, a test suite of 159 tests, and a full production build. Thirteen outstanding code-quality errors corrected. Obsolete deployment files for an approach we are not pursuing removed. Web framework updated to close a published security advisory. | Defects are caught before they reach a student. |
| Video content | All 28 topics now carry real, verified YouTube videos instead of placeholders: two English videos per topic and one Afrikaans video where a suitable one exists. Each video was checked to confirm it plays inside the application. The two videos previously chosen for Grade 11 Trigonometry had been removed from YouTube by their owner and were replaced. | Every topic page now works. A weekly automated check will flag any video removed in future. |
| Security | All nine server routes now verify the caller's identity before acting; previously none did. The administration area now denies access when it cannot confirm a user's role, rather than allowing it. Certificate identifiers are cryptographically random. A database access-policy file has been written for application when the database is provisioned. | Student data will be protected from the first real deployment. Passed two rounds of independent security review; merged. |

# 5. Proposed infrastructure and running costs

## 5.1 Recommended services

We recommend the following. All prices were checked with the vendors on 17 and 18 September 2026, converted at R16.20 to the US dollar, and exclude VAT. Dollar-priced services will move with the exchange rate.

| Requirement | Service | Rationale | Launch cost | Production cost |
|-----------|---------|----------------------|----------------|----------------|
| Application hosting | Vercel | Built by the makers of the web framework we use; deploys directly from the code repository; certificates, content delivery and preview environments included. No server to maintain. | Free tier is limited to non-commercial use; suitable for a closed beta only. | $20 (approx. R325) per month. |
| Database, login and file storage | Supabase | One service provides all three and the application is already written against it. | Free tier: 500 MB database, 50,000 monthly users. Projects pause after seven days without traffic, so unsuitable for launch. | $25 (approx. R405) per month: 8 GB database, 100,000 monthly users, daily backups. |
| File storage | Supabase (included) | Very little is stored. Videos remain on YouTube. Certificates are generated on the student's device. Photos sent to the AI tutor are not retained. | None. | None. |
| AI tutor | Anthropic Claude API | Billed per use. A text hint costs approximately R0.04; a photo scan approximately R0.20. Free users are already limited to five hints and one scan per day. | Pay as you go; a beta of 30 students would cost under R150 per month. | Usage-dependent; see 5.2. |
| Email | Resend | Welcome, password-reset and certificate emails. | Free: 3,000 emails per month. | Free until roughly 1,500 active students; then $20 (approx. R325) per month. |
| Domain name | .co.za registrar | Local and recognisable. | Approx. R99 per year. | Approx. R99 per year. |
| DNS and attack protection | Cloudflare (free plan) | Free enterprise-grade DNS and denial-of-service protection. | None. | None. |
| Payments (if a paid tier is launched) | PayFast | Credentials already exist. No monthly fee. 3.2% plus R2.00 per card transaction; 2.0% for instant EFT; R8.70 per payout. | None. | Approximately 5% of revenue. |
| Error monitoring | Sentry (free plan) | Alerts us to failures before students report them. | None. | None at launch volumes. |

**Summary.** A closed beta on free tiers costs approximately R99 per year plus a small AI usage charge. A production deployment with a paid tier costs approximately R730 per month in fixed fees plus AI usage; for a few hundred active students we expect R1,000 to R2,000 per month in total.

The following accounts will need to exist in your name, with your payment details: Vercel, Supabase, Anthropic, Resend, Cloudflare, a domain registrar and PayFast. We will set them up on your behalf.

## 5.2 AI tutor cost by usage

The AI tutor is the only cost that grows with use. The table assumes every student uses their full free daily allowance on each of 22 school days. Actual use is normally well below this.

| Active students | Worst case per month | Likely per month (one quarter of allowance) |
|---:|---:|---:|
| 50 | R440 | R110 |
| 200 | R1,760 | R440 |
| 500 | R4,400 | R1,100 |
| 1,000 | R8,800 | R2,200 |

Premium users are not subject to daily limits. We recommend a monthly spending cap on the AI account, which we will set at provisioning.

## 5.3 The AWS design

The project files include an earlier design for hosting on Amazon Web Services. Priced as drawn, at Cape Town regional rates, it would cost approximately R4,400 per month before any traffic, of which the high-availability database alone is about R2,000. Reduced to a bare minimum it would still cost approximately R1,300 per month and would require someone on call for infrastructure. It also retains the Supabase dependency for login. We do not recommend it for launch. It remains an option if you have an existing AWS commitment or a data-residency requirement.

# 6. Decisions required

## 6.1 Please answer these first

These six decisions change the size of the remaining work by a large factor. They are summarised here and set out in full below.

| No. | Decision | Why it matters |
|:---:|--------------------|------------------------------------------|
| 1 | Minimum launch scope | Grade 12 Mathematics alone is roughly a quarter of the content work. |
| 2 | Language priority | Full bilingual coverage is a separate project; English with Afrikaans where available is a small addition. |
| 3 | Content ownership | Video review is hours; writing practice questions is the largest remaining content task. |
| 4 | Content editing | Determines whether an editing screen is built or content changes go through us. |
| 5 | Commercial model | Launching free removes the payments workstream from the launch path. |
| 6 | Account ownership | We cannot provision production services until the owner and billing contact are known. |


1. **Minimum launch scope.** What is the smallest product you would be happy to launch: all of Grades 10 to 12 in both subjects, a single grade, or a single subject? Is there a fixed date we are working towards?

2. **Language priority.** Is Angelo English-first, Afrikaans-first, or fully bilingual? The interface and the AI tutor already work in both languages. For video, the English ecosystem is roughly one hundred times larger than the Afrikaans one, and the most-watched Afrikaans channel has disabled in-app playback on almost all of its videos. "English, with Afrikaans where it exists" is a small amount of additional curation; "every topic in both languages" is a separate project. See Appendix B.

3. **Content ownership.** Who will review the video selections and who will write the practice questions? We have loaded provisional video choices for every topic (Appendix C and D), so video review is a few hours of work for someone who knows the syllabus. Practice questions are the larger task and cannot be sourced from YouTube; the question bank currently contains six questions.

4. **Content editing.** Do you need to change videos or topic notes yourself, without a developer? Today only a developer can. A simple editing screen is a modest addition; if sending us a list is acceptable for launch, we will leave it out.

5. **Commercial model at launch.** Will the product launch with a paid tier, or free? No payment code exists. Launching free removes an entire workstream from the launch path.

6. **Accounts.** Who will own the vendor accounts listed in Section 5.1, and who is the billing contact?

## 6.2 Scope

7. Would you like a private beta with a small group of students before public launch? If so, from which school, and who will recruit them?
8. Is the product Mathematics and Physical Sciences only, or should it be structured to accommodate Mathematical Literacy, Life Sciences or other subjects later?
9. What devices and data conditions are your students on? A video-first curriculum is data-intensive. If most students use prepaid mobile data, we should keep videos short, default to lower quality, and make the written notes useful without pressing play.

## 6.3 Curriculum content

10. How many practice questions per topic is sufficient, and is multiple-choice acceptable? The engine supports multiple-choice only; NSC papers are largely written-answer.
11. Should questions be adapted from past NSC papers (copyright applies) or written fresh?
12. Which YouTube channels do you trust for CAPS content? Appendix A ranks the channels South African learners actually watch. Kevinmathscience is our suggested default for English.
13. What makes a video suitable: maximum length, South African context, exam technique? We need a rule a reviewer can apply consistently.
14. Is the finished Grade 11 Trigonometry topic the right layout (videos, formula box, worked examples, tips)? We will replicate it across the other 27 topics.
15. Who will sign off that the videos and formulas are correct and match the syllabus? We need a named subject reviewer.
16. Should students earn points for watching a video, and should we record which videos they have watched?
17. Videos are sometimes removed by their owners. We have added a weekly automated check that flags this. Who should receive the alert?
18. The most-watched Afrikaans teacher on YouTube (HouNetOpSukkel, 27,700 subscribers) has disabled in-app playback on almost all their videos. Should we approach them, link out to YouTube for those videos only, or omit them?
19. The exam countdown shows fixed 2026 NSC dates. Can you confirm them, and who will update them each year?
20. The 50 past-paper PDFs are hosted on stanmorephysics.com. Are you comfortable depending on a third-party site, or should we host the files ourselves, and are we permitted to?

## 6.4 Premium and payments (only if a paid tier is chosen)

21. What is included in Premium, and at what price? Today the only difference is unlimited AI hints and photo scans.
22. Is PayFast confirmed as the payment provider, is the account live or in test mode, and is the product a monthly subscription, a once-off purchase, or both?
23. Free users receive five AI hints and one photo scan per day. Are these the right limits?

## 6.5 AI tutor

24. Is the tutor's defined personality (never gives the full answer, replies in 80 words or fewer, uses guiding questions, avoids hollow praise) what you want? Is there anything to add or remove?
25. Should students' conversations with the tutor be stored for your review, or discarded? Storing them helps improve content but adds a privacy obligation.

## 6.6 Accounts and learner data

26. Students may be under 18. Do you require parental consent at sign-up, and do you have a privacy policy and terms of use we should link to?
27. The leaderboard shows other students' first name, last initial and school. Is that acceptable to you and to the schools?
28. Should sign-in support Google accounts (most learners have one through school), or is email and password sufficient?
29. Who should have administrator access, and do you want a parent or teacher view of a student's progress?

## 6.7 Brand, hosting and ownership

30. Is "Angelo" the final product name, and do you have a logo? Whose name and logo should appear as the issuer on the AI Skills certificate?
31. Where should the application be hosted and on what domain, and in whose accounts (hosting, DNS and code repository)? See Section 5.
32. Which email address should system emails come from?
33. Is approximately R730 per month in fixed fees plus AI usage an acceptable running budget?

# 7. Next steps

The following work proceeds on our side without waiting for the decisions above.

| Step | What it delivers | Client input needed |
|--------------------|-----------------------------------|:--------:|
| Connect real login, database and hosting services on our own development accounts | Every feature tested against real services for the first time | No |
| Make quizzes save results | Points, streaks, hearts and the progress dashboard become real | No |
| Move the AI tutor to the current model generation and add a spending cap | Lower cost per hint; no risk of an unbounded bill | No |
| Complete the Afrikaans interface and add password reset | Afrikaans users see an Afrikaans application; no product ships without password reset | No |
| Produce a scoped delivery plan with dates | A committed timeline | Yes — decisions 1 to 6 |

\newpage

# Appendix A. English video channels

The channels below teach the South African CAPS syllabus for Grades 10 to 12 Mathematics and Physical Sciences. Subscriber and view counts were read from YouTube on 17 September 2026.

| Rank | Channel | Subscribers | Style | Typical length | Assessment |
|---:|------------|--------------|--------------------|---------|-----------------------------|
| 1 | Kevinmathscience | 1.11 million; 2,023 videos; 335 million views | One concept or exam question per video, Maths and Physics | 2 to 15 minutes | Recommended default. Largest reach by a factor of three, exam-focused, covers every topic. Suited to mobile data budgets. |
| 2 | Mlungisi Nkosi Maths and Science | 386,000 | Full structured lessons, Maths and Physics | 20 to 60 minutes | Strongest for Grade 12 Calculus, Sequences and Momentum. Best used as the longer lesson alongside a short clip. |
| 3 | Miss Martins Maths and Science | 329,000 | Classroom lessons and past-paper walkthroughs; Physics and Chemistry as well as Maths | 6 to 20 minutes | The best Grade 10 Physical Sciences coverage available. |
| 4 | Mindset Learn | 302,000; 7,081 videos | Recorded live lessons (Mindset Network, aligned to the Department of Basic Education) | 50 to 90 minutes | Official and complete, but long and little-watched today. Useful for topics no one else covers. |
| 5 | ThunderEDUC | 195,000 | Past-paper revision | 30 to 60 minutes | Suited to exam-season revision, not first teaching. |
| 6 | PHAKAMA RESEARCH | 118,000 | CAPS-aligned revision, all grades | 40 to 60 minutes | Sound but low per-video viewership. |
| 7 | Isinamuva Tutoring | 55,300 | Maths and Science in isiZulu | 1 to 2 hours | Worth discussing: the app supports one alternative-language video per slot. |
| 8 | Zandile loves Maths | 37,800 | Long-form "everything you need to know" sessions | 2 to 10 hours | Popular, but multi-hour videos are unsuited to an embedded player on mobile data. |
| 9 | Wiskunde_Mathematics_SUM | 13,600; 926 videos | Short Maths clips with every video in both English and Afrikaans | 5 to 15 minutes | The natural choice for the Afrikaans slot; see Appendix B. |
| 10 | Simple Science | 15,700 | Physical Sciences explainers | 10 to 20 minutes | Reserve option for physics topics. |

Miss Angler (346,000 subscribers) is not listed because the channel covers Life Sciences.

Across all 28 topics, the top search results from these channels were Kevinmathscience 61 times, Miss Martins 28, Mlungisi Nkosi 7 and Mindset 3.

**Selection guidance.** Two videos per topic are enough to launch: one short introduction and one exam-question walkthrough. Videos under 20 minutes suit mobile data (a 15-minute video is roughly 40 to 60 MB; an hour is 200 MB or more). Watch the first minute: accent, pace and board legibility on a phone matter more than the channel name.

\newpage

# Appendix B. Afrikaans video channels

There is a genuine Afrikaans YouTube ecosystem for CAPS Mathematics and Physical Sciences, but it is roughly one hundredth the size of the English one. The largest channel has 27,700 subscribers, and a typical Afrikaans video has hundreds to low thousands of views rather than hundreds of thousands.

**A constraint you should know about.** HouNetOpSukkel (27,700 subscribers, 1.87 million views, 63 videos) is by a wide margin the most-watched Afrikaans teacher, with videos averaging 20,000 to 85,000 views. However, 14 of the 16 HouNetOpSukkel videos we found are set by the owner not to play inside other applications; only two Grade 10 Functions videos allow it. This is a setting the channel owner controls and it cannot be overridden. The practical options are to ask the owner to enable it, to send students to YouTube for those videos only, or to use other channels. They are listed in Appendix D marked "cannot embed" so you can see what would be missing.

| Rank | Channel | Subscribers | Covers | Assessment |
|---:|------------|--------------|--------------------|-----------------------------|
| 1 | HouNetOpSukkel | 27,700; 63 videos; 1.87 million views | Wiskunde and Fisiese Wetenskappe, Grades 10 to 12, crash courses and revision | Best content, but in-app playback disabled. Worth one email to the owner. |
| 2 | Wiskunde_Mathematics_SUM | 13,600; 926 videos; 3.0 million views | Short Maths clips, Grades 8 to 12, every video in both Afrikaans and English | Recommended. Numbered series per topic, short, embeddable, and the same teacher in both languages. |
| 3 | Online Maths by Miss Pythagoras | 5,920; 1,168 videos; 855,000 views | Afrikaans Maths, Grades 8 to 12, numbered lessons per topic | The most systematic Afrikaans coverage of the Grade 12 syllabus. Embeddable. |
| 4 | Wiskunde Broers | 4,010; 60 videos | Afrikaans Maths | Small library; one strong Grade 12 proportionality video. |
| 5 | Danike Aucamp | 2,680; 346 videos | Wiskunde en Wetenskap, Grades 10 to 12, summary format | Useful for the Chemistry side of Physical Sciences. Embeddable. |
| 6 | WiskundeMetMargie | 1,220; 248 videos | Afrikaans Maths, numbered series, Grades 10 to 11 | Best Grade 10 Algebra and Euclidean Geometry coverage in Afrikaans. Embeddable. |
| 7 | WSILAB | 1,190; 328 videos | Fisiese Wetenskap en Wiskunde, Afrikaans and English | Reserve option for physics. |
| 8 | Ekstra Wetenskap Klasse | 876 | Afrikaans Physics, Grade 10 | Small but on-topic: the best Grade 10 circuits and waves clips in Afrikaans. Embeddable. |
| 9 | Skeinat met Schabort | 752; 1,006 videos | Afrikaans Physical Sciences, Grades 10 to 12 | Large library, small audience, started November 2024. Did not surface in topic searches; worth a manual look. |

Science Clinic (6,250 subscribers) hosts its Afrikaans courses on its own website, not on YouTube, and is therefore not a source for the application.

**Coverage.** Afrikaans candidates were found for all 28 topics, but no suitable Afrikaans video was found for Grade 10 Mechanics or for Grade 11 wavefronts and diffraction; those topics fall back to English. Several other physics topics have only one or two candidates.

\newpage

# Appendix C. English candidate videos by topic

Search results per topic from the channels in Appendix A, filtered to videos that play inside the application, with view counts read from YouTube on 17 September 2026. Length categories: under 15 minutes is ideal for mobile data; over two hours is not recommended for embedding.

Videos marked ✓ are currently loaded in the application as provisional selections. Reply with the codes of the videos you prefer, or confirm the current selections.


### Mathematics · Grade 10 — Algebraic Expressions

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | EnVbvflrJ4Q | 8a) Factorising trinomials grade 10 / Try | Kevinmathscience | 344 | 2:52 |
| ✓ | 52-eRCXTPX0 | Grade 10 Maths ALGEBRA Exam Questions Practice | Miss Martins Maths and Science | 267 | 57:07 |
|  | 6Am2_HXuoqU | Exponential Equation Grade 10 | Kevinmathscience | 333 | 1:39 |
|  | pirVy1agpus | 6) Common Factor / factorisation grade 10 | Kevinmathscience | 500 | 5:04 |

### Mathematics · Grade 10 — Equations and Inequalities

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | OFX7zmbEmro | Grade 10 Inequalities | Kevinmathscience | 405 | 3:15 |
|  | LHAq_5VmxRU | Equations Grade 10: Linear Equation without fraction | Kevinmathscience | 287 | 5:16 |
|  | FWKCISifI9I | Grade 10 Equations: Linear Equations | Miss Martins Maths and Science | 22 | 6:44 |
| ✓ | zHNvf3hMlSk | Exam Equations Grade 10 | Kevinmathscience | 87 | 4:01 |

### Mathematics · Grade 10 — Functions and Graphs

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | 1RnuVXYcVpE | Exam Functions Grade 10 | Kevinmathscience | 563 | 13:37 |
| ✓ | ZqRXA19yhMM | 🚀 Grade 10 Mathematics / Straight Line Functions Made Easy | SmartPrep MathsScience | 45 | 7:30 |
|  | Nujt5qcZWqE | Parabola Grade 10 Functions (Introduction) | Miss Martins Maths and Science | 229 | 9:52 |
|  | 9pJupVoCq7g | Domain and Range for Functions: Grade 10 Maths | Miss Martins Maths and Science | 157 | 21:13 |

### Mathematics · Grade 10 — Number Patterns

*Note: Grade 10 linear-pattern videos from the top channels either did not surface or block embedding (My Class Series does). These are Grade 11/12 pattern videos — a manual search is needed for this topic.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | Ws_tyxB-Xyo | Quadratic number patterns grade 11: introduction and examples | Kevinmathscience | 475 | 11:29 |
| ✓ | GzFLsWU5jlY | Quadratic Pattern Grade 11: Exam | Kevinmathscience | 90 | 9:00 |
|  | sXwkDJw8izM | Grade 12 Number Patterns/ Sequences And Series/ Exam Questions | Zandile loves Maths | 127 | 4:55:48 |

### Mathematics · Grade 10 — Finance and Growth

*Note: 'Interest Maths Lit' is the Mathematical Literacy version; the other three are Core Maths.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | AKU4lSQvrnI | Financial Maths Grade 10 / Simple Interest Introduction | Kevinmathscience | 440 | 3:59 |
|  | q9Sxe0HBDR4 | Financial Maths Grade 10 / Simple Interest / Determine P | Kevinmathscience | 244 | 2:53 |
| ✓ | 3cj331uG3uI | Financial Maths Grade 10 Past Paper Exam Question 1 | Miss Martins Maths and Science | 51 | 8:40 |
|  | le6w0YG-ecE | Interest Maths Lit | Kevinmathscience | 456 | 10:17 |

### Mathematics · Grade 10 — Trigonometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | 4jSqFXdmKR0 | Sin Triangle Grade 10 | Kevinmathscience | 827 | 4:23 |
| ✓ | KvBqPFfzfEM | Trigonometry 2D Grade 10 Angle of elevation and depression | Miss Martins Maths and Science | 159 | 13:49 |
|  | Z9ltIFQILHw | Trigonometry Grade 10: Introduction to trig | Miss Martins Maths and Science | 156 | 13:26 |
|  | K5Odz79j7to | Grade 10 Trigonometry: Trig Ratios Sin, Cos and Tan | Miss Martins Maths and Science | 73 | 15:39 |

### Mathematics · Grade 10 — Analytical Geometry

*Note: The 813K-view Kevinmathscience video is Grade 11 revision of Grade 10 work — fine as the second clip.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | VDCxnhnkzJg | Analytical Geometry Grade 10: Distance formula - length of a line | Miss Martins Maths and Science | 71 | 9:59 |
| ✓ | w1QwFixKjBo | Analytical Geometry Grade 10 Exam Question | Kevinmathscience | 440 | 12:41 |
|  | GhiX06fp_rM | Exam Analytical Geometry Grade 10 | Kevinmathscience | 229 | 15:12 |
|  | QmNzxSM3qZA | gr 11 analytical geometry grade 10 revision | Kevinmathscience | 813 | 14:11 |

### Mathematics · Grade 10 — Euclidean Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | lJHk-dG-Or4 | Grade 10 Euclidean Geometry Exam Questions Part 1 | Miss Martins Maths and Science | 190 | 41:35 |
|  | tuAFyRv62wI | Grade 10: Euclidean Geometry / Everything you need to know | Zandile loves Maths | 805 | 3:22:39 |
| ✓ | g5b1Ygc-Tn4 | Exam Questions Grade 10 Euclidean Geometry | Kevinmathscience | 236 | 6:22 |
|  | yY9qGF-CjXI | Exam Euclidean Geometry Grade 10 | Kevinmathscience | 297 | 7:43 |

### Mathematics · Grade 10 — Statistics

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | xi8VjMmWdgI | Statistics Grade 10: Mean, mode, median | Kevinmathscience | 770 | 4:45 |
| ✓ | Hc-BUqBaUkQ | Statistics Grade 10: Exam Question | Kevinmathscience | 293 | 2:50 |
|  | oVtvnQ8OW5Y | Statistics Grade 10: Table | Kevinmathscience | 439 | 6:59 |
|  | 94_ljD-J19Y | Statistics Grade 10: Box and whisker | Kevinmathscience | 471 | 4:46 |

### Mathematics · Grade 10 — Probability

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | Hqbbyh5OEtc | Probability Grade 10 / Introduction | Kevinmathscience | 630 | 6:25 |
|  | vgAf7PxSK7E | Probability Grade 10 / Tree Diagram | Kevinmathscience | 200 | 8:48 |
| ✓ | iBoBTRrp-w8 | Probability Grade 10 / Exam Question | Kevinmathscience | 350 | 5:51 |
| ✓ | kMJVyxYiato | Probability Maths Lit Part 1 | Kevinmathscience | 390 | 8:58 |

### Mathematics · Grade 11 — Trigonometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | IhXnVk8PuJY | Trigonometry Grade 11 Exam Questions | Kevinmathscience | 225 | 4:45 |
| ✓ | Optfjw6HGZw | Trig functions grade 11 and 12: Determine Equation | Kevinmathscience | 434 | 3:27 |
| ✓ | rEFv51neoUc | General Solutions Grade 11 Trigonometry PART 1 | Miss Martins Maths and Science | 4 | 14:26 |
| ✓ | cZoEfccMapk | Trig Functions Grade 11 Exam Questions | Kevinmathscience | 14 | 9:56 |

### Mathematics · Grade 11 — Analytical Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | VB4jH92V-tg | Grade 11 Analytical geometry: angle of inclination | Kevinmathscience | 563 | 6:49 |
|  | mLAhC1DHtDc | Grade 11 analytical geometry: 4th Co-ordinate of parallelogram | Kevinmathscience | 455 | 2:55 |
|  | nvHOzaZKxbA | Grade 11 Analytical Geometry Grade 10 Revision | Miss Martins Maths and Science | 21 | 19:48 |
| ✓ | lrmASs4NOww | Grade 11 Analytical Geometry Angle of Inclination Introduction and practice | Miss Martins Maths and Science | 23 | 12:25 |

### Mathematics · Grade 11 — Euclidean Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | 4NqwU3BzOcE | Grade 11: Euclidean Geometry / Everything you need to know | Zandile loves Maths | 670 | 5:45:01 |
| ✓ | bc6x2GQcMbU | Circle Geometry Grade 11 : Practice | Kevinmathscience | 151 | 12:14 |
| ✓ | lQE642ILPDY | Euclidean Geometry Grade 11: Exam question | Kevinmathscience | 412 | 20:18 |
|  | KWYgy_YkyCA | Grade 11 - Euclidean Geometry / Tangents and chords / Mlungisi Nkosi | Mlungisi Nkosi Maths & Science | 30 | 22:02 |

### Mathematics · Grade 11 — Statistics

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | CTj0OE6lkkg | Statistics Grade 11: Ogive curve | Kevinmathscience | 832 | 6:45 |
|  | aNv4gD72-1I | Statistics Grade 11 | Kevinmathscience | 12 | 13:11 |
|  | ifJUTSTL4WU | Statistics Grade 11: Table | Kevinmathscience | 738 | 4:08 |
| ✓ | Amf60jAYIaI | Statistics Grade 11 Exam Questions | Kevinmathscience | 222 | 8:32 |

### Mathematics · Grade 12 — Calculus

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | UzVKkR-XArM | Determine Cubic Equation Calculus grade 12 | Kevinmathscience | 469 | 4:28 |
|  | 4VUWIiudCk0 | Limits Calculus Grade 12 | Kevinmathscience | 10 | 5:08 |
| ✓ | 1ye4FhvMazo | Lesson 7: How To Solve Optimisation Questions / Area, Volume & Cost / Grade 12 Calculus | Mlungisi Nkosi Maths & Science | 286 | 21:55 |
|  | _WFx3JDTuQg | Lesson 4: How To Plot and Interpret Cubic Functions / Grade 12 Calculus | Mlungisi Nkosi Maths & Science | 249 | 51:37 |

### Mathematics · Grade 12 — Sequences and Series

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | An_O1nY1lac | 17) Worksheet Series Sequences / Half | Kevinmathscience | 228 | 1:53:07 |
|  | S9oGEqRqO_8 | Grade 12 Algebra Lesson 1/ Sequences and Series : Arithmetic Sequence Explained | Mlungisi Nkosi Maths & Science | 400 | 24:34 |
| ✓ | nBFLxEZko8o | Grade 12 Mathematics / Sequence and Series / Past Exam Questions / May/June 2021_Question 2 | Mlungisi Nkosi Maths & Science | 112 | 23:09 |
| ✓ | DIOaZtU7XlA | Exam Question Series Sequences | Kevinmathscience | 79 | 7:07 |

### Mathematics · Grade 12 — Analytical Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | H4m6YuW75vw | Grade 12: Analytical Geometry / Everything you need to know | Zandile loves Maths | 97 | 2:03:08 |
| ✓ | O9mO17v2-e8 | Analytical Geometry Grade 12 Exam Questions | Kevinmathscience | 190 | 20:25 |
| ✓ | LxMkIbspJAw | Analytical Geometry Grade 12 Exam Questions | Kevinmathscience | 97 | 12:29 |
|  | RU1Uott6Xf4 | Analytical Geometry Grade 12 Exam Question | Kevinmathscience | 316 | 12:28 |

### Mathematics · Grade 12 — Euclidean Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | 9RJLHVysqA8 | Grade 12: Euclidean Geometry / Everything you need to know | Zandile loves Maths | 140 | 10:45:13 |
|  | kwsSjMvqTF4 | Grade 12: Prop Theorem and Similarity Updated / Euclidean Geometry / Everything you need to know | Zandile loves Maths | 2 | 5:27:45 |
| ✓ | nWn-HjCP9wY | Grade 12 Euclidean Geometry Exam question # 1 | Kevinmathscience | 255 | 6:26 |
| ✓ | 122eVl0o_C8 | EUCLIDEAN GEOMETRY / PROPORTIONALITY GRADE 12 [ ISIZULU ] | Isinamuva Tutoring | 73 | 1:48:45 |

### Mathematics · Grade 12 — Probability

*Note: 'Probability Maths Lit Part 1' is Mathematical Literacy, not Core Maths.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | 1IpyhSJvKiY | Grade 12: Probability / Everything you need to know | Zandile loves Maths | 94 | 2:31:34 |
| ✓ | kMJVyxYiato | Probability Maths Lit Part 1 | Kevinmathscience | 390 | 8:58 |
| ✓ | loYKqFQcksY | Gr 12 probability # 1 | Kevinmathscience | 675 | 3:48 |
|  | 0haRHA-QoAk | PROBABILITY GRADE 12 / COUNTING PRINCIPLES [ ISIZULU ] | Isinamuva Tutoring | 39 | 58:08 |

### Physical Sciences · Grade 10 — Mechanics

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | gtiOPVVKkU4 | Grade 10 Mechanics Past Paper Question Motion in One Dimension | Miss Martins Maths and Science | 48 | 10:00 |
|  | vW93Ub-vsD4 | Motion in one dimension: Frame of reference and position Grade 10 Physics | Miss Martins Maths and Science | 107 | 8:39 |
| ✓ | -wHXFMMEltw | Grade 10 Mechanics: Equations of Motion Exam Question PART 1 | Miss Martins Maths and Science | 40 | 6:06 |
|  | 7-vQ6k4bTqM | Equations of Motion Grade 10 | Kevinmathscience | 264 | 22:32 |

### Physical Sciences · Grade 10 — Transverse Waves

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | JUnMAK9qPNU | 3) Transverse Waves Grade 10 | Kevinmathscience | 388 | 24:09 |
|  | 4vDk3W66s5I | Grade 10 Physics Transverse waves Period and Frequency | Miss Martins Maths and Science | 100 | 15:05 |
| ✓ | PGgeSD7vPOQ | Grade 10 Transverse Waves Points in phase and points out of phase | Miss Martins Maths and Science | 81 | 9:28 |
| ✓ | o7BDo4CcQOI | Grade 10 Transverse waves Exam question Wavelength | Miss Martins Maths and Science | 99 | 13:10 |

### Physical Sciences · Grade 10 — Sound

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | 1u5GSxuSj7A | 5) Sound Waves Grade 10 | Kevinmathscience | 214 | 19:55 |
| ✓ | 4IpqrR4vqOw | Grade 10 Physics Sound waves | Miss Martins Maths and Science | 86 | 11:22 |
|  | 9sP74zJKcIQ | 4) Longitudinal  Waves Grade 10 | Kevinmathscience | 207 | 5:59 |
|  | JUnMAK9qPNU | 3) Transverse Waves Grade 10 | Kevinmathscience | 388 | 24:09 |

### Physical Sciences · Grade 10 — Electromagnetic Radiation

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | a4aHyWtV2Kw | Grade 10 Electromagnetic Radiation Physics: Introduction | Miss Martins Maths and Science | 228 | 13:22 |
| ✓ | AAyPp8W9mWw | Electromagnetic radiation calculations Grade 10 Physics | Miss Martins Maths and Science | 196 | 12:40 |
|  | b1JrapSyaIQ | Grade 10 Physics Particle Nature of Electromagnetic Radiation | Miss Martins Maths and Science | 87 | 8:02 |
|  | 18mpmoo4g7A | Electrostatics Grade 10 / Introduction | Kevinmathscience | 347 | 25:25 |

### Physical Sciences · Grade 10 — Electric Circuits

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | imoShDLnQqE | Circuits grade 10 / Part 1 | Kevinmathscience | 348 | 10:13 |
| ✓ | 5WRqdTr9WmQ | Circuits Grade 10 / Calculations | Kevinmathscience | 295 | 29:44 |
|  | hMAArBq00y4 | Electricity Grade 10 Electric Circuits Summary Physics | Miss Martins Maths and Science | 179 | 58:00 |
|  | JZJlJ18ggc0 | Resistance Grade 10 | Kevinmathscience | 212 | 12:33 |

### Physical Sciences · Grade 10 — Matter and Materials

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | 5M4hJjp3-lQ | Grade 10 Classification of Matter: Properties of materials | Miss Martins Maths and Science | 118 | 9:46 |
| ✓ | oADmMF84wbA | Water of Crystallization / Chemistry Grade 10-12 | Miss Martins Maths and Science | 272 | 17:52 |
|  | B5gVS4Ti3P8 | Cooling curve vs Heating curve Grade 10 Chemistry | Miss Martins Maths and Science | 75 | 10:43 |
|  | SSKvnWYbrwM | Grade 10 Matter and Materials Homogeneous and Heterogeneous mixtures | Miss Martins Maths and Science | 43 | 11:37 |

### Physical Sciences · Grade 11 — Newton's Laws

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | AFwr05QW3aY | Newton Law Gravity Grade 11 | Kevinmathscience | 255 | 19:38 |
|  | aSC1sgTUODA | Newton's second law Grade 11 and 12  [ IsiZulu ] | Isinamuva Tutoring | 71 | 1:01:49 |
| ✓ | HmoNMxId4-Y | Grade 11 Newton Laws: Objects on a slope | Kevinmathscience | 552 | 7:47 |
|  | 7YhkjSlxsrc | Grade 11 Newton Laws: Look out for normal force | Kevinmathscience | 504 | 7:17 |

### Physical Sciences · Grade 11 — Waves and Sound

*Note: Under CAPS, waves and sound are Grade 10 work; Grade 11 covers 2D/3D wavefronts and diffraction. The app's topic list may be mislabelled — the subject reviewer should confirm. Candidates below are the Grade 11 wavefront content.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | IQ_HH68wmHw | 2D & 3D Wavefronts | Mindset | 4 | 1:14:58 |
| ✓ | KXRnmQGweJE | Grade 11 - Diffraction / Huygen’s Principle & Wavefronts / November 2017 / Mlungisi Nkosi | Mlungisi Nkosi Maths & Science | 333 | 4:52 |
|  | lf689C99Sxw | Diffraction | Mindset | 2 | 50:49 |
|  | 5--qGnkJtN4 | Revision: Refraction & Diffraction | Mindset | 10 | 53:36 |

### Physical Sciences · Grade 12 — Momentum and Impulse

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | QAURZq43508 | Physics / Momentum / Conservation of linear momentum (Made easy) | Mlungisi Nkosi Maths & Science | 388 | 1:02:20 |
|  | xfTAxHUR1pU | PHYSICAL SCIENCES GRADE 12 - MOMENTUM AND IMPULSE REVISION MODERATED | PHAKAMA RESEARCH | 1 | 45:12 |
| ✓ | JOyL0KJRe0g | 1) Momentum Gr 12 / Intro | Kevinmathscience | 770 | 2:09 |
| ✓ | 7Zq7PjYaySU | Exam question momentum gr 12 | Kevinmathscience | 208 | 17:17 |

\newpage

# Appendix D. Afrikaans candidate videos by topic

Afrikaans search results per topic, curated to remove off-topic results. Videos marked "cannot embed" are set by their owner not to play inside other applications (see Appendix B).

Videos marked ✓ are currently loaded in the application as provisional selections. Reply with the codes of the videos you prefer, or confirm the current selections.


### Wiskunde (Mathematics) · Graad 10 — Algebraic Expressions

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | 68tBHlCty1M | Graad 10 Algebraïese Uitdrukkings #1: Die Getallestelsel | WiskundeMetMargie | 27 | 05:38 |
|  | xl0AdY6jZUs | Graad 10 Algebraïese Uitdrukkings #6: Produkte met Tweeterms en Drieterms | WiskundeMetMargie | 15 | 12:25 |
|  | NNyGntxiNzk | Graad 10 Algebraïese Uitdrukkings #7: Faktorisering (Kruismetode en Vele Meer) | WiskundeMetMargie | 14 | 13:47 |
|  | de4BWka2t5g | Gr 10 Wiskunde : Faktorisering - Som en Verskil van Derdemagte (cannot embed) | HouNetOpSukkel | 256 | 10:18 |

### Wiskunde (Mathematics) · Graad 10 — Equations and Inequalities

*Note: The three strong videos are all HouNetOpSukkel and cannot be embedded. The only embeddable one has 45 views. Weak topic.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | tU4eNI2SwAE | Gr 10 Wiskunde : Gelyktydige Vergelykings - Substitusie en Eliminasie (cannot embed) | HouNetOpSukkel | 406 | 25:26 |
|  | tiWXFqpqsgs | Gr 10 Wiskunde : Lineêre Ongelykhede (cannot embed) | HouNetOpSukkel | 267 | 18:56 |
|  | QcmyvFc1r9U | Gr 10 Wisk : Hersieningsklas 2.1 - Vergelykings en Ongelykhede (cannot embed) | HouNetOpSukkel | 145 | 20:06 |
| ✓ | 8IUh8jx2vrM | Gr10 (CAPS) Vergelykings en Ongelykhede | Philpotts Consultancy | 45 | 10:09 |

### Wiskunde (Mathematics) · Graad 10 — Functions and Graphs

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | oORnjRomY5w | Gr 10 Wiskunde : Funksies - Parabool Intro | HouNetOpSukkel | 476 | 10:04 |
|  | Fv-g8e-ZZdE | Gr 10 Wiskunde : Funksies - Bepaal die Vergelyking van 'n Parabool | HouNetOpSukkel | 310 | 11:13 |
| ✓ | 90DcF3f3V7c | Funksies Parabool Graad10: L6 Grafiek Interpretasie Eksamen vraag | Online Maths by Miss Pythagoras | 293 | 08:11 |
|  | i4bKrt8Puk4 | Skets Van Funksies En Grafieke // Wiskunde Graad 10 | CollieMath Studio | 532 | 11:26 |

### Wiskunde (Mathematics) · Graad 10 — Number Patterns

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | 5TV5cYTMytA | Graad 10 Wiskunde: Linieere Getalpatrone | Dalene Coetzee | 898 | 11:30 |
|  | 0y9fAfDp3TM | Getalpatrone Graad10: L1 Hersiening en Inleiding | Online Maths by Miss Pythagoras | 569 | 06:01 |
|  | jAMB56RrfDs | W10 Getalpatrone graad 10 | Stefan Buys | 22 | 08:27 |
| ✓ | C7igJjQ_rsM | Graad 10 Wiskunde Hersiening: Getalpatrone / Vrae uit Vorige Vraestelle (KABV) | Smart Culture Education | 625 | 09:39 |

### Wiskunde (Mathematics) · Graad 10 — Finance and Growth

*Note: Last video is Grade 11 level. Mathematical Literacy results were removed.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | T7zTTrn1ulE | Graad 10 Wiskunde Les 1 Enkelvoudige en saamgestelde rente 13 tot 17 Julie | Rochelle Van der Merwe | 18 | 08:14 |
|  | K08zwu3OID0 | Graad 10 / Verstaan Enkelvoudige Rente: 'n Inleiding | Smart Culture Education | 495 | 03:55 |
|  | mGIa5BYX9vM | Enkelvoudige en Saamgestelde Rente - Graad 11 | SlimDink | 21 | 08:51 |

### Wiskunde (Mathematics) · Graad 10 — Trigonometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | U3rGPy484Ro | Graad 10 Trigonometrie | YCDM - YouCanDoMaths | 128 | 08:56 |
|  | aYs5h0288mg | Gr10 Trigonometrie - Les 5 Sakrekenaar Spesiale hoeke | Lekker Wiskunde | 289 | 11:49 |
|  | pNasYZnXYSw | Gr. 10 Wiskunde: Trigonometrie | Danike Aucamp_Wiskunde en Wetenskap | 678 | 28:06 |
|  | ZVc-YFUfwtE | Gr 10 Wiskunde : Trigonometrie - Oplos van Driehoeke (cannot embed) | HouNetOpSukkel | 846 | 36:44 |

### Wiskunde (Mathematics) · Graad 10 — Analytical Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | jndysNtUg9s | Analitiese meetkunde Middelpunt Graad 10 en ouer  (wiskvaw) | VAW-Vereniging vir Afrikaanse Wiskunde-onderwysers | 22 | 02:12 |
|  | arh51glLHFU | W10 3.Analitiese Meetkunde Hellings/Gradiënte | Stefan Buys | 419 | 04:46 |
| ✓ | 4kCOeJdhECM | Gr10 Junie Eksamen voorbereiding: Analitiese Meetkunde | Lichelle Barnard | 116 | 24:15 |
|  | 0EgRpXmKq44 | Gr 10 Wisk : Hersieningsklas 4 - Analitiese Meetkunde (cannot embed) | HouNetOpSukkel | 500 | 12:53 |

### Wiskunde (Mathematics) · Graad 10 — Euclidean Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | 8ev_al-joQI | Graad 10 Euklidiese Meetkunde #1: Inleiding | WiskundeMetMargie | 25 | 08:06 |
|  | 37yh72NntxQ | Graad 10 Euklidiese Meetkunde #10 : Middelpuntstelling met Voorbeelde | WiskundeMetMargie | 608 | 16:39 |
|  | oda9jTEWVyU | Graad 10 Euklidiese meetkunde Parallelo gramme | Wiskunde | 100 | 14:10 |
| ✓ | BSDa-8njr2w | Euklidiese Meetkunde Voorbeelde - Verduideliking // Wiskunde Graad 10 | CollieMath Studio | 382 | 01:09:43 |

### Wiskunde (Mathematics) · Graad 10 — Statistics

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | twoRWkbvv_o | Graad 10 Wiskunde Les 1 Statistiek | Rochelle Van der Merwe | 70 | 04:12 |
|  | IyFhkpXp9zM | Gr. 10 - Statistiek Video 1 | QuickMafs | 18 | 04:23 |
|  | GuM1joF5aWw | Graad 10 Wiskunde Memo 1 Statistiek | Rochelle Van der Merwe | 377 | 05:28 |
|  | aYxCSk3zeTg | Data Hantering Voorbeeld Verduideliking // Wiskunde Graad 10 | CollieMath Studio | 893 | 24:48 |

### Wiskunde (Mathematics) · Graad 10 — Probability

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | Gx2qBMBObYs | 01 Waarskynlikheid - Hersiening van Graad 10 | Wiskunde_Mathematics_SUM | 196 | 12:13 |
| ✓ | ZRZQV5YLuPc | Graad 10 Waarskynlikheid | YCDM - YouCanDoMaths | 130 | 13:45 |
|  | ZXDCP67cYEw | Graad 10 Wiskunde Les 1 Waarskynlikheid | Rochelle Van der Merwe | 33 | 07:13 |
|  | pLP_eWbWoVk | Graad 10 Wiskunde Les 4 Waarskynlikheid | Rochelle Van der Merwe | 704 | 01:57 |

### Wiskunde (Mathematics) · Graad 11 — Trigonometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | Jiz_6sQY418 | Graad 11 Trig identiteite (bewys) | Mathfanatics | 452 | 18:46 |
|  | WLeO-VJj-zs | Voorbeeld van Bewys die Identiteit (LK=RK) - Graad 11 | SlimDink | 818 | 03:59 |
|  | aZ31zEGOhgs | Herkende Trigonometriese Identiteite - Graad 11 | SlimDink | 138 | 08:28 |
|  | ImrMU3AKWr8 | Trigonometrie ; Bewys Van Identiteite - Verduideliking en Voorbeelde // Wiskunde Graad 11 | CollieMath Studio | 80 | 29:50 |

### Wiskunde (Mathematics) · Graad 11 — Analytical Geometry

*Note: Only one on-topic embeddable Afrikaans video surfaced. Weak topic.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | kwLfg5jJ2eI | Graad 11 Analitiese Meetkunde #6: Ewewydige (Parallele) Lyne | WiskundeMetMargie | 181 | 12:47 |
|  | 0EgRpXmKq44 | Gr 10 Wisk : Hersieningsklas 4 - Analitiese Meetkunde (cannot embed) | HouNetOpSukkel | 500 | 12:53 |

### Wiskunde (Mathematics) · Graad 11 — Euclidean Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | ULsEMok0Ksk | Sirkelmeetkunde vraagstukke 1 euklidiese graad 11 (wiskvaw) (wiskdo) | VAW-Vereniging vir Afrikaanse Wiskunde-onderwysers | 915 | 04:42 |
|  | cCej2oFSZ1s | Sirkelmeetkunde vraagstukke 3 euklidiese graad 11 (wiskvaw) (wiskdo) | VAW-Vereniging vir Afrikaanse Wiskunde-onderwysers | 229 | 04:53 |
|  | iU6JUwI7l8w | Grade 11 euklidiese meetkunde sirkels (mathdou) | Dou Kleefstra | 21 | 04:49 |
|  | HBw5Lu95IbM | Euklidiese meetkunde sirkels 11.20 (wiskdou) Graad 11 en ouer | Dou Kleefstra | 23 | 02:57 |

### Wiskunde (Mathematics) · Graad 11 — Statistics

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | FAkpy9lI958 | 04 Gegroepeerde data en ogiewe | Wiskunde_Mathematics_SUM | 138 | 09:49 |
|  | w_-oF0w5DDY | Statistiek Graad11 L2: Ogief of kumulatiewe frekwensie kurwe  Wiskunde | Online Maths by Miss Pythagoras | 50 | 10:29 |
| ✓ | v0NWn7nXALU | Gr 11 en 12 Ogief Statistiek Deel 1 - Die Basics | But They Ask It In A Funny Way | 178 | 15:28 |

### Wiskunde (Mathematics) · Graad 12 — Calculus

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | 7xLX-oLsmFM | 09 Grafiese interpretasie van afgeleide | Wiskunde_Mathematics_SUM | 43 | 05:47 |
|  | vgXpuSdQbjc | Die grafiek van die afgeleide van 'n funksie | Wiskunde Graad 12 Juffrou Koorsen | 82 | 08:22 |
|  | T7lN-6kcGE0 | Graad 12 Differensiaalrekene Kort metode | Wiskunde | 23 | 25:55 |
| ✓ | n3XE5NtY-Ls | Differensiasie - Verduideliking en Voorbeelde // Wiskunde Graad 12 | CollieMath Studio | 341 | 36:12 |

### Wiskunde (Mathematics) · Graad 12 — Sequences and Series

*Note: HouNetOpSukkel has the best three (20–30K views each) but all block embedding. One embeddable alternative with 362 views.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | Pu2B6FY7YkA | Graad 12, Vraestel 1, Vraag 2, Rye en Reekse Video 1: Teorie | Wizzkunde | 362 | 08:16 |
|  | EGLMIlomhjM | Gr 12 Wiskunde : Rye en Reekse - Sigma Notasie (cannot embed) | HouNetOpSukkel | 298 | 24:07 |
|  | FZFIkpQgD8s | Gr 12 Wiskunde : Rye en Reekse - Bewys Sn vir 'n Meetkundige Reeks (cannot embed) | HouNetOpSukkel | 200 | 05:34 |
|  | cxg1zOYHBng | Gr 12 Wiskunde : Rye en Reekse - Bewys Sn vir 'n Rekenkundige Reeks (cannot embed) | HouNetOpSukkel | 236 | 03:28 |

### Wiskunde (Mathematics) · Graad 12 — Analytical Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | 9YT8XPAM9Vc | Analitiese Meetkunde Graad 12 Wiskunde: L1 Sirkel met oorsprong middelpunt | Online Maths by Miss Pythagoras | 68 | 13:48 |
|  | w5nJdK5AdFQ | 04  Raaklyne aan sirkels | Wiskunde_Mathematics_SUM | 42 | 09:07 |
|  | v3HhBGG552c | A1 Gr 12 Analitiese Meetkunde Sirkel by oorsprong | Wiskunde Graad 12 Juffrou Koorsen | 773 | 05:03 |
|  | Pwf6Ukzv38I | Gr12 Analitiese Meetkunde : Sirkels Notas - Snyding (Interne en Eksterne) | 123 Maths Training | 91 | 03:12 |

### Wiskunde (Mathematics) · Graad 12 — Euclidean Geometry

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | 1dqCThLt2Fk | Euklidiese Meetkunde Graad12: L1 Eweredigheid in Driehoeke( Lyn ewewydig een sy van driehoek) | Online Maths by Miss Pythagoras | 79 | 15:40 |
|  | Sj5pFbuGtK4 | Eweredigheid | Wiskunde Broers | 77 | 08:19 |
|  | ffTCN19mHMw | Euklidiese Meetkunde Gemengde Maklike Voorbeelde #1 - #7 // Wiskunde Graad 12 | CollieMath Studio | 155 | 49:03 |
| ✓ | GbXpQ2YDdNQ | Eweredigheid en Gelykvormigheid Verduideliking Via Voorbeelde // Wiskunde Graad 12 | CollieMath Studio | 247 | 01:21:17 |

### Wiskunde (Mathematics) · Graad 12 — Probability

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | 5HNopMSeyLg | Waarskynlikheid Graad12: L1 Fundamentele Telbeginsel Wiskunde | Online Maths by Miss Pythagoras | 59 | 10:56 |
|  | kOSiMdRRPBg | Telbeginsels Waarskynlikheid Graad 12 (wiskdou) | Dou Kleefstra | 32 | 04:49 |
|  | pnZ3qXnhT08 | Waarskynlikheid - Fundamentele Telbeginsel | Arnold Lamont | 26 | 09:02 |
|  | 0gtdb64d5jg | Wiskunde met LitNet: graad 12 – Waarskynlikheid | Chris Brunette | 221 | 12:23 |

### Fisiese Wetenskappe (Physical Sciences) · Graad 10 — Mechanics

*Note: No on-topic Afrikaans video surfaced for motion in one dimension. Search returned wave videos. Needs a manual search or an English fallback.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|

### Fisiese Wetenskappe (Physical Sciences) · Graad 10 — Transverse Waves

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | fhCoYWh97Nc | Transversale golwe: Graad 10 Fisika | Ekstra Wetenskap Klasse | 34 | 06:46 |
|  | IoqhxiZgT5U | Gr 10 Fisiese Wetenskappe Transversale Golwe - Janiena Daubert | Hoërskool Noordheuwel | 29 | 54:19 |
|  | tiXt-JRl2tQ | Gr 10 Fisika : Hersieningsklas 1 - Transversale en Longitudinale Golwe (cannot embed) | HouNetOpSukkel | 381 | 21:17 |

### Fisiese Wetenskappe (Physical Sciences) · Graad 10 — Sound

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | 9NSTY53rU0o | Gr.10 Longitudinale golwe | Douwliena Fourie | 741 | 03:31 |
| ✓ | Ye7QmYuHeBE | Gr 10 Fisiese Wetenskappe Longitudinale Golwe - Janiena Daubert | Hoërskool Noordheuwel | 19 | 23:13 |
|  | tiXt-JRl2tQ | Gr 10 Fisika : Hersieningsklas 1 - Transversale en Longitudinale Golwe (cannot embed) | HouNetOpSukkel | 381 | 21:17 |

### Fisiese Wetenskappe (Physical Sciences) · Graad 10 — Electromagnetic Radiation

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
|  | yVipv9v9JVo | Elektromagnetiese golwe en spektrum Graad 10 Fisika | Ekstra Wetenskap Klasse | 22 | 09:55 |
| ✓ | nxug2Fhnud8 | Gr.10 Formuleblad. Elektromagnetiese golwe. | Douwliena Fourie | 435 | 01:20 |
|  | cXkvDhvqQO0 | Gr 10 Fisika : Hersieningsklas 2 - Elektromagnetiese Golwe (cannot embed) | HouNetOpSukkel | 201 | 10:39 |

### Fisiese Wetenskappe (Physical Sciences) · Graad 10 — Electric Circuits

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | xO7N97B1RB0 | Stroombane: Berekeninge Graad 10 Fisika | Ekstra Wetenskap Klasse | 47 | 07:08 |
|  | fc9fd9d5J14 | Stroombane: Voorbeelde van stroombaan berekeninge Graad 10 Fisika | Ekstra Wetenskap Klasse | 90 | 10:45 |
|  | efdBSXXC85A | Gr 10 Fisika : Hersieningsklas 4 - Stroombane 1 (cannot embed) | HouNetOpSukkel | 402 | 17:40 |
|  | fe58DwqVx9o | Gr 10 Fisika : Hersieningsklas 4 - Stroombane 2 (cannot embed) | HouNetOpSukkel | 193 | 13:10 |

### Fisiese Wetenskappe (Physical Sciences) · Graad 10 — Matter and Materials

*Note: Thin: one general chemistry overview and one long lab video.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | _Ad0WdFmEsY | Gr. 10 Chemie: Fisiese en Chemiese verandering in 'n NEUTEDOP  | Danike Aucamp_Wiskunde en Wetenskap | 44 | 12:58 |
|  | 69ybb2h55aU | Gr 10 Fisiese Wetenskappe: Erken Anione in oplossings | Mari Bartholomae | 32 | 39:31 |

### Fisiese Wetenskappe (Physical Sciences) · Graad 11 — Newton's Laws

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | FA5DBBNyS8E | Newton se wette: Trek krag teen 'n hoek | HenBot Wetenskap | 45 | 13:46 |
|  | ZT1bhZDYBD8 | Fisika / Newton se Wette Eksamenvraag 6 / Fisiese Wetenskappe CAPS / Gr 11 - 12 | Shap Science SA - Juffrou R | 110 | 27:27 |
|  | 8nD6e9mqQBY | Gr 11 Wetenskap : Meganika - Newton 2 Vb 1 (cannot embed) | HouNetOpSukkel | 499 | 07:26 |
|  | jPxiSarJxE4 | Gr 11 Wetenskap : Meganika - Newton 2 Vb 4 (cannot embed) | HouNetOpSukkel | 196 | 09:28 |

### Fisiese Wetenskappe (Physical Sciences) · Graad 11 — Waves and Sound

*Note: No on-topic Afrikaans video surfaced for 2D/3D wavefronts or diffraction. Results were vectors and redox. Use the English Mindset videos.*

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|

### Fisiese Wetenskappe (Physical Sciences) · Graad 12 — Momentum and Impulse

| Loaded | Code | Title | Channel | Views | Length |
|:---:|---------|-------------------------------|--------------|-------:|------|
| ✓ | 2YERVz7HUMI | Momentum en Impuls - Afrikaans Potgooi / Fisika / Fisiese Wetenskappe / Graad 12 NSS | Simple Science | 228 | 08:20 |
|  | q7-CZbl6M8k | Boost Series: Momentum en Impuls | STEM in ACTION MandelaUni | 835 | 41:03 |
|  | TRrTMvHCh08 | Newton se Tweede Wet en Momentum / Graad 12 Fisiese Wetenskap / CAPS Afrikaans | Nelius Maths and Science Tutor | 4 | 21:39 |
|  | 9x--nIiaIH8 | Gr 12 Nas : Meganika - Momentum en Impuls (cannot embed) | HouNetOpSukkel | 311 | 24:54 |
