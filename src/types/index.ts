// src/types/index.ts

export type CategoryId = 'real_estate' | 'mobile' | 'insurance' | 'loan' | 'employment'

export interface Category {
  id: CategoryId
  label: string
  emoji: string
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'real_estate', label: '不動産',       emoji: '🏠', color: '#4a9eff' },
  { id: 'mobile',      label: '携帯・通信',    emoji: '📱', color: '#3ecf8e' },
  { id: 'insurance',   label: '保険',          emoji: '🛡', color: '#f5a623' },
  { id: 'loan',        label: 'ローン・クレカ', emoji: '💳', color: '#e05c7c' },
  { id: 'employment',  label: '雇用・業務委託', emoji: '💼', color: '#a78bfa' },
]

// ── Warning ──────────────────────────────────────────
export type WarningLevel = 'high' | 'medium' | 'low'

export interface Warning {
  level: WarningLevel
  title: string
  detail: string
}

// ── Term ─────────────────────────────────────────────
export interface Term {
  word: string
  plain: string
}

// ── Key Numbers (union by category) ──────────────────
export interface RealEstateNumbers {
  rent: string
  deposit: string
  contract_period: string
  notice_period: string
  renewal_fee: string
}

export interface MobileNumbers {
  monthly_fee_now: string
  discount_end: string
  cancellation_fee: string
  data_limit: string
  device_remaining: string
}

export interface InsuranceNumbers {
  monthly_premium: string
  max_coverage: string
  waiting_period: string
  surrender_value: string
}

export interface LoanNumbers {
  apr: string
  monthly_payment: string
  total_repayment: string
  late_penalty_rate: string
}

export interface EmploymentNumbers {
  salary: string
  trial_period: string
  overtime: string
  notice_period: string
}

export type KeyNumbers =
  | RealEstateNumbers
  | MobileNumbers
  | InsuranceNumbers
  | LoanNumbers
  | EmploymentNumbers

// ── Analysis Result ───────────────────────────────────
export interface AnalysisResult {
  doc_type: string
  category: CategoryId
  key_numbers: KeyNumbers
  summary: string[]
  warnings: Warning[]
  terms: Term[]
  // category-specific extras
  tenant_checklist?: string[]       // real_estate
  cancel_guide?: {                  // mobile
    free_cancel_window: string
    steps: string[]
  }
  coverage?: {                      // insurance
    covered: string[]
    not_covered: string[]
  }
}

// ── Upload State ──────────────────────────────────────
export type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

export interface UploadState {
  status: UploadStatus
  file: File | null
  category: CategoryId | null
  result: AnalysisResult | null
  error: string | null
}
