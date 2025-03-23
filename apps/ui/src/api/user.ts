import { axios } from '@/plugins/axios'
import type { User, UserQueryParams, PaginatedResponse } from '@/types/user'

const BASE_URL = '/api/users'

// 获取用户列表
export const getUserList = async (params: UserQueryParams): Promise<PaginatedResponse<User>> => {
  const { data } = await axios.get<PaginatedResponse<User>>(BASE_URL, { params })
  return data
}

// 获取单个用户信息
export const getUser = async (id: string): Promise<User> => {
  const { data } = await axios.get<User>(`${BASE_URL}/${id}`)
  return data
}

// 创建用户
export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const { data } = await axios.post<User>(BASE_URL, user)
  return data
}

// 更新用户信息
export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
  const { data } = await axios.put<User>(`${BASE_URL}/${id}`, user)
  return data
}

// 删除用户
export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`)
}

// 批量删除用户
export const batchDeleteUsers = async (ids: string[]): Promise<void> => {
  await axios.delete(BASE_URL, { data: { ids } })
}

// 启用/禁用用户
export const toggleUserStatus = async (
  id: string,
  status: 'enabled' | 'disabled',
): Promise<User> => {
  const { data } = await axios.patch<User>(`${BASE_URL}/${id}/status`, { status })
  return data
}

// 导出用户数据
export const exportUsers = async (params: Partial<UserQueryParams>): Promise<Blob> => {
  const { data } = await axios.get(`${BASE_URL}/export`, {
    params,
    responseType: 'blob',
  })
  return data
}

// 批量导出选中的用户数据
export const exportSelectedUsers = async (ids: string[]): Promise<Blob> => {
  const { data } = await axios.post(
    `${BASE_URL}/export`,
    { ids },
    {
      responseType: 'blob',
    },
  )
  return data
}
