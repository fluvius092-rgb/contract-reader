# 契約書かんたん読み — VSCode 作業引継ぎドキュメント

> このファイルをVSCodeで開いて作業を続けてください。  
> Claude（AI）に渡す際はこのファイルの内容をそのままコピペするだけでコンテキストが復元されます。

---

## プロジェクト概要

**サービス名**: 契約書かんたん読み  
**コンセプト**: 個人消費者向けに契約書（不動産・携帯・保険・ローン・雇用）をAIが読み解き、わかりやすく整理する無料Webアプリ  
**収益モデル**: 無料 + 広告（Google AdSense）+ アフィリエイト（引越し・乗り換え・保険比較）  
**ターゲット**: ITリテラシーを問わない一般消費者  

---

## 技術スタック

| 役割 | 採用技術 | 備考 |
|------|----------|------|
| フロントエンド | Next.js 14 (App Router) + Tailwind CSS | |
| AI解析 | Claude Sonnet 4.6 (Anthropic API) | `@anthropic-ai/sdk` |
| 認証 | Firebase Auth | Google + メール/PW |
| DB | Firestore | 解析履歴の保存 |
| ファイル保存 | Firebase Storage | 解析後即削除 |
| OCR | Tesseract.js | 画像→日本語テキスト変換 |
| PDF解析 | pdf-parse | PDFテキスト抽出 |
| ホスティング | Vercel（予定） | 無料枠で運用可 |

**月間コスト目安**: 約4,000〜5,000円（MAU 3,000人・月3,000件処理時）

---

## ファイル構成（完全版）

```
contract-reader/
├── .env.local.example          ← 環境変数テンプレート（★まずこれをコピー）
├── .env.local                  ← 実際の環境変数（Gitにコミット禁止）
├── .gitignore
├── README.md
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── firebase.json               ← Firebase CLI設定
├── firestore.rules             ← Firestoreセキュリティルール
├── firestore.indexes.json
├── storage.rules               ← Storageセキュリティルール
└── src/
    ├── types/
    │   └── index.ts            ← 全型定義（CategoryId, AnalysisResult等）
    ├── lib/
    │   ├── prompts.ts          ← ★カテゴリ別AIプロンプト定義（コア）
    │   ├── extract.ts          ← PDF/画像テキスト抽出
    │   ├── firebase.ts         ← Firebaseクライアント設定
    │   ├── firebase-admin.ts   ← Firebase Admin（サーバー専用）
    │   ├── rateLimit.ts        ← IPベースレートリミット
    │   └── hooks/
    │       └── useAnalyze.ts   ← アップロード→解析フロー管理フック
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx            ← メインページ
    │   ├── auth/
    │   │   └── page.tsx        ← ログイン/新規登録ページ
    │   ├── history/
    │   │   └── page.tsx        ← 解析履歴ページ
    │   └── api/
    │       ├── upload/
    │       │   └── route.ts    ← ファイルアップロードAPI
    │       └── analyze/
    │           └── route.ts    ← AI解析API（メイン処理）
    └── components/
        └── features/
            ├── UploadZone.tsx      ← ファイルアップロードUI
            ├── AnalysisResult.tsx  ← 解析結果表示UI
            └── AnalyzingState.tsx  ← ローディング表示
```

---

## セットアップ手順（Windows / VSCode）

### Step 1: ZIPを解凍してVSCodeで開く

```powershell
# ダウンロードフォルダに解凍
Expand-Archive -Path "$env:USERPROFILE\Downloads\contract-reader.zip" -DestinationPath "$env:USERPROFILE\Downloads\"

# 解凍フォルダに移動
cd "$env:USERPROFILE\Downloads\contract-reader"

# VSCodeで開く
code .
```

### Step 2: 環境変数ファイルの準備

```powershell
cp .env.local.example .env.local
```

`.env.local` をVSCodeで開いて以下を埋める：

