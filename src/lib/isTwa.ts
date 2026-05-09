// Trusted Web Activity (Android TWA) で表示されているかを判定する
// TWA は document.referrer が `android-app://...` で始まる
// SPA 内遷移で referrer が変わるため、初回判定を sessionStorage に保存して再利用する

const KEY = 'cr_is_twa'

let cached: boolean | null = null

export function isTwa(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return false

  if (sessionStorage.getItem(KEY) === '1') {
    cached = true
    return true
  }
  if (document.referrer.startsWith('android-app://')) {
    sessionStorage.setItem(KEY, '1')
    cached = true
    return true
  }
  cached = false
  return false
}

// Web版を外部ブラウザで開く（intent URL でデフォルトブラウザにフォールバック）
export function openWebVersion() {
  if (typeof window === 'undefined') return
  window.open('https://settlabs.app/contract_reader/', '_blank', 'noopener,noreferrer')
}
