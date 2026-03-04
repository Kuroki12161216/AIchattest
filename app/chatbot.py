from __future__ import annotations

from .db import fetch_store_diagnosis


def answer_question(message: str) -> str:
    text = message.strip()
    if not text:
        return "質問を入力してください。例: 渋谷店の課題は？"

    diagnosis = fetch_store_diagnosis()

    if "一覧" in text or "全店舗" in text:
        lines = ["現在の店舗診断サマリーです。"]
        for d in diagnosis:
            lines.append(
                f"- {d['name']}({d['area']}): 達成率{d['achievement_rate']}%, 満足度{d['customer_satisfaction']}, 判定={d['status']}"
            )
        return "\n".join(lines)

    for store in diagnosis:
        if store["name"][:2] in text or store["name"] in text:
            if "課題" in text or "改善" in text:
                return (
                    f"{store['name']}の診断です。\n"
                    f"判定: {store['status']}\n"
                    f"推奨アクション: {store['action']}\n"
                    f"補足: 達成率{store['achievement_rate']}%、成長率{int(store['growth_rate'] * 100)}%です。"
                )
            return (
                f"{store['name']}は売上{store['monthly_sales']:,}円、"
                f"目標{store['monthly_target']:,}円、"
                f"達成率{store['achievement_rate']}%です。"
            )

    if "おすすめ" in text or "施策" in text:
        top = diagnosis[0]
        low = diagnosis[-1]
        return (
            f"おすすめ施策は、好調な{top['name']}の取り組みを{low['name']}へ移植することです。"
            "具体的には、接客研修と販促導線の再設計を優先してください。"
        )

    return (
        "ダミーデータから回答します。\n"
        "例:『全店舗の一覧を教えて』『渋谷店の課題は？』『施策のおすすめは？』"
    )
