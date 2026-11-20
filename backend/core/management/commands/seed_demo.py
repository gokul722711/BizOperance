from django.core.management.base import BaseCommand
from core.seed_data import seed_demonstration_data

class Command(BaseCommand):
    help = 'Seeds initial demonstration data for BizOperance.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete existing records before seeding',
        )

    def handle(self, *args, **options):
        clear_existing = options.get('clear', False)
        self.stdout.write(self.style.NOTICE(f'Seeding demo data (clear={clear_existing})...'))
        seed_demonstration_data(clear_existing=clear_existing)
        self.stdout.write(self.style.SUCCESS('Successfully seeded BizOperance demonstration data!'))
