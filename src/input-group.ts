import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { t, getLang, onLangChange, type Lang } from './lib/i18n'
import {
  computeShares,
  remainingOf,
  type ShareInput,
  type SplitMode,
} from './lib/split'

@customElement('input-group')
export class InputGroup extends LitElement {
  @property({ type: Number })
  amount = 0

  @property({ type: Number })
  noOfPeople = 1

  @state()
  private _lang: Lang = getLang()

  @state()
  private _mode: SplitMode = 'equal'

  @state()
  private _rows: ShareInput[] = [{ value: 0, unit: '%' }]

  constructor() {
    super()
    onLangChange((l) => {
      this._lang = l
    })
  }

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement
    const id = input.id

    if (id === 'amount-input') {
      this.amount = input.value.length === 0 ? 0 : parseFloat(input.value)
    } else if (id === 'no-of-people-input') {
      this.noOfPeople =
        input.value.length === 0 ? 1 : Math.max(1, parseInt(input.value))
      this._syncRows(this.noOfPeople)
    }

    this._dispatch()
  }

  private _syncRows(n: number) {
    this._rows =
      this._rows.length >= n
        ? this._rows.slice(0, n)
        : [
            ...this._rows,
            ...Array.from({ length: n - this._rows.length }, () => ({
              value: 0,
              unit: '%' as const,
            })),
          ]
  }

  private _setMode(mode: SplitMode) {
    if (this._mode === mode) {
      return
    }
    this._mode = mode
    this._syncRows(this.noOfPeople)
    this._dispatch()
  }

  private handleRowValue(index: number, e: Event) {
    const input = e.target as HTMLInputElement
    const value = input.value.length === 0 ? 0 : parseFloat(input.value)
    this._rows = this._rows.map((r, i) => (i === index ? { ...r, value } : r))
    this._dispatch()
  }

  private toggleRowUnit(index: number) {
    this._rows = this._rows.map((r, i) =>
      i === index ? { ...r, unit: r.unit === '%' ? 'thb' : '%' } : r
    )
    this._dispatch()
  }

  private _dispatch() {
    if (this.amount < 0 || this.noOfPeople < 1) {
      return
    }

    const detail =
      this._mode === 'custom'
        ? (() => {
            const shares = computeShares(this.amount, this._rows)
            const { balanced } = remainingOf(this.amount, shares)
            return {
              amount: shares[0]?.amount ?? 0,
              totalAmount: this.amount,
              noOfPeople: this.noOfPeople,
              mode: this._mode,
              shares,
              balanced,
            }
          })()
        : {
            amount: this.amount / this.noOfPeople,
            totalAmount: this.amount,
            noOfPeople: this.noOfPeople,
            mode: this._mode,
          }

    this.dispatchEvent(
      new CustomEvent('amount-change', {
        detail,
        bubbles: true,
        composed: true,
      })
    )
  }

  private renderCustomRows() {
    const shares = computeShares(this.amount, this._rows)
    const { remaining, remainingPct, balanced } = remainingOf(
      this.amount,
      shares
    )

    const indicator = balanced
      ? html`<div class="indicator balanced">${t('balancedOk', this._lang)}</div>`
      : remaining >= 0
        ? html`<div class="indicator">
            ${t('remaining', this._lang)} ${remaining.toFixed(2)}฿
            (${remainingPct.toFixed(2)}%)
          </div>`
        : html`<div class="indicator over">
            ${t('overBy', this._lang)} ${Math.abs(remaining).toFixed(2)}฿
            (${Math.abs(remainingPct).toFixed(2)}%)
          </div>`

    return html`
      <div class="custom-rows">
        ${this._rows.map(
          (row, i) => html`
            <div class="share-row">
              <span class="share-label">${t('personShort', this._lang)}${i + 1}</span>
              <input
                type="number"
                inputmode="decimal"
                step="0.01"
                min="0"
                placeholder="0"
                aria-label="${t('shareAmountAria', this._lang)} ${i + 1}"
                .value=${row.value <= 0 ? '' : row.value}
                @input=${(e: Event) => this.handleRowValue(i, e)}
              />
              <button
                type="button"
                class="unit-toggle"
                aria-label=${t('unitToggleAria', this._lang)}
                @click=${() => this.toggleRowUnit(i)}
              >
                ${row.unit === '%' ? '%' : '฿'}
              </button>
            </div>
          `
        )}
        ${indicator}
      </div>
    `
  }

  render() {
    return html`
      <div class="input-container">
        <div class="input-field">
          <label for="amount-input">${t('amountLabel', this._lang)}</label>
          <input
            id="amount-input"
            type="number"
            inputmode="decimal"
            step="0.01"
            min="1"
            placeholder="0.00"
            .value=${this.amount <= 0 ? '' : this.amount}
            @input=${this.handleInput}
          />
        </div>
        <div class="input-field">
          <label for="no-of-people-input">${t('peopleLabel', this._lang)}</label>
          <input
            id="no-of-people-input"
            type="number"
            min="1"
            step="1"
            placeholder="1"
            .value=${this.noOfPeople <= 1 ? '' : this.noOfPeople}
            @input=${this.handleInput}
          />
        </div>
      </div>
      <div class="mode-field">
        <label>${t('splitModeLabel', this._lang)}</label>
        <div class="mode-toggle">
          <button
            type="button"
            class=${this._mode === 'equal' ? 'selected' : ''}
            @click=${() => this._setMode('equal')}
          >
            ${t('splitEqual', this._lang)}
          </button>
          <button
            type="button"
            class=${this._mode === 'custom' ? 'selected' : ''}
            @click=${() => this._setMode('custom')}
          >
            ${t('splitCustom', this._lang)}
          </button>
        </div>
      </div>
      ${this._mode === 'custom' ? this.renderCustomRows() : ''}
    `
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
    }

    button,
    input,
    select,
    textarea {
      font-family: inherit;
    }

    .input-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .input-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    label {
      font-size: 0.75rem;
      font-weight: 400;
      color: #a3a3a3;
    }

    input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #404040;
      border-radius: 0.25rem;
      /* 16px minimum prevents iOS Safari auto-zoom on focus */
      font-size: 1rem;
      background: #262626;
      color: #f5f5f5;
      transition: border-color 0.15s ease;
    }

    input:focus {
      outline: none;
      border-color: #737373;
    }

    input::placeholder {
      color: #525252;
    }

    .mode-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.75rem;
    }

    .mode-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid #404040;
      border-radius: 0.25rem;
      overflow: hidden;
    }

    .mode-toggle button {
      padding: 0.5rem;
      border: none;
      background: #262626;
      color: #a3a3a3;
      font-size: 0.875rem;
      cursor: pointer;
      transition:
        background 0.15s ease,
        color 0.15s ease;
    }

    .mode-toggle button.selected {
      background: #404040;
      color: #f5f5f5;
    }

    .custom-rows {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .share-row {
      display: grid;
      grid-template-columns: 3.5rem 1fr 2.5rem;
      gap: 0.5rem;
      align-items: center;
    }

    .share-label {
      font-size: 0.75rem;
      color: #a3a3a3;
      white-space: nowrap;
    }

    .unit-toggle {
      padding: 0.5rem 0;
      border: 1px solid #404040;
      border-radius: 0.25rem;
      background: #262626;
      color: #f5f5f5;
      font-size: 0.875rem;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .unit-toggle:hover {
      border-color: #737373;
    }

    .indicator {
      font-size: 0.75rem;
      color: #a3a3a3;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .indicator.balanced {
      color: #4ade80;
    }

    .indicator.over {
      color: #f87171;
    }

    @media (min-width: 480px) {
      .input-container {
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      input {
        font-size: 0.875rem;
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'input-group': InputGroup
  }
}
