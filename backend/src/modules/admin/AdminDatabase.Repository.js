const prisma = require('../../config/Prisma.Client');

/**
 * AdminDatabaseRepository
 * Handles raw structural database operations for Arteo Administration.
 * Refactored for ABS v14.1 Platinum.
 */
class AdminDatabaseRepository {
    constructor() {
        this.prisma = prisma;
    }

    /**
     * Enumerates all physical tables in the public schema.
     */
    async getTables() {
        const tables = await this.prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name ASC;
        `;
        return tables.map(t => t.table_name);
    }

    /**
     * Retrieves column metadata for a physical table.
     */
    async getTableSchema(safeTableName) {
        return await this.prisma.$queryRawUnsafe(`
            SELECT 
                column_name as name, 
                data_type as type, 
                is_nullable as nullable,
                column_default as default_value,
                character_maximum_length as length
            FROM information_schema.columns
            WHERE table_name = '${safeTableName}'
            ORDER BY ordinal_position;
        `);
    }

    /**
     * Retrieves paginated row data from a physical table.
     */
    async getTableData(safeTableName, limit, offset) {
        return await this.prisma.$queryRawUnsafe(`
            SELECT * FROM "${safeTableName}"
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)};
        `);
    }

    /**
     * Executes an ALTER TABLE command.
     */
    async executeAlter(query) {
        return await this.prisma.$executeRawUnsafe(query + ';');
    }

    /**
     * Executes an INSERT command.
     */
    async executeInsert(safeTableName, columns, values) {
        return await this.prisma.$executeRawUnsafe(`INSERT INTO "${safeTableName}" (${columns}) VALUES (${values});`);
    }

    /**
     * Executes a DELETE command.
     */
    async executeDelete(safeTableName, safePkCol, formattedValue) {
        return await this.prisma.$executeRawUnsafe(`DELETE FROM "${safeTableName}" WHERE "${safePkCol}" = ${formattedValue};`);
    }

    /**
     * Finds the Primary Key column for a given table.
     */
    async getPrimaryKey(safeTableName) {
        return await this.prisma.$queryRawUnsafe(`
            SELECT kcu.column_name
            FROM information_schema.table_constraints tco
            JOIN information_schema.key_column_usage kcu 
              ON kcu.constraint_name = tco.constraint_name
              AND kcu.table_schema = tco.table_schema
              AND kcu.table_name = tco.table_name
            WHERE tco.constraint_type = 'PRIMARY KEY'
              AND kcu.table_name = '${safeTableName}';
        `);
    }

    /**
     * Basic connectivity heartbeat.
     */
    async checkConnection() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = new AdminDatabaseRepository();
