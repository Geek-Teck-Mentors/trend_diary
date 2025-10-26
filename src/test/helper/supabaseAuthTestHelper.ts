import { createClient } from '@supabase/supabase-js'
import TEST_ENV from '@/test/env'

// SupabaseローカルのデフォルトのService Role Key
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

class SupabaseAuthTestHelper {
  private adminClient = createClient(TEST_ENV.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  private createdUserIds: string[] = []
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
    this.createdUserIds = []
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

    this.createdUserIds.push(data.user.id)

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
