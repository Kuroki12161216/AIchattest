'use strict';

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'store_dashboard.json');

const DUMMY_STORES = [
  { name: '渋谷店', area: '東京', monthly_sales: 1250000, monthly_target: 980000, growth_rate: 0.16, customer_satisfaction: 4.3, employees: 42 },
  { name: '梅田店', area: '大阪', monthly_sales: 980000, monthly_target: 910000, growth_rate: 0.07, customer_satisfaction: 4.0, employees: 37 },
  { name: '博多店', area: '福岡', monthly_sales: 870000, monthly_target: 760000, growth_rate: 0.14, customer_satisfaction: 4.4, employees: 35 },
  { name: '名駅店', area: '愛知', monthly_sales: 1110000, monthly_target: 950000, growth_rate: 0.12, customer_satisfaction: 4.1, employees: 40 },
];

function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ stores: DUMMY_STORES }, null, 2), 'utf-8');
  }
}

function fetchStoreDiagnosis() {
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  const rows = [...data.stores].sort((a, b) => b.monthly_sales - a.monthly_sales);

  return rows.map((row) => {
    const achievementRate = Math.round((row.monthly_sales / row.monthly_target) * 1000) / 10;

    let status, action;
    if (achievementRate >= 110 && row.customer_satisfaction >= 4.2) {
      status = '好調';
      action = '成功施策を他店舗へ横展開';
    } else if (achievementRate >= 100) {
      status = '安定';
      action = '人員育成で更なる顧客体験向上';
    } else {
      status = '要改善';
      action = '販促強化とオペレーション見直し';
    }

    return { ...row, achievement_rate: achievementRate, status, action };
  });
}

module.exports = { initDb, fetchStoreDiagnosis };
