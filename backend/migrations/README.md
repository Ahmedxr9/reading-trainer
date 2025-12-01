# Database Migrations

## Running Migrations

### Using Supabase SQL Editor
1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Run migrations in order (001, 002, 003, ...)
4. Verify tables are created correctly

### Using psql
```bash
psql -h your-db-host -U postgres -d your-db-name -f 001_initial_schema.sql
psql -h your-db-host -U postgres -d your-db-name -f 002_seed_badges.sql
psql -h your-db-host -U postgres -d your-db-name -f 003_seed_texts.sql
```

### Migration Order
1. `001_initial_schema.sql` - Core tables and indexes
2. `002_seed_badges.sql` - Default badges
3. `003_seed_texts.sql` - Initial reading texts

## Rollback
To rollback, manually drop tables in reverse order or create rollback scripts.

