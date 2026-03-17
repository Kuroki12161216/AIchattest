'use strict';

const { test, before } = require('node:test');
const assert = require('node:assert/strict');

const { initDb, fetchStoreDiagnosis } = require('../app/db');
const { answerQuestion } = require('../app/chatbot');

before(() => {
  initDb();
});

test('diagnosis_exists', () => {
  const stores = fetchStoreDiagnosis();
  assert.ok(stores.length >= 4);
  assert.ok('status' in stores[0]);
});

test('chat_store_question', () => {
  const answer = answerQuestion('渋谷店の課題は？');
  assert.ok(answer.includes('渋谷店'));
  assert.ok(answer.includes('推奨アクション'));
});

test('chat_summary', () => {
  const answer = answerQuestion('全店舗の一覧を教えて');
  assert.ok(answer.includes('店舗診断サマリー'));
});
