/**
 * HTTPメソッドに応じたTailwindCSSクラスを返す
 * @param method - HTTPメソッド（GET, POST, PUT, PATCH, DELETE等）
 * @returns Tailwindの背景色・文字色クラス
 */
export function getMethodColor(method: string): string {
  switch (method) {
    case 'GET':
      return 'bg-blue-100 text-blue-800'
    case 'POST':
      return 'bg-green-100 text-green-800'
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800'
    case 'PATCH':
      return 'bg-orange-100 text-orange-800'
    case 'DELETE':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
