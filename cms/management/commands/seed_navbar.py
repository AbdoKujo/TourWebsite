from django.core.management.base import BaseCommand
from cms.seeders.navbar import seed_navbar

class Command(BaseCommand):
    help = 'Seeds the navbar with default navigation items'

    def handle(self, *args, **kwargs):
        success = seed_navbar()
        if success:
            self.stdout.write(self.style.SUCCESS('Successfully seeded navbar'))
        else:
            self.stdout.write(self.style.ERROR('Failed to seed navbar'))