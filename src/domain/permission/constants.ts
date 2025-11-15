/**
 * パーミッション定義（既存機能ベース）
 */
export const PERMISSIONS = {
  // ユーザー管理
  USER_LIST: { resource: 'user', action: 'list', description: 'ユーザー一覧の閲覧' },
  USER_READ: { resource: 'user', action: 'read', description: '自分の情報閲覧' },
  USER_GRANT_ADMIN: {
    resource: 'user',
    action: 'grant_admin',
    description: '管理者権限の付与',
  },

  // 記事
  ARTICLE_LIST: { resource: 'article', action: 'list', description: '記事一覧の取得' },
  ARTICLE_MARK_READ: {
    resource: 'article',
    action: 'mark_read',
    description: '記事を既読にする',
  },
  ARTICLE_MARK_UNREAD: {
    resource: 'article',
    action: 'mark_unread',
    description: '記事を未読にする',
  },

  // プライバシーポリシー
  PRIVACY_POLICY_LIST: {
    resource: 'privacy_policy',
    action: 'list',
    description: 'ポリシー一覧の閲覧',
  },
  PRIVACY_POLICY_READ: {
    resource: 'privacy_policy',
    action: 'read',
    description: 'ポリシーの閲覧',
  },
  PRIVACY_POLICY_CREATE: {
    resource: 'privacy_policy',
    action: 'create',
    description: 'ポリシーの作成',
  },
  PRIVACY_POLICY_UPDATE: {
    resource: 'privacy_policy',
    action: 'update',
    description: 'ポリシーの更新',
  },
  PRIVACY_POLICY_DELETE: {
    resource: 'privacy_policy',
    action: 'delete',
    description: 'ポリシーの削除',
  },
  PRIVACY_POLICY_CLONE: {
    resource: 'privacy_policy',
    action: 'clone',
    description: 'ポリシーのクローン',
  },
  PRIVACY_POLICY_ACTIVATE: {
    resource: 'privacy_policy',
    action: 'activate',
    description: 'ポリシーの有効化',
  },

  // ロール管理
  ROLE_LIST: { resource: 'role', action: 'list', description: 'ロール一覧の閲覧' },
  ROLE_READ: { resource: 'role', action: 'read', description: 'ロール詳細の閲覧' },
  ROLE_CREATE: { resource: 'role', action: 'create', description: 'ロールの作成' },
  ROLE_UPDATE: { resource: 'role', action: 'update', description: 'ロールの更新' },
  ROLE_DELETE: { resource: 'role', action: 'delete', description: 'ロールの削除' },
  ROLE_ASSIGN: {
    resource: 'role',
    action: 'assign',
    description: 'ユーザーへのロール付与',
  },
  ROLE_REVOKE: {
    resource: 'role',
    action: 'revoke',
    description: 'ユーザーからのロール剥奪',
  },

  // パーミッション管理
  PERMISSION_LIST: {
    resource: 'permission',
    action: 'list',
    description: 'パーミッション一覧の閲覧',
  },
  PERMISSION_READ: {
    resource: 'permission',
    action: 'read',
    description: 'パーミッション詳細の閲覧',
  },
} as const

/**
 * システムパーミッション一覧（配列形式）
 */
export const SYSTEM_PERMISSIONS = Object.values(PERMISSIONS).map((p) => ({
  ...p,
  isSystem: true,
}))

/**
 * プリセットロール定義
 */
export const PRESET_ROLES = {
  SUPER_ADMIN: {
    name: 'super_admin',
    displayName: 'スーパー管理者',
    description: 'すべての権限を持つ最高管理者',
    isSystem: true,
    permissions: [
      // ユーザー
      PERMISSIONS.USER_LIST,
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_GRANT_ADMIN,

      // 記事
      PERMISSIONS.ARTICLE_LIST,
      PERMISSIONS.ARTICLE_MARK_READ,
      PERMISSIONS.ARTICLE_MARK_UNREAD,

      // プライバシーポリシー
      PERMISSIONS.PRIVACY_POLICY_LIST,
      PERMISSIONS.PRIVACY_POLICY_READ,
      PERMISSIONS.PRIVACY_POLICY_CREATE,
      PERMISSIONS.PRIVACY_POLICY_UPDATE,
      PERMISSIONS.PRIVACY_POLICY_DELETE,
      PERMISSIONS.PRIVACY_POLICY_CLONE,
      PERMISSIONS.PRIVACY_POLICY_ACTIVATE,

      // ロール
      PERMISSIONS.ROLE_LIST,
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_CREATE,
      PERMISSIONS.ROLE_UPDATE,
      PERMISSIONS.ROLE_DELETE,
      PERMISSIONS.ROLE_ASSIGN,
      PERMISSIONS.ROLE_REVOKE,

      // パーミッション
      PERMISSIONS.PERMISSION_LIST,
      PERMISSIONS.PERMISSION_READ,
    ],
  },

  ADMIN: {
    name: 'admin',
    displayName: '管理者',
    description: 'ユーザー管理・ポリシー管理が可能',
    isSystem: true,
    permissions: [
      PERMISSIONS.USER_LIST,
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_GRANT_ADMIN,
      PERMISSIONS.ARTICLE_LIST,
      PERMISSIONS.ARTICLE_MARK_READ,
      PERMISSIONS.ARTICLE_MARK_UNREAD,
      PERMISSIONS.PRIVACY_POLICY_LIST,
      PERMISSIONS.PRIVACY_POLICY_READ,
      PERMISSIONS.PRIVACY_POLICY_CREATE,
      PERMISSIONS.PRIVACY_POLICY_UPDATE,
      PERMISSIONS.PRIVACY_POLICY_DELETE,
      PERMISSIONS.PRIVACY_POLICY_CLONE,
      PERMISSIONS.PRIVACY_POLICY_ACTIVATE,
      PERMISSIONS.ROLE_LIST,
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_ASSIGN,
      PERMISSIONS.ROLE_REVOKE,
    ],
  },

  MEMBER: {
    name: 'member',
    displayName: '一般ユーザー',
    description: '基本的な機能が利用可能',
    isSystem: true,
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.ARTICLE_LIST,
      PERMISSIONS.ARTICLE_MARK_READ,
      PERMISSIONS.ARTICLE_MARK_UNREAD,
      PERMISSIONS.PRIVACY_POLICY_LIST,
      PERMISSIONS.PRIVACY_POLICY_READ,
    ],
  },
} as const

/**
 * ロール名定数
 */
export const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES]
