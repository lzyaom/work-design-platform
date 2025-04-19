export const originalCode = `class Calculator {
  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    return a / b;
  }
}`

export const modifiedCode = `class Calculator {
  /**
   * 加法运算
   * @param {number} a - 第一个数
   * @param {number} b - 第二个数
   * @returns {number} 两数之和
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * 减法运算
   * @param {number} a - 被减数
   * @param {number} b - 减数
   * @returns {number} 差值
   */
  subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * 乘法运算
   * @param {number} a - 第一个因数
   * @param {number} b - 第二个因数
   * @returns {number} 乘积
   */
  multiply(a: number, b: number): number {
    return a * b;
  }

  /**
   * 除法运算
   * @param {number} a - 被除数
   * @param {number} b - 除数
   * @throws {Error} 当除数为0时抛出错误
   * @returns {number} 商
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('除数不能为0');
    }
    return a / b;
  }
}`