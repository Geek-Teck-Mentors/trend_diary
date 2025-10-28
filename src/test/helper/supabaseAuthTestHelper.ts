import { createClient } from '@supabase/supabase-js'
import TEST_ENV from '@/test/env'

class SupabaseAuthTestHelper {
  private adminClient = createClient(TEST_ENV.SUPABASE_URL, TEST_ENV.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  private isAvailable: boolean | null = null

  /**
   * Supabaseが利用可能かチェックする
   */
  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) {
      return this.isAvailable
    }

    try {
      // ヘルスチェック代わりにユーザー一覧を取得
      const { error } = await this.adminClient.auth.admin.listUsers()
      this.isAvailable = !error
      return this.isAvailable
    } catch {
      this.isAvailable = false
      return false
    }
  }

  async cleanUp(): Promise<void> {
    // Supabaseが利用できない場合はスキップ
    const available = await this.checkAvailability()
    if (!available) {
      return
    }

    // 作成したユーザーを削除（ページネーション対応）
    let page = 1
    let users
    do {
      const { data, error } = await this.adminClient.auth.admin.listUsers({
        page,
        perPage: 1000, // デフォルトは50件まで。テストで大量のユーザーを削除するため大きな値を指定
      })
      if (error) {
        break
      }
      users = data.users
      if (users) {
        for (const user of users) {
          await this.adminClient.auth.admin.deleteUser(user.id)
        }
      }
      page++
    } while (users && users.length > 0)
  }

  async createUser(email: string, password: string): Promise<{ userId: string; email: string }> {
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // テスト用に自動確認
    })

    if (error || !data.user) {
      throw new Error(`Failed to create user: ${error?.message}`)
    }

    return {
      userId: data.user.id,
      email: data.user.email ?? email,
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.adminClient.auth.admin.deleteUser(userId)
    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  async getUserByEmail(email: string): Promise<{ userId: string; email: string } | null> {
    let page = 1
    let hasMore = true

    while (hasMore) {
      const { data, error } = await this.adminClient.auth.admin.listUsers({
        page,
        perPage: 1000, // デフォルトは50件まで。大量のユーザーがいる場合に備えて大きな値を指定
      })

      if (error) {
        throw new Error(`Failed to list users: ${error.message}`)
      }

      const users = data.users
      if (!users || users.length === 0) {
        break
      }

      const foundUser = users.find((u) => u.email === email)
      if (foundUser) {
        return {
          userId: foundUser.id,
          email: foundUser.email ?? email,
        }
      }

      hasMore = users.length === 1000
      page++
    }

    return null
  }
}

const supabaseAuthTestHelper = new SupabaseAuthTestHelper()
export default supabaseAuthTestHelper
