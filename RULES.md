# تدبُّر — Agent Rules (paste at the start of every session)

## What this is
Arabic-only, RTL, offline-first Android app (Kotlin + Jetpack Compose).
One Quranic ayah per day: فهم → تدبُّر → معايشة → تدوين.
Full spec: docs/tdbr-app-build-spec.md — read it before large tasks.

## Hard rules (never violate)
1. SACRED CONTENT IS READ-ONLY: never write, edit, translate, complete, "fix",
   or generate Quranic text, tafsir, gharib meanings, hadith, athar, scholar
   quotes, or sourced duas. They exist only in
   app/src/main/assets/content/ (ayat_ar.json + gems_ar.json), pasted by the
   human from verified sources. If a task seems to require generating such
   content, STOP, leave a "…" placeholder, and ask the human.
2. No gamification: no streaks, badges, points, fire emojis, or "don't break
   the chain" copy. Consistency = محاسبة النفس only.
3. RTL only: supportsRtl, Arabic locale, LayoutDirection.Rtl at the root,
   start/end padding only, AutoMirrored icons. Never absolute left/right.
4. All UI strings in res/values/strings.xml (Arabic). No hardcoded Arabic in
   composables. (Quran/tafsir/gem content comes from the JSON, not strings.xml.)
5. Every change: clean build, zero lint warnings, all tests green.
6. Offline-first: no network calls (Firebase Analytics is the only permitted
   exception, and it must stay optional behind the Analytics interface).
7. No new dependencies without asking.
8. NO SOURCE → NO RENDER: every sacred/scholarly text block shown anywhere
   (gem, ayah, tafsir, gharib, shahid, sourced dua) must display its source
   caption from content metadata. If `source` is blank or missing, the block
   is not rendered at all (debug builds log a warning). Share actions always
   append "— المصدر: {source}" via the single SharePayload builder.
