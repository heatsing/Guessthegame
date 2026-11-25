import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getPlatformProxy } from "wrangler";

import { QuestionStore } from "../lib/play/store";
import { handleRoundAction, loadNextRound } from "../lib/play/service";
import type { PlayResult } from "../lib/play/types";

async function testStore() {
  const platform = await getPlatformProxy<CloudflareEnv>({
    persist: false,
    remoteBindings: false,
  });
  const db = platform.env.PLAY_DB;
  const store = new QuestionStore(db);
  const game = "guess-the-movie";
  const session = "store-test-session";

  try {
    const migration = await readFile("migrations/play/0001_question_bank.sql", "utf8");
    const statements = migration.split(/;\s*(?:\r?\n|$)/).map((sql) => sql.trim()).filter(Boolean);
    await db.batch(statements.map((sql) => db.prepare(sql)));
    await db.prepare("INSERT INTO topics VALUES (?, 'test', 'Test')").bind(game).run();
    await db.prepare("INSERT INTO topics VALUES (?, 'empty', 'Empty')").bind(game).run();
    const fixtures = [
      { id: "alpha", status: "published", difficulty: "easy" },
      { id: "beta", status: "published", difficulty: "easy" },
      { id: "gamma", status: "published", difficulty: "hard" },
      { id: "draft", status: "draft", difficulty: "easy" },
      { id: "archived", status: "archived", difficulty: "easy" },
    ];
    for (const { id, status, difficulty } of fixtures) {
      await db.batch([
        db.prepare(`
          INSERT INTO questions (id, game_slug, question_key, topic_slug, difficulty, status, published_revision, updated_at)
          VALUES (?, ?, ?, 'test', ?, ?, ?, 1)
        `).bind(id, game, id, difficulty, status, status === "draft" ? null : 1),
        db.prepare(`
          INSERT INTO question_revisions (question_id, revision, prompt, hints_json, answer_config_json, explanation, sources_json, created_at)
          VALUES (?, 1, ?, '["First","Second"]', ?, 'Explanation', '[]', 1)
        `).bind(id, "Clue for " + id, JSON.stringify({ type: "title", answer: id, aliases: [] })),
      ]);
    }

    assert.deepEqual(await store.listTopics(game), [{ slug: "test", name: "Test" }]);
    assert.equal(await store.startRound(game, { topic: "empty" }), null);
    assert.equal(await store.startRound("guess-the-book"), null);
    const first = await store.startRound(game, { recentQuestionIds: ["alpha", "beta"] });
    assert.ok(first);
    assert.equal(first.question.questionId, "gamma");
    assert.equal(await store.getRound("guess-the-book", first.id), null);
    assert.deepEqual(await store.getStatistics(), []);

    const claims = await Promise.all([
      store.saveRound(first, { sessionId: session, hintCount: 1 }),
      store.saveRound(first, { sessionId: "competing-session", hintCount: 1 }),
    ]);
    assert.equal(claims.filter(Boolean).length, 1);
    const claimed = await store.getRound(game, first.id);
    assert.ok(claimed?.sessionId);
    const owner = claimed.sessionId;
    assert.equal(claimed.hintCount, 1);
    assert.equal(await store.saveRound(claimed, { sessionId: "wrong-session" }), false);

    const correct: PlayResult = { outcome: "assisted", answer: "gamma", guess: "gamma", explanation: "Solved", sources: [] };
    const reveal: PlayResult = { outcome: "revealed", answer: "gamma", explanation: "Revealed", sources: [] };
    const settlements = await Promise.all([
      store.saveRound(claimed, { sessionId: owner, result: correct }),
      store.saveRound(claimed, { sessionId: owner, result: reveal }),
    ]);
    assert.equal(settlements.filter(Boolean).length, 1);
    const settled = await store.getRound(game, first.id);
    assert.ok(settled);
    assert.deepEqual(settled.result, settlements[0] ? correct : reveal);
    await store.saveRound(settled, { sessionId: owner, hintCount: 2, result: correct });
    const preserved = await store.getRound(game, first.id);
    assert.deepEqual(preserved?.result, settled.result);
    assert.equal(preserved?.hintCount, 1);

    const next = await store.startRound(game, {
      recentQuestionIds: ["alpha", "beta", "gamma"],
      difficulty: "easy",
      sessionId: owner,
      prefetch: true,
    });
    assert.ok(next);
    assert.equal(next.question.questionId, "beta");
    let [stats] = await store.getStatistics(game);
    assert.equal(stats.roundsStarted, 1);
    assert.equal(stats.roundsSettled, 1);
    assert.equal(stats.sessionsFirstSettled, 1);
    assert.equal(stats.sessionsSecondStarted, 0);
    await store.saveRound(next, { sessionId: owner });
    [stats] = await store.getStatistics(game);
    assert.equal(stats.roundsStarted, 2);
    assert.equal(stats.sessionsSecondStarted, 1);

    await db.batch([
      db.prepare(`
        INSERT INTO question_revisions (question_id, revision, prompt, hints_json, answer_config_json, explanation, sources_json, created_at)
        SELECT question_id, 2, 'Edited beta', hints_json, answer_config_json, explanation, sources_json, 2
        FROM question_revisions WHERE question_id = 'beta'
      `),
      db.prepare("UPDATE questions SET revision = 2, published_revision = 2 WHERE id = 'beta'"),
    ]);
    assert.equal((await store.getRound(game, next.id))?.question.revision, 1);
    const edited = await store.startRound(game, { recentQuestionIds: ["alpha"], difficulty: "easy" });
    assert.equal(edited?.question.revision, 2);
    await db.prepare("UPDATE question_revisions SET invalidated_at = 1 WHERE question_id IN ('beta', 'gamma') AND revision = 1").run();
    assert.equal(await store.getRound(game, next.id), null);
    assert.equal(await store.saveRound(next, { sessionId: owner }), false);
    assert.deepEqual((await store.getRound(game, first.id))?.result, settled.result);

    const progression = await store.startRound(game, { recentQuestionIds: ["beta"], difficulty: "easy" });
    assert.ok(progression);
    const identity = { roundId: progression.id, revision: progression.question.revision, sessionId: "progression-test" };
    const miss = await handleRoundAction(store, game, { ...identity, action: "check", guess: "zzzzz" });
    assert.deepEqual(miss, { status: 200, body: { status: "retry", accuracy: 0 } });
    assert.equal((await loadNextRound(store, game, { ...identity, prefetch: true })).status, 409);
    const success = await handleRoundAction(store, game, {
      ...identity, action: "check", guess: progression.question.questionId,
    });
    assert.equal("result" in success.body && success.body.result?.accuracy, 100);
    const repeated = await handleRoundAction(store, game, { ...identity, action: "check", guess: "zzzzz" });
    assert.deepEqual(repeated, success);
    assert.equal((await loadNextRound(store, game, { ...identity, sessionId: "another-session" })).status, 410);
    assert.equal((await loadNextRound(store, game, { ...identity, prefetch: true })).status, 200);
    console.log("D1 pool selection, concurrent settlements, activity statistics, and pinned revisions passed.");
  } finally {
    await platform.dispose();
  }
}

testStore().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
