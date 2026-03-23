# 契約書かんたん読み — セットアップガイド

## 技術スタック
- **フロントエンド**: Next.js 14 (App Router) + Tailwind CSS
- **AI**: Claude Sonnet 4.6 (Anthropic API)
- **BaaS**: Firebase (Auth / Firestore / Storage)
- **ホスティング**: Vercel（無料枠で運用可能）
- **OCR**: Tesseract.js（画像→テキスト変換）

## ファイル構成

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts   ← AI解析エンドポイント（メイン）
│   │   └── upload/route.ts    ← ファイルアップロードエンドポイント
│   ├── page.tsx               ← メインページ
│   └── layout.tsx
├── components/
│   └── features/
│       ├── UploadZone.tsx     ← ファイルアップロードUI
│       ├── AnalysisResult.tsx ← 解析結果表示UI
│       └── AnalyzingState.tsx ← ローディング表示
├── lib/
│   ├── prompts.ts             ← カテゴリ別プロンプト定義（重要）
│   ├── extract.ts             ← PDF/画像テキスト抽出
│   ├── firebase.ts            ← Firebaseクライアント設定
│   ├── firebase-admin.ts      ← Firebase Admin設定（サーバー専用）
│   └── hooks/
│       └── useAnalyze.ts      ← アップロード→解析フック
└── types/
    └── index.ts               ← 型定義
```

## セットアップ手順

### 1. リポジトリのクローンと依存インストール

```bash
git clone https://github.com/yourname/contract-reader.git
cd contract-reader
npm install
```

### 2. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. Authentication → Google / メール認証を有効化
3. Firestore Database → 本番モードで作成
4. Storage → 作成（ルール設定は下記参照）
5. プロジェクト設定 → サービスアカウント → 秘密鍵を生成（JSON）

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
# .env.local をエディタで開いて各値を入力
```

### 4. Firebase Storage セキュリティルールの設定

```
// Firebase Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // tmp/ 配下はサーバー（Admin SDK）のみアクセス可
    match /tmp/{userId}/{allPaths=**} {
      allow read, write: if false; // クライアントからの直接アクセス禁止
    }
  }
}
```

### 5. Firestore セキュリティルールの設定

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 自分の解析履歴のみ読み書き可
    match /users/{userId}/analyses/{analysisId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. 開発サーバーの起動

```bash
npm run dev
# http://localhost:3000 でアクセス
```

### 7. Vercel へのデプロイ

```bash
# Vercel CLI インストール
npm i -g vercel

# デプロイ（初回はプロジェクト設定を聞かれる）
vercel

# 本番デプロイ
vercel --prod
```

Vercel の Environment Variables に `.env.local` の内容を登録すること。

---

## API エンドポイント

### POST /api/upload
ファイルを Firebase Storage にアップロード。

**Request**: `multipart/form-data`
- `file`: PDF or 画像ファイル
- `userId`（任意）: ユーザーID

**Response**:
```json
{
  "storageRef": "tmp/anonymous/uuid.pdf",
  "mimeType": "application/pdf",
  "fileName": "contract.pdf",
  "fileSize": 102400
}
```

### POST /api/analyze
Claude API でテキストを解析。

**Request**: `application/json`
```json
{
  "category": "real_estate",
  "storageRef": "tmp/anonymous/uuid.pdf",
  "mimeType": "application/pdf",
  "userQuestion": "解約金はいくらですか？"
}
```

**Response**:
```json
{
  "result": {
    "doc_type": "賃貸借契約書",
    "category": "real_estate",
    "key_numbers": { ... },
    "summary": [ ... ],
    "warnings": [ ... ],
    "terms": [ ... ],
    "tenant_checklist": [ ... ]
  }
}
```

---

## プロンプトのカスタマイズ

`src/lib/prompts.ts` の `CATEGORY_PROMPTS` を編集するだけで
カテゴリ別の解析ロジックを変更できます。

各カテゴリで「必ず抽出する項目」と「JSON出力スキーマ」が定義されています。
新カテゴリを追加する場合は `src/types/index.ts` の `CategoryId` 型も更新してください。

---

## 月間コスト目安（MAU 3,000人・3,000件/月）

| 項目 | 月額 |
|------|------|
| Firebase（無料枠内） | 0円 |
| Vercel（Hobby プラン） | 0円 |
| Claude API（Sonnet） | 約 4,000円 |
| OCR（超過分） | 約 300円 |
| **合計** | **約 4,000〜5,000円** |
