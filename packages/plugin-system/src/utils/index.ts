/**
 * 生成id
 * @param prefix 前缀，默认为空
 * @returns
 */
export const generateId = (prefix?: string): string => {
  if (prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 10)}`
  }
  return Math.random().toString(36).substring(2, 10)
}
