---
globs: "**/*.ts,**/*.tsx"
---

`.ts` / `.tsx` ファイルでの `try-catch` / `.catch()` は禁止。
`wrapAsyncCall`（`@yuukihayashi0510/core`）でResult型に変換して処理すること。
