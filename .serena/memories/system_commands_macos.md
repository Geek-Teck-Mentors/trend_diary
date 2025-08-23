# System Commands for macOS

## ファイル・ディレクトリ操作

### 基本操作
```bash
ls              # ファイル一覧表示
ls -la          # 詳細情報付きファイル一覧
ls -lah         # 人間に読みやすい形式で詳細表示
cd directory    # ディレクトリ移動
pwd             # 現在のディレクトリパス表示
mkdir dirname   # ディレクトリ作成
mkdir -p path/to/dir  # 親ディレクトリも含めて作成
rm filename     # ファイル削除
rm -rf dirname  # ディレクトリ削除（再帰的）
cp source dest  # ファイルコピー
mv source dest  # ファイル移動・リネーム
```

### ファイル検索・内容確認
```bash
find . -name "*.ts"           # TypeScriptファイル検索
find . -name "*.test.ts"      # テストファイル検索
find . -type d -name "node_modules"  # node_modulesディレクトリ検索
find . -type f -name "package.json"  # package.jsonファイル検索

# ファイル内容表示
cat filename          # ファイル全体表示
head -n 20 filename   # 先頭20行表示
tail -n 20 filename   # 末尾20行表示
tail -f logfile       # リアルタイム表示（ログ監視）
less filename         # ページャーで表示（q で終了）
```

### テキスト検索（grep）
```bash
grep "pattern" filename                    # ファイル内パターン検索
grep -r "pattern" src/                     # 再帰的検索
grep -i "pattern" filename                 # 大文字小文字無視
grep -n "pattern" filename                 # 行番号付き
grep -v "pattern" filename                 # パターンを含まない行
grep -E "pattern1|pattern2" filename       # 複数パターン（OR）
grep -l "pattern" *.ts                     # パターンを含むファイル名のみ表示

# よく使うパターン
grep -r "TODO" src/                        # TODOコメント検索
grep -r "console.log" src/                 # デバッグコード検索
grep -r "import.*React" src/               # React import検索
```

## プロセス・ネットワーク管理

### プロセス管理
```bash
ps aux                    # 全プロセス表示
ps aux | grep node        # Nodeプロセス検索
ps aux | grep npm         # npm プロセス検索
top                       # リアルタイムプロセス監視
htop                      # 高機能プロセス監視（要インストール）

# プロセス終了
kill PID                  # プロセス終了
kill -9 PID              # 強制終了
killall node             # 名前でプロセス一括終了
pkill -f "npm start"     # コマンドライン引数でプロセス終了
```

### ネットワーク・ポート管理
```bash
lsof -i :5173            # ポート5173使用プロセス確認
lsof -i :3000            # ポート3000使用プロセス確認
lsof -i tcp              # TCPポート使用状況
netstat -an | grep 5173  # ポート確認（古い方法）

# よく使うポート
# 5173: Vite開発サーバー
# 6006: Storybook
# 3000: よく使われる開発サーバー
# 8080: 代替開発サーバー
```

## Git 操作

### 基本操作
```bash
git status               # 作業状態確認
git add .                # 全変更ファイルをステージング
git add filename         # 特定ファイルをステージング
git commit -m "message"  # コミット
git push                 # リモートにプッシュ
git pull                 # リモートから取得
git log --oneline        # コミット履歴（要約）
git log -p               # 詳細なコミット履歴
git diff                 # 変更差分表示
git diff --staged        # ステージングされた差分表示
```

### ブランチ操作
```bash
git branch               # ブランチ一覧
git branch -a            # リモートブランチも含める
git checkout branch-name # ブランチ切り替え
git checkout -b new-branch  # 新ブランチ作成・切り替え
git merge branch-name    # マージ
git rebase main          # リベース
```

## Docker操作

### Docker Compose
```bash
docker compose up -d     # バックグラウンドで起動
docker compose down      # 停止・コンテナ削除
docker compose stop      # 停止のみ
docker compose start     # 開始
docker compose restart   # 再起動
docker compose logs      # ログ表示
docker compose logs -f   # リアルタイムログ
docker compose ps        # 状態確認
```

### Docker基本コマンド
```bash
docker ps                # 実行中コンテナ一覧
docker ps -a             # 全コンテナ一覧
docker images            # イメージ一覧
docker logs container_id # コンテナログ表示
docker exec -it container_id /bin/bash  # コンテナ内でシェル実行
```

## システム情報・監視

### システム情報
```bash
uname -a                 # システム情報
sw_vers                  # macOS バージョン情報
system_profiler SPSoftwareDataType  # 詳細システム情報
df -h                    # ディスク使用量
du -sh dirname           # ディレクトリサイズ
free -h                  # メモリ使用量（Linuxコマンド、macOSでは使用不可）
vm_stat                  # macOS メモリ統計
```

### パッケージ管理（macOS固有）
```bash
# Homebrew
brew install package     # パッケージインストール
brew update             # Homebrew更新
brew upgrade            # 全パッケージ更新
brew list               # インストール済みパッケージ一覧
brew services list      # サービス一覧
```

## 便利なショートカット・設定

### macOS Terminal ショートカット
- `Cmd + T`: 新しいタブ
- `Cmd + W`: タブを閉じる
- `Cmd + K`: 画面クリア
- `Ctrl + C`: コマンド中断
- `Ctrl + Z`: プロセス一時停止
- `Ctrl + A`: 行頭に移動
- `Ctrl + E`: 行末に移動
- `Ctrl + U`: 行頭まで削除

### よく使用する環境変数確認
```bash
echo $PATH              # PATH環境変数表示
echo $NODE_ENV          # Node環境変数
echo $PWD               # 現在のディレクトリ
env                     # 全環境変数表示
```