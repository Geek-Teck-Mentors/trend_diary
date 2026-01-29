---
name: commit
description: Conventional Commitsのルールに従ってgitコミットを作成する
disable-model-invocation: true
argument-hint: "[メッセージ(任意)]"
allowed-tools:
  - Bash(git status*)
  - Bash(git diff*)
  - Bash(git log*)
  - Bash(git add *)
  - Bash(git commit*)
---

# Conventional Commits

プロジェクトのConventional Commitsルールに従ってgitコミットを作成する。

## コミットタイプ

以下のタイプから適切なものを選択する:

- `feat:` - 新機能追加
- `fix:` - バグ修正
- `refactor:` - リファクタリング（機能変更なし）
- `test:` - テスト追加・修正
- `docs:` - ドキュメント更新
- `style:` - コードスタイル修正（フォーマット等）
- `perf:` - パフォーマンス改善
- `chore:` - ビルドプロセス・補助ツール等の変更

## 手順

1. `git status`で変更ファイルを確認する
2. `git diff`でステージ済み・未ステージの変更内容を確認する
3. `git log --oneline -5`で直近のコミットメッセージのスタイルを確認する
4. 変更内容を分析し、適切なコミットタイプを判断する
5. 関連ファイルを`git add`でステージングする（`git add -A`や`git add .`は使わず、ファイル名を指定する）
6. コミットメッセージを作成してコミットする

## メッセージフォーマット

```
type: 説明

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## ルール

- $ARGUMENTSが指定されている場合、その内容をコミットメッセージの参考にする
- コミットメッセージは簡潔に（72文字以内を目安）
- 「何を変更したか」ではなく「なぜ変更したか」に焦点を当てる
- `.env`やクレデンシャルなど秘匿情報を含むファイルはコミットしない
- HEREDOCを使ってコミットメッセージを渡す
- コミット後に`git status`で成功を確認する
