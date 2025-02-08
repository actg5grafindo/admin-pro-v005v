# Supabase Database Migrations

## Applying Migrations

To apply these migrations, you have two options:

### 1. Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase-cli
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Apply migrations:
```bash
supabase migration up
```

### 2. Manually in Supabase Dashboard

1. Open your Supabase project
2. Navigate to "SQL Editor"
3. Create a new query
4. Copy and paste the migration SQL
5. Run the query

## Migration Details

### 20240203_create_profiles_table.sql
- Creates `profiles` table if not exists
- Adds required columns: 
  - `id` (UUID)
  - `full_name`
  - `email` (unique)
  - `username` (unique)
  - `email_verified`
- Adds optional columns:
  - `phone_number`
  - `language`
- Sets up Row Level Security
- Creates performance indexes
- Adds documentation comments

## Troubleshooting

- Ensure you have the necessary permissions
- Check Supabase project settings
- Verify database connection

For more help, contact your database administrator.
