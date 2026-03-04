import unittest

from app.chatbot import answer_question
from app.db import fetch_store_diagnosis, init_db


class DashboardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def test_diagnosis_exists(self):
        stores = fetch_store_diagnosis()
        self.assertGreaterEqual(len(stores), 4)
        self.assertIn("status", stores[0])

    def test_chat_store_question(self):
        answer = answer_question("渋谷店の課題は？")
        self.assertIn("渋谷店", answer)
        self.assertIn("推奨アクション", answer)

    def test_chat_summary(self):
        answer = answer_question("全店舗の一覧を教えて")
        self.assertIn("店舗診断サマリー", answer)


if __name__ == "__main__":
    unittest.main()
