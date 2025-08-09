# Trading Journal Web

A lightweight, local-first trading journal built with React, Vite, Tailwind CSS, Chart.js, and xlsx. It supports Excel import/export, monthly/setup summaries, and an equity curve. UI includes dark mode and compact density.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run preview` — preview production build

## Project

- Data is stored in `localStorage` under `trading_journal_trades_v1`.
- Import/export uses `.xlsx` via the `xlsx` package.
- Charts built with `react-chartjs-2`.

## Features

- Add/edit/delete trades with automatic charge calculations
- Excel import/export
- Monthly and setup-wise summaries
- Equity curve
- Dark mode + compact density toggles

## License

MIT
