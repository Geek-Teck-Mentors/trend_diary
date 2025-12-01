```mermaid
erDiagram

  "active_users" {
    BigInt active_user_id "🗝️"
    String email 
    String password 
    String display_name "❓"
    String authentication_id "❓"
    DateTime last_login "❓"
    DateTime created_at 
    DateTime updated_at 
    BigInt user_id 
    }
  

  "articles" {
    BigInt article_id "🗝️"
    String media 
    String title 
    String author 
    String description 
    String url 
    DateTime created_at 
    }
  

  "banned_users" {
    BigInt user_id 
    DateTime banned_at 
    String reason "❓"
    DateTime created_at 
    }
  

  "leaved_users" {
    BigInt user_id 
    String reason "❓"
    DateTime created_at 
    }
  

  "roles" {
    Int role_id "🗝️"
    Boolean preset 
    String display_name 
    String description "❓"
    DateTime created_at 
    }
  

  "permissions" {
    Int permission_id "🗝️"
    String resource 
    String action 
    }
  

  "role_permissions" {
    Int role_id 
    Int permission_id 
    }
  

  "user_roles" {
    BigInt active_user_id 
    Int role_id 
    DateTime granted_at 
    BigInt granted_by_active_user_id "❓"
    }
  

  "endpoints" {
    Int endpoint_id "🗝️"
    String path 
    String method 
    DateTime created_at 
    }
  

  "endpoint_permissions" {
    Int endpoint_id 
    Int permission_id 
    }
  

  "privacy_policies" {
    Int version "🗝️"
    String content 
    DateTime effective_at "❓"
    DateTime created_at 
    DateTime updated_at 
    }
  

  "privacy_policy_consents" {
    BigInt user_id 
    Int policy_version 
    DateTime consented_at 
    DateTime created_at 
    }
  

  "read_histories" {
    BigInt read_history_id "🗝️"
    DateTime read_at 
    DateTime created_at 
    BigInt article_id 
    BigInt active_user_id 
    }
  

  "sessions" {
    String session_id "🗝️"
    String session_token "❓"
    DateTime expires_at 
    String ip_address "❓"
    String user_agent "❓"
    DateTime created_at 
    BigInt active_user_id 
    }
  

  "users" {
    BigInt user_id "🗝️"
    DateTime created_at 
    }
  
    "active_users" o|--|| "users" : "user"
    "active_users" o{--}o "sessions" : "session"
    "active_users" o{--}o "read_histories" : "readHistories"
    "active_users" o{--}o "user_roles" : "userRoles"
    "banned_users" o|--|| "users" : "user"
    "leaved_users" o|--|| "users" : "user"
    "roles" o{--}o "user_roles" : "userRoles"
    "roles" o{--}o "role_permissions" : "rolePermissions"
    "permissions" o{--}o "role_permissions" : "rolePermissions"
    "permissions" o{--}o "endpoint_permissions" : "endpointPermissions"
    "role_permissions" o|--|| "roles" : "role"
    "role_permissions" o|--|| "permissions" : "permission"
    "user_roles" o|--|| "active_users" : "activeUser"
    "user_roles" o|--|| "roles" : "role"
    "endpoints" o{--}o "endpoint_permissions" : "endpointPermissions"
    "endpoint_permissions" o|--|| "endpoints" : "endpoint"
    "endpoint_permissions" o|--|| "permissions" : "permission"
    "privacy_policy_consents" o|--|| "users" : "user"
    "read_histories" o|--|| "active_users" : "activeUser"
    "sessions" o|--|| "active_users" : "activeUser"
    "users" o{--}o "active_users" : "activeUser"
    "users" o{--}o "leaved_users" : "leavedUser"
    "users" o{--}o "banned_users" : "bannedUser"
    "users" o{--}o "privacy_policy_consents" : "privacyPolicyConsent"
```
