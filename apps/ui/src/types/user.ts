import type { Dayjs } from 'dayjs'

// 用户角色类型
export type UserRole = 'admin' | 'user' | 'guest'

// 性别类型
export type Gender = 'male' | 'female' | 'other'

// 账户状态
export type UserStatus = 'enabled' | 'disabled'

// 用户信息接口
export interface User {
  id: string
  username: string
  avatar: string
  role: UserRole
  gender: Gender
  ipAddress: string
  lastLoginTime: string
  isOnline: boolean
  status: UserStatus
  registrationDate: string
  email?: string
}

// 基础查询参数
interface BaseQueryParams {
  status?: UserStatus
  isOnline?: boolean
  username?: string
}

// 查询参数接口
export interface UserQueryParams extends BaseQueryParams {
  page: number
  pageSize: number
  dateRange?: [string, string]
}

// 表单状态接口
export interface FilterFormState extends BaseQueryParams {
  dateRange?: [Dayjs, Dayjs]
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 用户表格列配置
export interface Column {
  title: string
  dataIndex: string
  key: string
  width?: number
  fixed?: 'left' | 'right'
  sorter?: boolean
  slots?: {
    customRender?: string
  }
}

export interface RegisterUser {
  password: string
  email: string
  verificationCode: string
}
