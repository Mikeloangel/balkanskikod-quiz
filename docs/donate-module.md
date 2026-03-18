# Модуль донатов (Telegram Stars)

## Обзор

Модуль донатов позволяет пользователям поддержать проект через Telegram Stars. Архитектура разделена на две независимые части: **Telegram-бот** (Cloudflare Worker) принимает платежи внутри Telegram, а **веб-компоненты** (React) отображают кнопки и баннеры с deep link на бота.

## Архитектура

```
Пользователь на сайте
    │
    ├── DonateButton / DonateBanner
    │       │
    │       └── href="https://t.me/BotName?start=donate"
    │                   │
    │                   ▼
    │           Telegram (deep link)
    │                   │
    │                   ▼
    │           Telegram Bot (Cloudflare Worker)
    │               ├── /start donate → меню сумм
    │               ├── donate_N → sendInvoice (XTR)
    │               ├── pre_checkout_query → confirm
    │               └── successful_payment → благодарность
    │
    └── Сайт не знает о платеже (stateless)
```

### Ключевое решение
Сайт — статичный SPA на GitHub Pages без бэкенда. Поэтому весь платёжный flow происходит внутри Telegram. Веб-часть содержит только UI с deep link. Feature toggle через env-переменную позволяет включать/выключать донаты без изменения кода.

## Часть 1: Telegram-бот

### Расположение
```
bot/
├── src/
│   └── index.ts          # Логика бота
├── wrangler.toml         # Конфиг Cloudflare Worker
├── .dev.vars             # Локальные секреты (в .gitignore)
├── package.json          # grammy
└── tsconfig.json
```

### Технологии
- **Cloudflare Workers** — serverless runtime (V8, без Node.js API)
- **grammY** — Telegram Bot API фреймворк
- **Webhook режим** — каждый Telegram update → HTTP request → Worker → response

### Основной обработчик (`bot/src/index.ts`)

```typescript
interface Env {
  BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const bot = setupBot(env.BOT_TOKEN);
    return webhookCallback(bot, 'std/http')(request);
  },
};
```

Worker принимает HTTP POST от Telegram, создаёт экземпляр бота, обрабатывает update и возвращает ответ. Нет постоянного процесса — бот "живёт" только на время запроса.

### Пресеты сумм

```typescript
const DONATE_PRESETS = [
  { label: '⭐ 50 Stars', amount: 50 },
  { label: '⭐ 100 Stars', amount: 100 },
  { label: '⭐ 250 Stars', amount: 250 },
];
```

Дополнительно: кнопка "Другая сумма" → пользователь вводит число → бот отправляет Invoice на произвольную сумму (от 1 до 10000 Stars).

### Платёжный flow

```
1. /start donate          → InlineKeyboard с пресетами + "Другая сумма"
2. callbackQuery donate_N → sendInvoice(currency: 'XTR', amount: N)
3. pre_checkout_query     → answerPreCheckoutQuery(true)  // обязательно!
4. successful_payment     → благодарственное сообщение
```

**Важно:** `pre_checkout_query` ОБЯЗАН быть обработан и отвечен `true`, иначе Telegram автоматически отклоняет платёж через ~10 секунд.

### Telegram Stars (XTR)

