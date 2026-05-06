const AdminDatabaseService = require('./Admin.Database.Service');
const asyncHandler = require('../../middleware/AsyncHandler');
const { dbColumnSchema, dbAddColumnSchema } = require('./Admin.Validation');

/**
 * Admin Database Controller
 * Handles low-level database operations for platform administration.
 * Standardized for ABS v14.1.
 */
class AdminDatabaseController {
    /**
     * Retrieves enumeration of all public schema tables.
     */
    listTables = asyncHandler(async (req, res) => {
        const tables = await AdminDatabaseService.getTables();
        res.success(tables, { message: 'Đã truy xuất danh sách bảng thành công.' });
    });

    /**
     * Retrieves structural schema for a specific table.
     */
    getTableSchema = asyncHandler(async (req, res) => {
        const { tableName } = req.params;
        const schema = await AdminDatabaseService.getTableSchema(tableName);
        res.success(schema, { message: `Đã truy xuất cấu trúc bảng [${tableName}] thành công.` });
    });

    /**
     * Retrieves actual row data from a specific table with pagination.
     */
    getTableData = asyncHandler(async (req, res) => {
        const { tableName } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const data = await AdminDatabaseService.getTableData(tableName, parseInt(limit), parseInt(offset));
        res.success(data, { message: `Đã truy xuất dữ liệu từ bảng [${tableName}] thành công.` });
    });

    /**
     * Modifies column metadata (rename or type change).
     */
    updateColumn = asyncHandler(async (req, res) => {
        const { tableName } = req.params;
        const validated = dbColumnSchema.parse(req.body);
        await AdminDatabaseService.updateColumn(tableName, validated.oldName, validated.newName, validated.type);
        res.success(null, { message: 'Cập nhật cột thành công.' });
    });

    /**
     * Adds a new column definition to a table.
     */
    addColumn = asyncHandler(async (req, res) => {
        const { tableName } = req.params;
        const validated = dbAddColumnSchema.parse(req.body);
        await AdminDatabaseService.addColumn(tableName, validated.name, validated.type, validated.defaultValue);
        res.success(null, { message: `Đã thêm cột [${validated.name}] thành công.` });
    });

    /**
     * Removes a column definition from a table.
     */
    deleteColumn = asyncHandler(async (req, res) => {
        const { tableName, columnName } = req.params;
        await AdminDatabaseService.deleteColumn(tableName, columnName);
        res.success(null, { message: `Đã xóa cột [${columnName}] thành công.` });
    });

    /**
     * Inserts a new data record into a table.
     */
    addRow = asyncHandler(async (req, res) => {
        const { tableName } = req.params;
        const rowData = req.body;
        await AdminDatabaseService.addRow(tableName, rowData);
        res.success(null, { message: 'Thêm dòng dữ liệu thành công.' });
    });

    /**
     * Deletes a record from a table based on its identity.
     */
    deleteRow = asyncHandler(async (req, res) => {
        const { tableName } = req.params;
        const identifier = req.body;
        await AdminDatabaseService.deleteRow(tableName, identifier);
        res.success(null, { message: 'Xóa dòng dữ liệu thành công.' });
    });
}

module.exports = new AdminDatabaseController();
