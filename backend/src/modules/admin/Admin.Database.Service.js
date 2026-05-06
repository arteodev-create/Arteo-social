const AdminDatabaseRepository = require('./AdminDatabase.Repository');
const { AppError } = require('../../core/Errors');
const Logger = require('../../infra/logging/Logger.Service');

/**
 * AdminDatabaseService
 * Orchestrates structural database management with safety validation.
 * Refactored for ABS v14.1 Platinum (Instance-based).
 */
class AdminDatabaseService {
    /**
     * Làm sạch tên bảng/cột để tránh SQL Injection trong DDL commands.
     */
    _sanitizeIdentifier(name) {
        if (!name) return '';
        // Chỉ cho phép chữ cái, số và dấu gạch dưới
        return name.replace(/[^a-zA-Z0-9_]/g, '');
    }

    /**
     * Lấy danh sách tất cả các bảng trong Database.
     */
    async getTables() {
        return await AdminDatabaseRepository.getTables();
    }

    /**
     * Kiểm tra và lấy tên bảng thực tế (không phân biệt hoa thường).
     */
    async _validateTable(tableName, errorCode = 400) {
        const allowedTables = await this.getTables();
        const normalized = tableName.toLowerCase();
        const actual = allowedTables.find(t => t.toLowerCase() === normalized);
        
        if (!actual) {
            throw new AppError(`Bảng [${tableName}] không hợp lệ hoặc không tồn tại`, errorCode);
        }
        return actual;
    }

    /**
     * Lấy chi tiết các cột của một bảng.
     */
    async getTableSchema(tableName) {
        const actualTableName = await this._validateTable(tableName, 404);
        const safeTableName = this._sanitizeIdentifier(actualTableName);
        
        return await AdminDatabaseRepository.getTableSchema(safeTableName);
    }

    /**
     * Lấy dữ liệu thực tế của bảng.
     */
    async getTableData(tableName, limit = 50, offset = 0) {
        const actualTableName = await this._validateTable(tableName);
        const safeTableName = this._sanitizeIdentifier(actualTableName);
        
        return await AdminDatabaseRepository.getTableData(safeTableName, limit, offset);
    }

    /**
     * Sửa tên cột hoặc kiểu dữ liệu (ALTER TABLE).
     */
    async updateColumn(tableName, oldName, newName, type) {
        const actualTableName = await this._validateTable(tableName);
        const safeTable = this._sanitizeIdentifier(actualTableName);
        const safeOld = this._sanitizeIdentifier(oldName);
        const safeNew = this._sanitizeIdentifier(newName);

        if (safeOld !== safeNew) {
            await AdminDatabaseRepository.executeAlter(`ALTER TABLE "${safeTable}" RENAME COLUMN "${safeOld}" TO "${safeNew}"`);
        }
        
        if (type) {
            const safeType = type.replace(/[^a-zA-Z0-9()]/g, ''); 
            await AdminDatabaseRepository.executeAlter(`ALTER TABLE "${safeTable}" ALTER COLUMN "${safeNew}" TYPE ${safeType} USING "${safeNew}"::${safeType}`);
        }

        Logger.info(`Admin [DATABASE]: Đã cập nhật cột [${oldName}] thành [${newName}] trong bảng [${actualTableName}]`);
        return true;
    }

    /**
     * Thêm cột mới vào bảng.
     */
    async addColumn(tableName, columnName, type, defaultValue = null) {
        const actualTableName = await this._validateTable(tableName);
        const safeTable = this._sanitizeIdentifier(actualTableName);
        const safeCol = this._sanitizeIdentifier(columnName);
        const safeType = type.replace(/[^a-zA-Z0-9()]/g, '');

        let query = `ALTER TABLE "${safeTable}" ADD COLUMN "${safeCol}" ${safeType}`;
        if (defaultValue !== null) {
            const safeDefault = typeof defaultValue === 'string' ? `'${defaultValue.replace(/'/g, "''")}'` : defaultValue;
            query += ` DEFAULT ${safeDefault}`;
        }

        await AdminDatabaseRepository.executeAlter(query);
        Logger.info(`Admin [DATABASE]: Đã thêm cột [${columnName}] vào bảng [${actualTableName}]`);
        return true;
    }

    /**
     * Xóa cột khỏi bảng.
     */
    async deleteColumn(tableName, columnName) {
        const actualTableName = await this._validateTable(tableName);
        const safeTable = this._sanitizeIdentifier(actualTableName);
        const safeCol = this._sanitizeIdentifier(columnName);

        await AdminDatabaseRepository.executeAlter(`ALTER TABLE "${safeTable}" DROP COLUMN "${safeCol}"`);
        Logger.info(`Admin [DATABASE]: Đã xóa cột [${columnName}] khỏi bảng [${actualTableName}]`);
        return true;
    }

    /**
     * Thêm một dòng dữ liệu mới.
     */
    async addRow(tableName, data) {
        const actualTableName = await this._validateTable(tableName);
        const safeTable = this._sanitizeIdentifier(actualTableName);
        
        const columns = Object.keys(data).map(k => `"${this._sanitizeIdentifier(k)}"`).join(', ');
        const values = Object.values(data).map(v => {
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
            return v;
        }).join(', ');

        return await AdminDatabaseRepository.executeInsert(safeTable, columns, values);
    }

    /**
     * Xóa một dòng dữ liệu (Tự động tìm Primary Key).
     */
    async deleteRow(tableName, rowIdentifier) {
        const actualTableName = await this._validateTable(tableName);
        const safeTable = this._sanitizeIdentifier(actualTableName);

        const pkQuery = await AdminDatabaseRepository.getPrimaryKey(safeTable);

        if (pkQuery.length === 0) {
            throw new AppError(`Bảng [${actualTableName}] không có Primary Key để thực hiện xóa an toàn.`, 400);
        }

        const pkColumn = pkQuery[0].column_name;
        const pkValue = typeof rowIdentifier === 'object' ? rowIdentifier[pkColumn] : rowIdentifier;

        if (!pkValue) throw new AppError(`Không tìm thấy giá trị khóa chính [${pkColumn}] để xóa.`, 400);

        const safePkCol = this._sanitizeIdentifier(pkColumn);
        const formattedValue = typeof pkValue === 'string' ? `'${pkValue.replace(/'/g, "''")}'` : pkValue;
        
        await AdminDatabaseRepository.executeDelete(safeTable, safePkCol, formattedValue);
        Logger.info(`Admin [DATABASE]: Đã xóa dòng có ${pkColumn}=${pkValue} trong bảng [${actualTableName}]`);
        return true;
    }
}

module.exports = new AdminDatabaseService();