- `currency: 'XTR'` — код валюты Telegram Stars в Bot Payments API
- `provider_token` не нужен — Stars встроены в Telegram
- Минимум: 1 Star
- Курс: ~$0.019 за Star (зависит от региона и платформы)
- Комиссия: ~30% (Apple/Google забирают при покупке Stars)
- Вывод: через Fragment (Telegram's TON-based platform)

### Деплой и управление

```bash
npm run bot:deploy     # Деплой на Cloudflare Workers
npm run bot:dev        # Локальный dev-сервер
npm run bot:logs       # Живые логи (wrangler tail)
npm run bot:install    # Установить зависимости
```

Секреты:
```bash
cd bot && npx wrangler secret put BOT_TOKEN
```

Webhook (одноразово после первого деплоя):
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WORKER_URL>"
```

## Часть 2: Веб-компоненты

### Конфигурация

#### Feature toggle (`src/shared/config/donate.ts`)

```typescript
export const DONATE_URL = import.meta.env.VITE_TELEGRAM_DONATE_URL?.trim() || '';
export const isDonateEnabled = (): boolean => DONATE_URL.length > 0;
```

Если `VITE_TELEGRAM_DONATE_URL` пустая или не задана — все компоненты донатов возвращают `null`. Это позволяет:
- Отключить донаты в dev-окружении
- Деплоить без бота (feature toggle)
- Не трогать код при включении/выключении

#### Env переменная
```
VITE_TELEGRAM_DONATE_URL=https://t.me/BalkanskiKodDonateBot?start=donate
```

### DonateButton (`src/shared/ui/DonateButton.tsx`)

Компактная кнопка-ссылка, аналогична `SunoButton`:

```typescript
export const DonateButton: React.FC = () => {
  if (!isDonateEnabled()) return null;

  return (
    <Tooltip title={t('donate.tooltip')}>
      <Button
        component="a"
        href={DONATE_URL}
        target="_blank"
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={<TelegramIcon />}
      >
        {t('donate.button')}
      </Button>
    </Tooltip>
  );
};
```

**Размещение на страницах:**
- **HomePage** → `FooterBlock` (между "О проекте" и "Сбросить прогресс")
- **TrackPage** → `ResultCardBlock` (рядом с Suno и Share, после решения трека)
- **AboutPage** → секция "Поддержать проект" (перед "На главную")

### DonateBanner (`src/shared/ui/DonateBanner.tsx`)

Компактный однострочный баннер на HomePage (между StatsBlock и LastSolvedBlock):

```typescript
export const DonateBanner: React.FC = () => {
  if (!isDonateEnabled()) return null;

  return (
    <Box sx={{ px: 2, py: 1, borderRadius: 2, ... }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          {t('donate.bannerText')}
        </Typography>
        <Button component="a" href={DONATE_URL} target="_blank" ...>
          {t('donate.button')}
        </Button>
      </Stack>
    </Box>
  );
};
```

Баннер всегда видим, без dismiss-логики. Стиль: `rgba(255, 255, 255, 0.04)` фон + `divider` рамка — вписывается в dark theme.

### TelegramIcon (`src/shared/ui/icons/TelegramIcon.tsx`)

SVG иконка Telegram через MUI `SvgIcon`. MUI не включает Telegram в стандартный набор иконок, поэтому используется кастомный компонент.

### i18n

**Namespace:** `common` — ключи `donate.*`

| Ключ | ru | en | sr | sr_cyrl |
|------|----|----|----|----|
| `donate.button` | Поддержать ⭐ | Support ⭐ | Podrži ⭐ | Подржи ⭐ |
| `donate.bannerText` | Поддержите проект через Telegram Stars... | Support the project with Telegram Stars... | Podrži projekat putem Telegram Stars... | Подржи пројекат путем Telegram Stars... |
| `donate.tooltip` | Поддержать проект через Telegram Stars | Support the project via Telegram Stars | Podrži projekat putem Telegram Stars | Подржи пројекат путем Telegram Stars |

**Namespace:** `pages` — ключ `about.support`

| ru | en | sr | sr_cyrl |
|----|----|----|----|
| Поддержать проект | Support the project | Podrži projekat | Подржи пројекат |

## Структура файлов

```
src/shared/
├── config/
│   └── donate.ts                  # Конфиг + isDonateEnabled()
├── ui/
│   ├── DonateButton.tsx           # Компактная кнопка
│   ├── DonateBanner.tsx           # Баннер на HomePage
│   └── icons/
│       ├── TelegramIcon.tsx       # SVG иконка
│       └── index.ts              # Public API (FSD)
└── i18n/locales/
    ├── ru/common.ts               # + donate.*
    ├── en/common.ts               # + donate.*
    ├── sr/common.ts               # + donate.*
    └── sr_cyrl/common.ts          # + donate.*

src/pages/
├── home/ui/
│   ├── HomePage.tsx               # + DonateBanner
│   └── elements/FooterBlock.tsx   # + DonateButton
├── track/ui/elements/
│   └── ResultCardBlock.tsx        # + DonateButton
└── about/ui/
    └── AboutPage.tsx              # + DonateButton

bot/
├── src/index.ts                   # Telegram-бот (Cloudflare Worker)
├── wrangler.toml                  # Конфиг Worker
├── .dev.vars                      # Секреты (в .gitignore)
├── package.json                   # grammy
└── tsconfig.json
```

## Тестирование Stars

Тестового режима для Telegram Stars нет. Stars списываются реально.

**Стратегия:**
1. Логику бота (команды, кнопки, `sendInvoice`) можно тестировать бесплатно — Invoice отображается без оплаты
2. E2E тест: оплатить 1 Star → проверить `successful_payment` → refund
3. Refund: `bot.api.refundStarPayment(userId, telegramPaymentChargeId)` — Stars возвращаются

## Особенности реализации

1. **Stateless** — сайт не знает о платежах, бот не хранит состояние
2. **Feature toggle** — env-переменная включает/выключает весь UI
3. **Независимость** — бот деплоится отдельно от сайта
4. **FSD compliant** — все компоненты в `shared/ui`, конфиг в `shared/config`
5. **Graceful degradation** — без env-переменной UI донатов просто не рендерится
