// 程序文件接口
export interface ProgramFile {
  id: string
  fileName: string
  language: string
  status: 'uncompiled' | 'compiling' | 'compiled' | 'error'
  lastModified: string
  description: string
  author: string
  version: string
}

// 查询参数接口
export interface QueryParams {
  language?: string
  dateRange?: [string, string]
  keyword?: string
  page: number
  pageSize: number
  sortField?: string
  sortOrder?: 'ascend' | 'descend'
}

// 表格列配置
export interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  sorter?: boolean
  fixed?: 'left' | 'right'
}

// 操作权限配置
export interface ActionPermission {
  edit: boolean
  delete: boolean
  compile: boolean
  export: boolean
}

// API响应接口
export interface ApiResponse<T> {
  data: T
  total: number
  success: boolean
  message?: string
}
