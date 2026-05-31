To push the schema to the database (Best for local development when prototyping):

bash

npx prisma db push
(This applies the changes directly without creating a migration file. It will warn you if data loss might occur).

To create a formal migration file (Best for production tracking):

bash

npx prisma migrate dev --name init_hi_queue_schema
To completely reset/refresh the database (WARNING: Wipes all data):

bash

npx prisma migrate reset
To regenerate the Prisma Client after schema changes:

bash

npx prisma generate