```env
# Anthropic API Key
# → https://console.anthropic.com/ で取得
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx

# Firebase（クライアント側）
# → Firebase Console > プロジェクト設定 > マイアプリ > SDK設定 から取得
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin（サーバー側）
# → Firebase Console > プロジェクト設定 > サービスアカウント > 秘密鍵を生成
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# ↓ JSONファイルの private_key の値。改行を \n に変換して1行で入れること
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### Step 3: Firebaseプロジェクトの作成

1. [https://console.firebase.google.com/](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを作成」→ 任意の名前で作成
3. **Authentication** → 「始める」→ Google と メール/パスワード を有効化
4. **Firestore Database** → 「データベースの作成」→ 本番モード → リージョン選択（asia-northeast1 推奨）
5. **Storage** → 「始める」→ 本番モード
6. **プロジェクト設定**（歯車アイコン）→ **サービスアカウント** → 「新しい秘密鍵の生成」→ JSONダウンロード
7. **プロジェクト設定** → **マイアプリ** → `</>` アイコン → Webアプリを登録 → SDK設定の値をコピー

### Step 4: 依存パッケージのインストール

```powershell
npm install
```

### Step 5: 開発サーバー起動

```powershell
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

---

## 各ファイルの役割詳細

### `src/lib/prompts.ts`（最重要）

カテゴリ別のAIプロンプトが定義されています。  
**ここを変更すると解析の精度・出力内容が変わります。**

```
対応カテゴリ:
- real_estate（不動産）: 家賃/敷金/解約予告/違約金/原状回復 を重点抽出
- mobile（携帯・通信）: 割引終了後の料金/端末残債/違約金 を重点抽出
- insurance（保険）: 免責事項の全件抽出 を最優先
- loan（ローン・クレカ）: 総返済額/リボ払い自動設定 を重点抽出
- employment（雇用・業務委託）: 競業避止義務/みなし残業 を重点抽出
```

### `src/app/api/analyze/route.ts`（サーバー側メイン）

処理フロー：
```
① レートリミット確認（1分5件/IP）
② リクエストバリデーション（Zod）
③ Firebase Storage からファイル取得
④ テキスト抽出（PDF or OCR）
⑤ Claude Sonnet 4.6 に送信
⑥ JSONレスポンスをパース
⑦ Firestore に履歴保存（ログイン時のみ）
⑧ Storageのファイルを即削除（プライバシー保護）
```

### `src/app/api/upload/route.ts`

- 対応形式: PDF / JPEG / PNG / WebP / HEIC
- 最大サイズ: 20MB
- 保存先: Firebase Storage の `tmp/{userId}/{uuid}.pdf` 配下
- クライアントからの直接アクセスは Storage Rules で禁止済み

### `src/lib/extract.ts`

- PDFは `pdf-parse` でテキスト直接抽出
- 画像は Tesseract.js で日本語OCR（`jpn+eng`）
- 抽出テキストが50文字未満の場合はエラーを返す

### `src/lib/rateLimit.ts`

- IPベースのシンプルなレートリミット
- 1分間に5リクエストまで
- 本番運用では Upstash Redis への移行を推奨

---

## 未実装・今後の作業リスト

### 優先度 High（リリース前に必要）

- [ ] **Firebase セキュリティルールの適用**
  ```powershell
  # Firebase CLI のインストール
  npm install -g firebase-tools
  firebase login
  firebase use your-project-id
  firebase deploy --only firestore:rules,storage
  ```

- [ ] **Google AdSense の組み込み**
  - `src/app/layout.tsx` に AdSense スクリプトを追加
  - `src/components/ui/AdBanner.tsx` を作成
  - 解析結果ページ下部の広告枠プレースホルダーを実際の広告に差し替え

- [ ] **Vercel へのデプロイ**
  ```powershell
  npm install -g vercel
  vercel
  # Vercel ダッシュボードで .env.local の内容を Environment Variables に登録
  vercel --prod
  ```

- [ ] **エラーハンドリングの強化**
  - Firebase 接続エラー時のフォールバック
  - Claude API タイムアウト時のリトライ

### 優先度 Medium（リリース後に追加）

- [ ] **アフィリエイト導線の追加**
  - 不動産結果 → 引越し業者比較サイトへの誘導
  - 携帯結果 → 乗り換え比較サイトへの誘導
  - 保険結果 → 保険比較サイトへの誘導
  - `src/components/features/AffiliateLink.tsx` を新規作成

