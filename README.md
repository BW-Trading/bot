# BW-Trading-Bot

This is a basic express server with some basic middlewares and routes.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Installation

```bash
npm install
```

## Usage

### Build the project

```bash
npm run build
```

### Start the server

```bash
npm run start
```

### Start the server in watch mode

```bash
npm run dev
```

## Development

```bash
npm run dev
```

## Migrations

npx typeorm-ts-node-commonjs migration:create src/migrations/migration-name
npx typeorm-ts-node-commonjs migration:generate -d ./src/data-source.ts src/migrations/initial-setup
npx typeorm-ts-node-commonjs migration:run -d ./src/data-source.ts
npx typeorm-ts-node-commonjs migration:revert
