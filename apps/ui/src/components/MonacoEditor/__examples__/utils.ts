/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeoutId: number | undefined

  return ((...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => {
      fn(...args)
      timeoutId = undefined
    }, delay)
  }) as T
}

/**
 * 节流函数
 * @param fn 需要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): T {
  let inThrottle = false
  let lastResult: any

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      inThrottle = true
      lastResult = fn(...args)
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
    return lastResult
  }) as T
}

/**
 * 判断两个数组是否相等
 * @param arr1 第一个数组
 * @param arr2 第二个数组
 * @returns 是否相等
 */
export function arrayEquals<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false
  return arr1.every((item, index) => item === arr2[index])
}

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}