# kuroki-store-dashboard (dummy)

店舗診断表と、ダミーデータを参照するAIチャットボットを実装したサンプルです。

## 構成

- `app/db.py`: SQLiteダミーデータベースの初期化と店舗診断ロジック
- `app/chatbot.py`: ダミーデータを参照するチャット回答ロジック
- `app/server.py`: HTTP API (`/api/diagnosis`, `/api/chat`) + 静的フロント配信
- `app/static/index.html`, `app/static/main.js`: ダッシュボードUIとチャットUI

## 起動

```bash
python3 -m app.server
```

ブラウザで `http://localhost:8000` を開いてください。

## テスト

```bash
python3 -m unittest discover -s tests
```
