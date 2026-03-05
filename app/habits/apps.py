from django.apps import AppConfig


class HabitsConfig(AppConfig):
    name = 'app.habits'

    def ready(self):
        import app.habits.signals
