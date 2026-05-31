import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { getLang, setLang, onLangChange, type Lang } from './lib/i18n'

@customElement('lang-switcher')
export class LangSwitcher extends LitElement {
  @state() private _lang: Lang = getLang()

  constructor() {
    super()
    onLangChange((l) => {
      this._lang = l
    })
  }

  private _select(lang: Lang) {
    if (lang === this._lang) return
    setLang(lang)
    this._lang = lang
  }

  render() {
    return html`
      <div class="switch" role="group" aria-label="Language">
        <button
          type="button"
          class="seg ${this._lang === 'th' ? 'active' : ''}"
          @click=${() => this._select('th')}
          aria-pressed=${this._lang === 'th'}
        >
          TH
        </button>
        <span class="sep" aria-hidden="true">/</span>
        <button
          type="button"
          class="seg ${this._lang === 'en' ? 'active' : ''}"
          @click=${() => this._select('en')}
          aria-pressed=${this._lang === 'en'}
        >
          EN
        </button>
      </div>
    `
  }

  static styles = css`
    :host {
      display: inline-block;
    }

    button,
    input,
    select,
    textarea {
      font-family: inherit;
    }

    .switch {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .seg {
      border: none;
      background: none;
      padding: 0;
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      cursor: pointer;
      color: #525252;
      transition: color 0.15s;
    }

    .seg:hover {
      color: #a3a3a3;
    }

    .seg.active {
      color: #f5f5f5;
    }

    .sep {
      color: #404040;
      font-size: 0.75rem;
      user-select: none;
    }
  `
}
