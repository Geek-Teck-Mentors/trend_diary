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

    // 作成したユーザーを削除
    const { data } = await this.adminClient.auth.admin.listUsers()
    if (data?.users) {
      for (const user of data.users) {
        await this.adminClient.auth.admin.deleteUser(user.id)
      }
    }
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
    const { data } = await this.adminClient.auth.admin.listUsers()
    if (!data?.users) return null

    const user = data.users.find((u) => u.email === email)
    if (!user) return null

    return {
      userId: user.id,
      email: user.email ?? email,
    }
  }
}

const supabaseAuthTestHelper = new SupabaseAuthTestHelper()
export default supabaseAuthTestHelper
