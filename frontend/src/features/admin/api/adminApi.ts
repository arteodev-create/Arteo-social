import { AdminService } from '@services/admin.service';

export const adminApi = {
  getStats: AdminService.getStats,
  getUsers: AdminService.getUsers,
  updateUser: AdminService.updateUser,
  getPosts: AdminService.getPosts,
  deletePost: AdminService.deletePost,
  getTables: AdminService.getTables,
  getTableData: AdminService.getTableData,
  getTableSchema: AdminService.getTableSchema,
  updateColumn: AdminService.updateColumn,
  addRow: AdminService.addRow,
  deleteRow: AdminService.deleteRow,
};
