from django.apps import AppConfig


class TransactionsConfig(AppConfig):
    name = 'app.transactions'

    def ready(self):
        import app.transactions.signals
