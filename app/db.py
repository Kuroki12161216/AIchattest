import sqlite3
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "store_dashboard.db"

DUMMY_STORES = [
    ("渋谷店", "東京", 1250000, 980000, 0.16, 4.3, 42),
    ("梅田店", "大阪", 980000, 910000, 0.07, 4.0, 37),
    ("博多店", "福岡", 870000, 760000, 0.14, 4.4, 35),
    ("名駅店", "愛知", 1110000, 950000, 0.12, 4.1, 40),
]


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    with conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                area TEXT NOT NULL,
                monthly_sales INTEGER NOT NULL,
                monthly_target INTEGER NOT NULL,
                growth_rate REAL NOT NULL,
                customer_satisfaction REAL NOT NULL,
                employees INTEGER NOT NULL
            )
            """
        )

        count = conn.execute("SELECT COUNT(*) FROM stores").fetchone()[0]
        if count == 0:
            conn.executemany(
                """
                INSERT INTO stores (
                    name, area, monthly_sales, monthly_target,
                    growth_rate, customer_satisfaction, employees
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                DUMMY_STORES,
            )


def fetch_store_diagnosis() -> list[dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM stores ORDER BY monthly_sales DESC").fetchall()

    diagnosis = []
    for row in rows:
        achievement_rate = round((row["monthly_sales"] / row["monthly_target"]) * 100, 1)

        if achievement_rate >= 110 and row["customer_satisfaction"] >= 4.2:
            status = "好調"
            action = "成功施策を他店舗へ横展開"
        elif achievement_rate >= 100:
            status = "安定"
            action = "人員育成で更なる顧客体験向上"
        else:
            status = "要改善"
            action = "販促強化とオペレーション見直し"

        diagnosis.append(
            {
                "name": row["name"],
                "area": row["area"],
                "monthly_sales": row["monthly_sales"],
                "monthly_target": row["monthly_target"],
                "achievement_rate": achievement_rate,
                "growth_rate": row["growth_rate"],
                "customer_satisfaction": row["customer_satisfaction"],
                "employees": row["employees"],
                "status": status,
                "action": action,
            }
        )

    return diagnosis
