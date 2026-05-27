// Currency/number formatting shared across the public app and admin.
//
// IMPORTANT — SSR safety: this runs on both the Nitro server (SSR) and the
// browser (hydration). The two MUST produce byte-identical strings or Vue
// throws "Hydration text content mismatch" and, critically, stops attaching
// event listeners to the mismatched subtree — every button/link inside it
// goes dead (the GuavaGramRenderer's CTAs, the bio nav, etc.).
//
// The previous version diverged in two ways:
//   1. SSR returned `value.toFixed(2)` → "18.00 €" (period), while the client
//      used Intl → "18,00 €" (comma).
//   2. The locale came from `navigator.language` on the client but a hardcoded
//      'en-GB' on the server.
// Both made server ≠ client. The fix: always format via Intl (Node 20 ships
// full ICU, so it works during SSR too) using a FIXED, deterministic locale —
// never `navigator`. A module-level singleton must not read per-request locale
// state anyway (concurrent SSR requests would race on it), so a fixed locale
// is both correct and safe. Spain-first product → es-ES ("18,00 €").
const FORMAT_LOCALE = 'es-ES'

class NumberFormatter {
  private _currency = {
    locale: FORMAT_LOCALE,
    name: 'EUR',
    symbol: '€'
  }

  public setCurrency(currencyName: string) {
    this._currency.name = currencyName.toUpperCase()
    if (typeof Intl !== 'undefined') {
      try {
        this._currency.symbol = (0).toLocaleString(this._currency.locale, {
          style: 'currency',
          currency: this._currency.name,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).replace(/\d/g, '').trim()
      } catch {
        this._currency.symbol = '€'
      }
    } else {
      this._currency.symbol = '€'
    }
  }

  public get currencySymbol() {
    return this._currency.symbol
  }

  public currency(value: number, currency?: string) {
    const currencyLocal = currency?.toUpperCase() ?? this._currency.name

    // Deterministic fallback when Intl is unavailable (matches the Intl output
    // for EUR closely enough; Intl is present in every environment we target).
    if (typeof Intl === 'undefined') {
      return `${value.toFixed(2)} ${currencyLocal === 'EUR' ? '€' : currencyLocal}`
    }

    const options: Intl.NumberFormatOptions = { style: 'currency', currency: currencyLocal, currencyDisplay: 'narrowSymbol' }
    try {
      return new Intl.NumberFormat(this._currency.locale, options).format(value).replace('CHF', 'Fr.')
    } catch (err) {
      options.currencyDisplay = 'symbol'
      return new Intl.NumberFormat(this._currency.locale, options).format(value)
    }
  }
}

export const numberFormatter = new NumberFormatter()
