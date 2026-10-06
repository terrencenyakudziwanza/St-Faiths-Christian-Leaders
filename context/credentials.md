# Development Credentials

No dummy admin username/email or password was found in the supplied context specifications or project files. The login page uses Supabase email/password authentication; access also requires a matching active admin or editor entry in `public.cms_users`. 

The project `.env` contains the Supabase project URL and public anon key, which configure the frontend but do not authenticate an administrator. Do not use these values as login credentials.

To access the dashboard, use the credentials for an existing Supabase Auth user whose `cms_users` record is active and has the appropriate role, or create/invite a development admin through the project's Supabase setup. The account credentials need to be supplied or reset in Supabase; they cannot be inferred from this repository.
