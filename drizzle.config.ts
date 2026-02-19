import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
  dbCredentials: {
    // Archivo local para comandos de CLI como studio/migrate.
    // En runtime de Expo se usa el archivo del sandbox de la app.
    url: './focusquest.db',
  },
});
