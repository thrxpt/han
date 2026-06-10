import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { sanitizeId } from './lib/utils'
import { t, getLang, onLangChange, type Lang } from './lib/i18n'

interface PromptPayIdItem {
  id: string
  label: string
  selected: boolean
}

@customElement('promptpay-setup')
export class PromptPaySetup extends LitElement {
  @property({ type: Array })
  promptPayIds: PromptPayIdItem[] = []

  @property({ type: String })
  selectedId = ''

  @state()
  private inputValue = ''

  @state()
  private labelValue = ''

  @state()
  private _lang: Lang = getLang()

  @property({ type: Boolean })
  collapsed = false

  constructor() {
    super()
    onLangChange((l) => {
      this._lang = l
    })
    const storedIds = window.localStorage.getItem('promptPayIds')
    this.promptPayIds = storedIds ? JSON.parse(storedIds) : []
    if (
      this.promptPayIds.length > 0 &&
      !this.promptPayIds.some((item) => item.selected)
    ) {
      this.promptPayIds[0].selected = true
      window.localStorage.setItem(
        'promptPayIds',
        JSON.stringify(this.promptPayIds)
      )
    }
    this.selectedId = this.promptPayIds.find((item) => item.selected)?.id || ''
    this.collapsed = this.promptPayIds.length > 0
  }

  toggle() {
    this.collapsed = !this.collapsed
    this.dispatchEvent(
      new CustomEvent('setup-collapse', {
        detail: { collapsed: this.collapsed },
        bubbles: true,
        composed: true,
      })
    )
  }

  render() {
    if (this.collapsed) {
      return
    }

    return html`
      <div class="setup-container">
        <h2>${t('setupHeading', this._lang)}</h2>
        <form @submit=${this._onSubmit}>
          <div class="input-group">
            <label for="promptpay-input">${t('promptpayId', this._lang)}</label>
            <div class="input-wrapper">
              <input
                id="promptpay-input"
                type="text"
                inputmode="numeric"
                placeholder=${t('idPlaceholder', this._lang)}
                aria-label=${t('promptpayId', this._lang)}
                @input=${this._onInput}
                .value=${this.inputValue}
              />
              ${this.inputValue
                ? html`<button
                    type="button"
                    class="clear-button"
                    @click=${this._clearInput}
                    aria-label=${t('clearInput', this._lang)}
                  >
                    ✕
                  </button>`
                : ''}
            </div>
            <p class="hint">
              ${t('idHint', this._lang)}
            </p>
          </div>
          <div class="input-group">
            <label for="label-input">${t('labelOptional', this._lang)}</label>
            <div class="input-wrapper">
              <input
                id="label-input"
                type="text"
                placeholder=${t('labelPlaceholder', this._lang)}
                aria-label=${t('labelAria', this._lang)}
                @input=${this._onLabelInput}
                .value=${this.labelValue}
              />
              ${this.labelValue
                ? html`<button
                    type="button"
                    class="clear-button"
                    @click=${this._clearLabel}
                    aria-label=${t('clearLabel', this._lang)}
                  >
                    ✕
                  </button>`
                : ''}
            </div>
          </div>
          <button
            type="submit"
            ?disabled=${!this.inputValue}
            class="submit-button"
          >
            ${t('addId', this._lang)}
          </button>
        </form>
        ${this.promptPayIds.length > 0
          ? html`<div class="saved-ids">
              <label>${t('savedIds', this._lang)}</label>
              <div class="id-list">
                ${this.promptPayIds.map(
                  (item, index) => html`
                    <div
                      class="id-item ${item.id === this.selectedId
                        ? 'selected'
                        : ''}"
                    >
                      <div class="id-details">
                        <span class="value">${item.id}</span>
                        ${item.label
                          ? html`<span class="label">${item.label}</span>`
                          : ''}
                      </div>
                      <div class="id-actions">
                        <button
                          type="button"
                          class="action-button select-button"
                          @click=${() => this._selectId(item.id)}
                          ?disabled=${item.id === this.selectedId}
                        >
                          ${item.id === this.selectedId ? t('selected', this._lang) : t('select', this._lang)}
                        </button>
                        <button
                          type="button"
                          class="action-button delete-button"
                          @click=${() => this._deleteId(index)}
                        >
                          ${t('delete', this._lang)}
                        </button>
                      </div>
                    </div>
                  `
                )}
              </div>
            </div>`
          : ''}
      </div>
    `
  }

  private _onInput(event: Event) {
    const input = event.target as HTMLInputElement
    this.inputValue = sanitizeId(input.value)
  }

  private _onLabelInput(event: Event) {
    const input = event.target as HTMLInputElement
    this.labelValue = input.value
  }

