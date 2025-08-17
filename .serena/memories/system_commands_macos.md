# macOSシステムコマンド

## 基本ファイル操作
```bash
# ディレクトリ移動・表示
cd <path>                    # ディレクトリ移動
pwd                          # 現在のディレクトリ表示
ls -la                       # ファイル一覧（詳細）
ls -la | grep <pattern>      # パターン検索

# ファイル操作
mkdir -p <path>              # ディレクトリ作成（親も含む）
touch <file>                 # 空ファイル作成
cp -r <src> <dst>            # ファイル・ディレクトリコピー
mv <src> <dst>               # ファイル移動・リネーム
rm -rf <path>                # ファイル・ディレクトリ削除

# ファイル内容
cat <file>                   # ファイル内容表示
head -n 20 <file>            # 先頭20行表示
tail -n 20 <file>            # 末尾20行表示
grep -r <pattern> <path>     # 再帰的検索
```

## Git操作
```bash
git status                   # ステータス確認
git add <file>               # ステージング
git commit -m "message"      # コミット
git push                     # プッシュ
git pull                     # プル
git log --oneline -10        # コミット履歴
git diff                     # 差分表示
git branch                   # ブランチ一覧
```

## プロセス・システム
```bash
ps aux | grep <process>      # プロセス検索
kill -9 <pid>                # プロセス強制終了
top                          # システムモニター
df -h                        # ディスク使用量
du -sh <path>                # ディレクトリサイズ
```

## ネットワーク
```bash
curl -I <url>                # HTTPヘッダー取得
ping <host>                  # 疎通確認
netstat -an | grep <port>    # ポート確認
```

## macOS固有
```bash
open <file>                  # デフォルトアプリで開く
open .                       # Finderで開く
pbcopy < <file>              # クリップボードにコピー
pbpaste                      # クリップボードから貼り付け
```

## 権限・所有者
```bash
chmod 755 <file>             # 実行権限付与
chown <user>:<group> <file>  # 所有者変更
sudo <command>               # 管理者権限で実行
```