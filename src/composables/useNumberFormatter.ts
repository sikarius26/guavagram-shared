class NumberFormatter {
  private _currency = {
    locale: this.getLocale(),
    name: 'EUR',
    symbol: '€'
  }

  private getLocale(): string {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language ?? navigator.languages?.[0] ?? 'en-GB'
    }
    return 'en-GB'
  }

  public setCurrency(currencyName: string) {
    this._currency.name = currencyName.toUpperCase()
    if (typeof window !== 'undefined' && typeof Intl !== 'undefined') {
      this._currency.symbol = (0).toLocaleString(this._currency.locale, {
        style: 'currency',
        currency: this._currency.name,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).replace(/\d/g, '').trim()
    } else {
      // Fallback for SSR
      this._currency.symbol = '€'
    }
  }

  public get currencySymbol() {
    return this._currency.symbol
  }

  public currency(value: number, currency?: string) {
    const currencyLocal = currency?.toUpperCase() ?? this._currency.name

    if (typeof window === 'undefined' || typeof Intl === 'undefined') {
      // SSR fallback
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