- [ ] **PWA対応（スマホでアプリっぽく使えるように）**
  - `public/manifest.json` を作成
  - `next.config.js` に PWA 設定を追加

- [ ] **複数書面の横断比較機能**
  - 例：賃貸更新前後の契約書を並べて差分表示
  - `src/app/compare/page.tsx` を新規作成

- [ ] **OCR精度の改善**
  - 低解像度画像の前処理（Sharp で解像度アップ）
  - `src/lib/extract.ts` の `extractFromImage` を改善

### 優先度 Low（グロース段階）

- [ ] Upstash Redis によるレートリミット強化
- [ ] 解析履歴のCSVエクスポート
- [ ] 書面カテゴリの自動判定（現在は手動選択）
- [ ] 英語契約書対応

---

## 環境変数一覧

| 変数名 | 説明 | 取得場所 |
|--------|------|----------|
| `ANTHROPIC_API_KEY` | Claude APIキー | console.anthropic.com |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase WebアプリAPIキー | Firebase Console > プロジェクト設定 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 同上 | 同上 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 同上 | 同上 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | 同上 | 同上 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 同上 | 同上 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 同上 | 同上 |
| `FIREBASE_PROJECT_ID` | Admin SDK用プロジェクトID | Firebase Console > サービスアカウント |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK用メール | 同上（生成したJSONの中） |
| `FIREBASE_PRIVATE_KEY` | Admin SDK用秘密鍵 | 同上（改行を`\n`に変換） |

---

## よくあるエラーと対処法

### `Error: Failed to parse private key`
**原因**: `FIREBASE_PRIVATE_KEY` の改行が正しく変換されていない  
**対処**: `.env.local` で以下のように記述する
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...(省略)...\n-----END PRIVATE KEY-----\n"
```
前後を `"` で囲み、改行を全て `\n` に変換すること。

### `Error: Cannot find module 'pdf-parse'`
**対処**: `npm install` を再実行

### `FirebaseError: Missing or insufficient permissions`
**原因**: Firestore/Storage のセキュリティルールが未適用  
**対処**: Firebase Console でルールを手動で設定するか `firebase deploy --only firestore:rules,storage` を実行

### `429 Too Many Requests`
**原因**: レートリミット（1分5件）に引っかかっている  
**対処**: 1分待ってから再試行。開発中は `src/lib/rateLimit.ts` の `MAX_REQS` を増やす

### OCRの精度が低い
**原因**: 画像の解像度が低いか、斜め撮影  
**対処**: 
- PDFがある場合はPDFを使う（OCRより精度が高い）
- 撮影時は真上から、明るい場所で撮影するようにUIで案内する

---

## Claudeへの引継ぎプロンプト（コピペ用）

VSCodeでClaude（AI）に作業を依頼する際は以下をそのまま使ってください：

```
以下のプロジェクトの開発を続けてください。

【プロジェクト】契約書かんたん読み
【技術スタック】Next.js 14 + Firebase + Claude Sonnet 4.6 + Tailwind CSS
【現在の状態】MVPコード一式が完成済み。セットアップと追加機能の実装が必要。

【ファイル構成】
- src/types/index.ts: 型定義
- src/lib/prompts.ts: カテゴリ別AIプロンプト（不動産/携帯/保険/ローン/雇用）
- src/lib/extract.ts: PDF・OCRテキスト抽出
- src/lib/hooks/useAnalyze.ts: アップロード→解析フック
- src/app/api/upload/route.ts: ファイルアップロードAPI
- src/app/api/analyze/route.ts: Claude API解析エンドポイント
- src/components/features/UploadZone.tsx: アップロードUI
- src/components/features/AnalysisResult.tsx: 結果表示UI

【今やりたいこと】
（ここに具体的なタスクを書く）
例: Google AdSenseを組み込みたい
例: アフィリエイトリンクをカテゴリ別に追加したい
例: デプロイ手順を教えてほしい
```

---

*最終更新: 2026年3月*
