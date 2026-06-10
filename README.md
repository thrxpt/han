# Han - Split Bills Easily

A simple web application to help calculate and split bills among friends with PromptPay QR code generation. Built with Lit and TypeScript. Installable as a PWA.

## Features

- 🧮 Easy bill splitting calculator
- ⚖️ Equal or custom split — per-person shares as percent or fixed THB amount
- 📱 Generate PromptPay QR code
- 💾 Manage multiple PromptPay IDs, stored in local storage
- 🌐 Thai / English language switcher
- 💵 Thai Baht currency formatting
- 📲 PWA — installable, works offline

## Tech Stack

- [Lit](https://lit.dev/) - For building fast, lightweight web components
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) - PWA manifest and service worker
- [promptpay-qr](https://github.com/dtinth/promptpay-qr) - PromptPay QR Code Generator
- [qrcode](https://github.com/soldair/node-qrcode) - QR Code generation library

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Run the development server:

```bash
bun run dev
```

4. Build for production:

```bash
bun run build
```

5. Preview the production build:

```bash
bun run preview
```

## Usage

1. Set your PromptPay ID (phone number or national ID) — you can save and switch between multiple IDs
2. Enter the total bill amount
3. Specify number of people to split with
4. Choose equal split, or switch to custom mode to set each person's share as a percent or fixed amount
5. Scan the generated QR code with any Thai banking app