  private _onSubmit(event: Event) {
    event.preventDefault()
    if (!this.inputValue) return

    if (this.promptPayIds.some((item) => item.id === this.inputValue)) {
      window.alert(t('idExists', this._lang))
      return
    }

    const newId = {
      id: this.inputValue,
      label: this.labelValue.trim(),
      selected: this.promptPayIds.length === 0,
    }

    this.promptPayIds = [...this.promptPayIds, newId]
    window.localStorage.setItem(
      'promptPayIds',
      JSON.stringify(this.promptPayIds)
    )

    this._selectId(this.inputValue)

    this.inputValue = ''
    this.labelValue = ''
    this.collapsed = true
  }

  private _selectId(id: string) {
    this.promptPayIds = this.promptPayIds.map((item) => ({
      ...item,
      selected: item.id === id,
    }))
    window.localStorage.setItem(
      'promptPayIds',
      JSON.stringify(this.promptPayIds)
    )
    this.selectedId = id

    const selectedItem = this.promptPayIds.find((item) => item.id === id)

    this.dispatchEvent(
      new CustomEvent('promptpay-save', {
        detail: {
          id: id,
          label: selectedItem?.label || '',
        },
        bubbles: true,
        composed: true,
      })
    )

    this.collapsed = true
  }

  private _deleteId(index: number) {
    const wasSelected = this.promptPayIds[index].selected
    this.promptPayIds = this.promptPayIds.filter((_, i) => i !== index)

    if (wasSelected && this.promptPayIds.length > 0) {
      this.promptPayIds[0].selected = true
      this._selectId(this.promptPayIds[0].id)
    }

    window.localStorage.setItem(
      'promptPayIds',
      JSON.stringify(this.promptPayIds)
    )

    if (this.promptPayIds.length === 0) {
      this.selectedId = ''
      this.dispatchEvent(
        new CustomEvent('promptpay-save', {
          detail: { id: '', label: '' },
          bubbles: true,
          composed: true,
        })
      )
    }
  }

  private _clearInput() {
    this.inputValue = ''
  }

  private _clearLabel() {
    this.labelValue = ''
  }

  static styles = css`
    :host {
      width: 100%;
    }

    button,
    input,
    select,
    textarea {
      font-family: inherit;
    }

    .setup-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 400;
      color: #f5f5f5;
      text-align: center;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    label {
      font-size: 0.75rem;
      font-weight: 400;
      color: #a3a3a3;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      padding-right: 2rem;
      border: 1px solid #404040;
      border-radius: 0.25rem;
      /* 16px minimum prevents iOS Safari auto-zoom on focus */
      font-size: 1rem;
      background: #262626;
      color: #f5f5f5;
      transition: border-color 0.15s ease;
    }

    @media (min-width: 480px) {
      input {
        font-size: 0.875rem;
      }
    }

    input:focus {
      outline: none;
      border-color: #737373;
    }

    .clear-button {
      position: absolute;
      right: 0.5rem;
      padding: 0.125rem;
      border: none;
      background: none;
      color: #d4d4d4;
      cursor: pointer;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .clear-button:hover {
      color: #a3a3a3;
    }

    .hint {
      margin: 0;
      font-size: 0.75rem;
      color: #737373;
    }

    .submit-button {
      padding: 0.5rem 1rem;
      background: #f5f5f5;
      color: #171717;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 400;
      transition: background-color 0.15s ease;
    }

    .submit-button:not(:disabled):hover {
      background: #e5e5e5;
    }

    .submit-button:disabled {
      background: #404040;
      color: #737373;
    }

    .saved-ids {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .id-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .id-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #262626;
      border: 1px solid #404040;
      border-radius: 0.25rem;
      gap: 1rem;
    }

    .id-item.selected {
      border-color: #737373;
    }

    .id-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .id-details .value {
      color: #f5f5f5;
      font-size: 0.875rem;
      overflow-wrap: anywhere;
    }

    .id-details .label {
      color: #a3a3a3;
      font-size: 0.75rem;
    }

    .id-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-button {
      padding: 0.25rem 0.5rem;
      border: 1px solid #404040;
      border-radius: 0.25rem;
      background: #262626;
      color: #f5f5f5;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .action-button:hover:not(:disabled) {
      border-color: #737373;
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .select-button {
      min-width: 4rem;
    }

    .delete-button {
      color: #ef4444;
      border-color: #ef4444;
    }

    .delete-button:hover {
      background: #ef4444;
      color: #f5f5f5;
      border-color: #ef4444 !important;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'promptpay-setup': PromptPaySetup
  }
}
