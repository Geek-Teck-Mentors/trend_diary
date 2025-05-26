```mermaid
erDiagram

  "ping" {
    BigInt id "🗝️"
    DateTime created_at 
    }
  

  "accounts" {
    BigInt account_id "🗝️"
    String email 
    String password 
    DateTime last_login "❓"
    DateTime created_at 
    DateTime updated_at 
    DateTime deleted_at "❓"
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
  

  "sessions" {
    String session_id "🗝️"
    BigInt account_id 
    String session_token "❓"
    DateTime expires_at 
    String ip_address "❓"
    String user_agent "❓"
    DateTime created_at 
    }
  

  "users" {
    BigInt user_id "🗝️"
    BigInt account_id 
    String display_name "❓"
    DateTime created_at 
    DateTime updated_at 
    DateTime deleted_at "❓"
    }
  
```
