# Managing the guessing-game question bank

Store the question CSVs outside the website repository. Maintain a separate file for each game, and keep the reviewed version of each batch with the editors. The website reads the published revisions from the `PLAY_DB` D1 database at request time.

## CSV columns

| Column | Format |
| --- | --- |
| `game_slug` | Game key such as `guess-the-book` |
| `question_key` | Stable lower-case key unique within that game |
| `topic_slug`, `topic_name` | Lower-case topic key and English topic name, or both blank |
| `difficulty` | `easy`, `medium`, or `hard` |
| `prompt` | Complete English clue and any assumptions, requested answer format, or measurement unit |
| `hints` | JSON array of zero to two strings, from least to most specific |
| `answer_config` | JSON object using the game's answer type |
| `explanation` | English explanation or derivation shown after settlement |
| `sources` | JSON array of objects with `label` and HTTPS `url`. Use `[]` for a fully self-contained clue. |

These are the accepted answer configurations.

```json
{ "type": "title", "answer": "The Hobbit", "aliases": [] }
```

```json
{ "type": "number", "target": 12, "unit": "mm", "min": 10, "max": 14 }
```

```json
{ "type": "boolean", "answer": false }
```

Quote JSON columns as CSV strings, doubling each inner double quote. An ordinary UTF-8 spreadsheet export handles this format.

## Import and review

Run the commands from the website project after applying the D1 migrations. Operations use the local database by default. Add `--remote` to a database command to use the deployment's D1 database.

```powershell
npx wrangler d1 migrations apply guessthegame-questions --local
npx tsx scripts/play-questions.ts preflight ..\question-bank\guess-the-size.csv
npx tsx scripts/play-questions.ts import ..\question-bank\guess-the-size.csv
npx tsx scripts/play-questions.ts preview guess-the-size book-spine
npx tsx scripts/play-questions.ts preview guess-the-size book-spine --guess 14 --hints 1
npx tsx scripts/play-questions.ts publish guess-the-size book-spine
```

Preflight checks structure and answer configurations. Import skips keys already in the bank and creates drafts for new records. Preview shows the private draft and runs the same checker as the game when supplied with a guess. Use `--guess true` or `--guess false` for Yes/No.

During review, check the prompt independently before looking at the answer. Verify source details, plausible alternative answers, the order of hints, and unit or spelling constraints. For two adaptations with the same title, specify the year format and include a clue that distinguishes the requested version.

For a reviewed batch, use `publish-file <csv>` to publish rows whose current draft fields match the file. The check keeps a later draft with different content from going live with the batch.

To schedule when a question enters the draw pool, add `--available-at 2027-01-01T09:00:00+08:00` to `publish` or `publish-file`. Give an ISO 8601 date and time with `Z` or an explicit UTC offset. The CLI reports the time in UTC, and `preview` shows the saved timestamp. Scheduling a previously published key holds it out of new draws until that time. Omit the flag to make the selected questions available immediately.

## Revisions and statistics

- Use `revise <csv>` with a single existing key to save a new draft revision. The current published text remains live until you publish the new revision.
- Use `preview <game-slug> <question-key> --revision N` to inspect a prior version. Open rounds can still use the version they started with.
- Use `invalidate <game-slug> <question-key> <revision>` when a version can no longer be played. Unfinished rounds for that version will ask for a new question.
- Use `archive <game-slug> <question-key>` to remove a question from selection and retain its history.
- Use `stats [game-slug]` for aggregate counts. Divide `sessionsSecondStarted` by `sessionsFirstSettled` for the second-question start rate when the denominator is greater than zero.
