/**
 * パーミッション定義（既存機能ベース）
 */
export const PERMISSIONS = {
  // ユーザー管理
  USER_LIST: { resource: 'user', action: 'list' },
  USER_READ: { resource: 'user', action: 'read' },
  USER_GRANT_ADMIN: { resource: 'user', action: 'grant_admin' },

  // 記事
  ARTICLE_LIST: { resource: 'article', action: 'list' },
  ARTICLE_MARK_READ: { resource: 'article', action: 'mark_read' },
  ARTICLE_MARK_UNREAD: { resource: 'article', action: 'mark_unread' },

  // プライバシーポリシー
  PRIVACY_POLICY_LIST: { resource: 'privacy_policy', action: 'list' },
  PRIVACY_POLICY_READ: { resource: 'privacy_policy', action: 'read' },
  PRIVACY_POLICY_CREATE: { resource: 'privacy_policy', action: 'create' },
  PRIVACY_POLICY_UPDATE: { resource: 'privacy_policy', action: 'update' },
  PRIVACY_POLICY_DELETE: { resource: 'privacy_policy', action: 'delete' },
  PRIVACY_POLICY_CLONE: { resource: 'privacy_policy', action: 'clone' },
  PRIVACY_POLICY_ACTIVATE: { resource: 'privacy_policy', action: 'activate' },

  // ロール管理
  ROLE_LIST: { resource: 'role', action: 'list' },
  ROLE_READ: { resource: 'role', action: 'read' },
  ROLE_CREATE: { resource: 'role', action: 'create' },
  ROLE_UPDATE: { resource: 'role', action: 'update' },
  ROLE_DELETE: { resource: 'role', action: 'delete' },
  ROLE_ASSIGN: { resource: 'role', action: 'assign' },
  ROLE_REVOKE: { resource: 'role', action: 'revoke' },

  // パーミッション管理
  PERMISSION_LIST: { resource: 'permission', action: 'list' },
  PERMISSION_READ: { resource: 'permission', action: 'read' },
} as const

/**
 * システムパーミッション一覧（配列形式）
 */
export const SYSTEM_PERMISSIONS = Object.values(PERMISSIONS)

/**
 * プリセットロール定義
 */
export const PRESET_ROLES = {
  SUPER_ADMIN: {
    displayName: 'スーパー管理者',
    description: 'すべての権限を持つ最高管理者',
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
    displayName: '管理者',
    description: 'ユーザー管理・ポリシー管理が可能',
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
    displayName: '一般ユーザー',
    description: '基本的な機能が利用可能',
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
