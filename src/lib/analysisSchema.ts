// src/lib/analysisSchema.ts
// Claude API 出力の再バリデーション用 Zod スキーマ

import { z } from 'zod'

const WarningSchema = z.object({
  level: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  detail: z.string(),
})

const TermSchema = z.object({
  word: z.string(),
  plain: z.string(),
})

// key_numbers はカテゴリ別に異なるため、string 値を持つ object として緩く受ける
const KeyNumbersSchema = z.record(z.string(), z.string())

export const AnalysisResultSchema = z.object({
  doc_type: z.string(),
  category: z.enum(['real_estate', 'mobile', 'insurance', 'loan', 'employment', 'other']),
  key_numbers: KeyNumbersSchema,
  summary: z.array(z.string()),
  warnings: z.array(WarningSchema),
  terms: z.array(TermSchema),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
  tenant_checklist: z.array(z.string()).optional(),
  moving_checklist: z.array(z.string()).optional(),
  cancel_guide: z.object({
    free_cancel_window: z.string(),
    steps: z.array(z.string()),
  }).optional(),
  coverage: z.object({
    covered: z.array(z.string()),
    not_covered: z.array(z.string()),
  }).optional(),
})
