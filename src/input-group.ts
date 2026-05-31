import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { t, getLang, onLangChange, type Lang } from './lib/i18n'

@customElement('input-group')
export class InputGroup extends LitElement {
  @property({ type: Number })
  amount = 0

  @property({ type: Number })
  noOfPeople = 1

  @state()
  private _lang: Lang = getLang()

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
    }

    if (this.amount >= 0 && this.noOfPeople >= 1) {
      const splitAmount = this.amount / this.noOfPeople

      this.dispatchEvent(
        new CustomEvent('amount-change', {
          detail: {
            amount: splitAmount,
            totalAmount: this.amount,
            noOfPeople: this.noOfPeople,
          },
          bubbles: true,
          composed: true,
        })
      )
    }
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
    `
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
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
      font-size: 0.875rem;
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

    @media (min-width: 480px) {
      .input-container {
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'input-group': InputGroup
  }
}
