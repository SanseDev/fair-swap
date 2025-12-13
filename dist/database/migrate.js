import 'dotenv/config';
import { db } from '../config/database.js';
async function migrate() {
    try {
        console.log('Running migrations...');
        console.log('Database URL:', process.env.DATABASE_URL || 'using default');
        await db.migrate.latest();
        console.log('Migrations completed successfully');
        await db.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        await db.destroy();
        process.exit(1);
    }
}
migrate();
//# sourceMappingURL=migrate.js.map