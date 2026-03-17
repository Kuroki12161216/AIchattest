'use strict';

const { fetchStoreDiagnosis } = require('./db');

function answerQuestion(message) {
  const text = (message || '').trim();
  if (!text) return '質問を入力してください。例: 渋谷店の課題は？';

  const diagnosis = fetchStoreDiagnosis();

  if (text.includes('一覧') || text.includes('全店舗')) {
    const lines = ['現在の店舗診断サマリーです。'];
    for (const d of diagnosis) {
      lines.push(
        `- ${d.name}(${d.area}): 達成率${d.achievement_rate}%, 満足度${d.customer_satisfaction}, 判定=${d.status}`
      );
    }
    return lines.join('\n');
  }

  for (const store of diagnosis) {
    if (text.includes(store.name.slice(0, 2)) || text.includes(store.name)) {
      if (text.includes('課題') || text.includes('改善')) {
        return (
          `${store.name}の診断です。\n` +
          `判定: ${store.status}\n` +
          `推奨アクション: ${store.action}\n` +
          `補足: 達成率${store.achievement_rate}%、成長率${Math.round(store.growth_rate * 100)}%です。`
        );
      }
      return (
        `${store.name}は売上${store.monthly_sales.toLocaleString()}円、` +
        `目標${store.monthly_target.toLocaleString()}円、` +
        `達成率${store.achievement_rate}%です。`
      );
    }
  }

  if (text.includes('おすすめ') || text.includes('施策')) {
    const top = diagnosis[0];
    const low = diagnosis[diagnosis.length - 1];
    return (
      `おすすめ施策は、好調な${top.name}の取り組みを${low.name}へ移植することです。` +
      '具体的には、接客研修と販促導線の再設計を優先してください。'
    );
  }

  return (
    'ダミーデータから回答します。\n' +
    "例:『全店舗の一覧を教えて』『渋谷店の課題は？』『施策のおすすめは？』"
  );
}

module.exports = { answerQuestion };
