# ТЗ: Донаты через Telegram Stars

**Дата:** 2026-03-18
**Статус:** Реализован
**Приоритет:** Средний

## Общее описание

Добавить возможность принимать донаты через Telegram Stars. Пользователь нажимает кнопку/баннер на сайте → открывается Telegram бот → оплата Stars внутри Telegram. Веб-часть — только UI с deep link на бота. Реализация состоит из двух независимых частей: Telegram-бот (внешний сервис) и UI-интеграция в веб-приложение.

---

## Часть 1: Telegram-бот

### 1.1 Создание бота

1. Открыть @BotFather в Telegram
2. `/newbot` → задать имя (например, "Balkanski kod Donate") и username (например, `BalkanskiKodDonateBot`)
3. Сохранить `BOT_TOKEN`
4. `/mybots` → выбрать бота → Payments → включить **Telegram Stars** (встроенный провайдер, без внешних ключей)
5. Задать описание бота и аватар

### 1.2 Deep link

Формат: `https://t.me/BalkanskiKodDonateBot?start=donate`

При переходе по ссылке Telegram открывает чат с ботом и передаёт параметр `donate` в команду `/start`.

### 1.3 Логика бота

```
Пользователь → /start donate → Бот показывает приветствие + варианты сумм
Пользователь → выбирает сумму → Бот отправляет Invoice (Stars)
Telegram → pre_checkout_query → Бот подтверждает
Telegram → successful_payment → Бот благодарит
```

**Варианты сумм (пресеты):**
- ⭐ 50 Stars (~$0.95)
- ⭐ 100 Stars (~$1.90)
- ⭐ 250 Stars (~$4.75)

### 1.4 Пример кода бота (Node.js + grammy)

```typescript
import { Bot, InlineKeyboard } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN!);

// Обработка /start donate
bot.command('start', async (ctx) => {
  const param = ctx.match; // "donate" из deep link

  if (param === 'donate') {
    const keyboard = new InlineKeyboard()
      .text('⭐ 50 Stars', 'donate_50')
      .text('⭐ 100 Stars', 'donate_100')
      .text('⭐ 250 Stars', 'donate_250');

    await ctx.reply(
      '🎵 Спасибо, что хочешь поддержать Balkanski kod!\n\nВыбери сумму:',
      { reply_markup: keyboard }
    );
  } else {
    await ctx.reply(
      'Привет! Я бот для поддержки проекта Balkanski kod 🎵\n' +
      'Нажми кнопку ниже, чтобы поддержать проект.',
      {
        reply_markup: new InlineKeyboard().text('💫 Поддержать', 'donate_menu'),
      }
    );
  }
});

// Обработка выбора суммы
bot.callbackQuery(/^donate_(\d+)$/, async (ctx) => {
  const amount = parseInt(ctx.match[1]);

  await ctx.answerCallbackQuery();
  await ctx.api.sendInvoice(
    ctx.chat!.id,
    'Поддержка Balkanski kod',           // title
    'Спасибо за поддержку проекта! 🎵',  // description
    `donate_${amount}_${Date.now()}`,     // payload (уникальный)
    'XTR',                                // currency — Telegram Stars
    [{ label: 'Донат', amount }],         // prices
  );
});

// Показ меню донатов из основного чата
bot.callbackQuery('donate_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .text('⭐ 50 Stars', 'donate_50')
    .text('⭐ 100 Stars', 'donate_100')
    .text('⭐ 250 Stars', 'donate_250');

  await ctx.editMessageText(
    '🎵 Спасибо, что хочешь поддержать Balkanski kod!\n\nВыбери сумму:',
    { reply_markup: keyboard }
  );
});

// Подтверждение pre-checkout (обязательно, иначе платёж отклонится)
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

// Успешная оплата
bot.on('message:successful_payment', async (ctx) => {
  const payment = ctx.message!.successful_payment!;
  await ctx.reply(
    `🎉 Спасибо за поддержку!\n\n` +
    `Ты отправил ${payment.total_amount} ⭐\n` +
    `Balkanski kod станет ещё лучше благодаря тебе!`
  );
});

export default bot;
```

### 1.5 Расположение исходного кода бота

Код бота хранится внутри этого репозитория в папке `bot/`:

```
balkanskikod-quiz/
├── src/                        ← веб-приложение (React)
├── bot/                        ← серверная часть (Cloudflare Worker)
│   ├── src/
│   │   └── index.ts            ← основной код бота
│   ├── wrangler.toml           ← конфиг Cloudflare Worker
│   ├── .dev.vars               ← локальные секреты (в .gitignore)
│   ├── package.json            ← зависимости бота (grammy)
│   └── tsconfig.json
├── package.json                ← корневой (веб-часть + скрипты бота)
└── ...
```

**npm scripts в корневом `package.json`:**

```json
{
  "scripts": {
    "bot:dev": "cd bot && npx wrangler dev",
    "bot:deploy": "cd bot && npx wrangler deploy",
    "bot:logs": "cd bot && npx wrangler tail",
    "bot:install": "cd bot && npm install"
  }
}
```

Использование:
- `npm run bot:install` — установить зависимости бота (при первом клоне)
- `npm run bot:dev` — локальная разработка бота
- `npm run bot:deploy` — деплой бота на Cloudflare Workers
- `npm run bot:logs` — живые логи бота

> **Почему в одном репо:** проект портфольный — удобно показать и фронтенд и бэкенд в одном месте. `bot/` имеет свой `package.json` и не влияет на веб-сборку.

> **`.gitignore` дополнения:**
> ```
> bot/.dev.vars
> bot/node_modules/
> ```

### 1.6 Варианты хостинга бота (сравнение)

| Критерий | Cloudflare Workers | Vercel Serverless | VPS |
|----------|-------------------|-------------------|-----|
| Бесплатный тир | 100k req/day | 100k req/month | Нет |
| Cold starts | Нет | Да (~250ms) | Нет |
| Язык | JS/TS (Workers API) | Node.js | Любой |
| Сложность деплоя | Низкая (wrangler) | Низкая (vercel cli) | Средняя |
| Webhook поддержка | Да | Да | Да (+ polling) |
| Рекомендация | **Лучший вариант** | Хорош если уже есть Vercel | Полный контроль |

### 1.7 Подробная инструкция: Cloudflare Workers (с нуля)

#### Шаг 1: Регистрация в Cloudflare

1. Перейти на https://dash.cloudflare.com/sign-up
2. Зарегистрироваться (email + пароль), подтвердить email
3. Бесплатный план (Free) — этого достаточно
4. После регистрации ты попадаешь в Dashboard — можно переходить к коду

> Cloudflare Workers на бесплатном плане: 100 000 запросов/день, 10 мс CPU time/запрос — для бота этого хватит с огромным запасом.

#### Шаг 2: Установка Wrangler CLI

Wrangler — это CLI инструмент Cloudflare для разработки и деплоя Workers.

```bash
# Установить глобально (или можно использовать npx)
npm install -g wrangler

# Проверить установку
wrangler --version

# Авторизоваться — откроется браузер для OAuth
wrangler login
```

После `wrangler login` браузер откроет страницу авторизации Cloudflare. Нажми "Allow" — CLI получит токен и сохранит его локально.

#### Шаг 3: Создание проекта внутри репозитория

```bash
# Из корня проекта balkanskikod-quiz:
npm create cloudflare@latest bot

# В интерактивном меню выбрать:
#   What would you like to start with? → Hello World example
#   Which template? → Hello World Worker
#   Which language? → TypeScript
#   Deploy with Cloudflare? → No (задеплоим позже, когда код будет готов)
#   Initialize git repository? → No (уже есть корневой git)

cd bot
```

После создания структура `bot/`:
```
bot/
├── src/
│   └── index.ts          ← сюда пишем код бота
├── wrangler.toml          ← конфиг Worker'а
├── package.json
└── tsconfig.json
```

> **Важно:** убедись что `bot/node_modules/` и `bot/.dev.vars` добавлены в корневой `.gitignore`.

#### Шаг 4: Установка зависимостей

```bash
npm install grammy
```

> Примечание: для Cloudflare Workers используется стандартный `grammy` с ручным `webhookCallback`. Пакет `@grammyjs/adapter-cloudflare-workers` опционален — можно обойтись без него.

#### Шаг 5: Код бота (webhook для Workers)

Заменить содержимое `src/index.ts`:

```typescript
import { Bot, InlineKeyboard, webhookCallback } from 'grammy';

// Типизация environment bindings (Cloudflare Workers)
interface Env {
  BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN);

    // --- Команды бота ---

    bot.command('start', async (ctx) => {
      const param = ctx.match;

      if (param === 'donate') {
        const keyboard = new InlineKeyboard()
          .text('⭐ 50 Stars', 'donate_50')
          .text('⭐ 100 Stars', 'donate_100')
          .text('⭐ 250 Stars', 'donate_250');

        await ctx.reply(
          '🎵 Спасибо, что хочешь поддержать Balkanski kod!\n\nВыбери сумму:',
          { reply_markup: keyboard }
        );
      } else {
        await ctx.reply(
          'Привет! Я бот для поддержки проекта Balkanski kod 🎵\n' +
          'Нажми кнопку ниже, чтобы поддержать проект.',
          {
            reply_markup: new InlineKeyboard().text('💫 Поддержать', 'donate_menu'),
          }
        );
      }
    });

    bot.callbackQuery(/^donate_(\d+)$/, async (ctx) => {
      const amount = parseInt(ctx.match[1]);
      await ctx.answerCallbackQuery();
      await ctx.api.sendInvoice(
        ctx.chat!.id,
        'Поддержка Balkanski kod',
        'Спасибо за поддержку проекта! 🎵',
        `donate_${amount}_${Date.now()}`,
        'XTR',
        [{ label: 'Донат', amount }],
      );
    });

    bot.callbackQuery('donate_menu', async (ctx) => {
      await ctx.answerCallbackQuery();
      const keyboard = new InlineKeyboard()
        .text('⭐ 50 Stars', 'donate_50')
        .text('⭐ 100 Stars', 'donate_100')
        .text('⭐ 250 Stars', 'donate_250');

      await ctx.editMessageText(
        '🎵 Спасибо, что хочешь поддержать Balkanski kod!\n\nВыбери сумму:',
        { reply_markup: keyboard }
      );
    });

    bot.on('pre_checkout_query', async (ctx) => {
      await ctx.answerPreCheckoutQuery(true);
    });

    bot.on('message:successful_payment', async (ctx) => {
      const payment = ctx.message!.successful_payment!;
      await ctx.reply(
        `🎉 Спасибо за поддержку!\n\n` +
        `Ты отправил ${payment.total_amount} ⭐\n` +
        `Balkanski kod станет ещё лучше благодаря тебе!`
      );
    });

    // --- Webhook handler ---
    return webhookCallback(bot, 'std/http')(request);
  },
};
```

> **Ключевое отличие от обычного Node.js:** в Cloudflare Workers нет постоянного процесса. Каждый HTTP-запрос от Telegram вызывает функцию `fetch()`, бот обрабатывает update и возвращает ответ. Это и есть webhook-режим.

#### Шаг 6: Настройка секретов (BOT_TOKEN)

```bash
# Добавить BOT_TOKEN как encrypted secret (не в код!)
npx wrangler secret put BOT_TOKEN
# Вставить токен из @BotFather когда попросит
```

> Секреты шифруются и недоступны в Dashboard — безопаснее чем env переменные. `wrangler secret put` сохраняет значение на серверах Cloudflare, в коде доступ через `env.BOT_TOKEN`.

#### Шаг 7: Локальная разработка (опционально)

```bash
# Запустить локальный dev-сервер
npx wrangler dev

# Worker будет доступен на http://localhost:8787
# Для тестирования можно отправить POST с Telegram update вручную,
# но проще сразу задеплоить и тестировать через Telegram
```

> Для локальных секретов создай файл `.dev.vars` (он в .gitignore):
> ```
> BOT_TOKEN=123456:ABC-DEF...
> ```

#### Шаг 8: Деплой

```bash
npx wrangler deploy
```

Вывод будет примерно таким:
```
Published balkanski-donate-bot (0.15 sec)
  https://balkanski-donate-bot.YOUR-SUBDOMAIN.workers.dev
```

Запомни этот URL — он нужен для webhook.

> **Первый деплой:** Cloudflare автоматически создаст `*.workers.dev` субдомен для твоего аккаунта. Его можно увидеть в Dashboard → Workers & Pages.

#### Шаг 9: Установка webhook в Telegram

```bash
# Заменить <BOT_TOKEN> и <WORKER_URL> на свои значения
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://balkanski-donate-bot.YOUR-SUBDOMAIN.workers.dev"
```

Ответ должен быть:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

Проверить текущий webhook:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

#### Шаг 10: Тестирование

1. Открыть `https://t.me/BalkanskiKodDonateBot?start=donate` в браузере
2. Telegram откроется с ботом → должно показать варианты сумм
3. Выбрать сумму → появится Invoice со Stars
4. Оплатить (Stars списываются реально, минимум 1 Star)
5. Бот должен отправить благодарственное сообщение

#### Полезные команды Wrangler

```bash
wrangler deploy              # Деплой в production
wrangler dev                 # Локальный dev-сервер
wrangler tail                # Живые логи Worker'а (как tail -f)
wrangler secret put KEY      # Добавить секрет
wrangler secret list         # Список секретов
wrangler delete              # Удалить Worker
```

#### Мониторинг и логи

В Cloudflare Dashboard → Workers & Pages → твой Worker:
- **Metrics** — количество запросов, ошибки, latency
- **Logs** — real-time логи (или `wrangler tail` из терминала)
- **Settings** — переменные, домены, cron triggers

### 1.8 Альтернативы: Vercel / VPS (краткие инструкции)

**Vercel Serverless:**
```bash
mkdir balkanski-donate-bot && cd $_
npm init -y
npm install grammy
# Создать api/webhook.ts с обработчиком (аналогично Workers, но export default function)
# Добавить BOT_TOKEN в Vercel Dashboard → Settings → Environment Variables
vercel deploy
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.vercel.app/api/webhook"
```

**VPS:**
```bash
git clone <repo> && cd balkanski-donate-bot
npm install
BOT_TOKEN=<token> node index.js  # polling mode
# Или через pm2:
pm2 start index.js --name donate-bot
```

### 1.9 Тестирование Stars-платежей

**Тестового режима для Stars нет** — это известное ограничение Telegram. Stars списываются реально даже при тестировании. Однако Stars можно вернуть через refund.

**Стратегия тестирования:**

1. **Бесплатно (логика бота):** команды, кнопки, меню, `sendInvoice` — работают без оплаты. Invoice отображается в чате, можно убедиться что всё корректно.

2. **Платно (e2e, ~$0.95):** купить 50 Stars, провести тестовый донат, проверить `successful_payment`, затем сделать refund.

3. **Refund через Bot API:**

```typescript
// В боте: вернуть Stars после тестового платежа
// userId — ID пользователя, telegramPaymentChargeId — из successful_payment
await bot.api.refundStarPayment(userId, telegramPaymentChargeId);
```

> Для удобства можно добавить в бота команду `/refund` (только для администратора) на время разработки.

**Минимальная сумма:** 1 Star — можно использовать для тестов (добавить пресет "⭐ 1 Star" на время разработки).

### 1.10 Чеклист тестирования бота

- [ ] `/start` без параметров → приветствие + кнопка "Поддержать"
- [ ] `/start donate` (или deep link) → меню с вариантами сумм
- [ ] Выбор суммы → Invoice со Stars
- [ ] Оплата (1 Star) → `successful_payment` → благодарственное сообщение
- [ ] Refund тестового платежа → Stars вернулись
- [ ] Deep link `https://t.me/BotName?start=donate` из браузера → Telegram → бот
- [ ] `wrangler tail` / `npm run bot:logs` — логи без ошибок

---

## Часть 2: Веб-интеграция (этот проект)

### 2.1 Конфигурация

**Env переменная:**
```
VITE_TELEGRAM_DONATE_URL=https://t.me/BalkanskiKodDonateBot?start=donate
```

**Feature toggle:** если `VITE_TELEGRAM_DONATE_URL` пустая или не задана — весь UI донатов не рендерится.

**Файл конфигурации:**
```typescript
// src/shared/config/donate.ts
export const DONATE_URL = import.meta.env.VITE_TELEGRAM_DONATE_URL?.trim() || '';
export const isDonateEnabled = (): boolean => DONATE_URL.length > 0;
```

**localStorage ключ:** `balkanski-kod-donate-dismissed` — для dismiss баннера на HomePage.

### 2.2 Новые компоненты

#### DonateButton (компактная кнопка)

**Файл:** `src/shared/ui/DonateButton.tsx`

Компактная кнопка по аналогии с `SunoButton` из `src/widgets/radioPlayer/ui/SunoButton.tsx`:
- `variant="outlined"`, `color="secondary"`, `size="small"`
- Иконка Telegram (MUI `TelegramIcon` или SVG)
- Текст из i18n `common:donate.button`
- `target="_blank"` → открывает deep link
- Tooltip с `common:donate.tooltip`
- Возвращает `null` если `isDonateEnabled() === false`

```tsx
// Примерная структура
<Tooltip title={t('donate.tooltip')}>
  <Button
    component="a"
    href={DONATE_URL}
    target="_blank"
    rel="noreferrer"
    variant="outlined"
    color="secondary"
    size="small"
    startIcon={<TelegramIcon />}
    sx={{ textTransform: 'none', fontWeight: 600 }}
  >
    {t('donate.button')}
  </Button>
</Tooltip>
```

#### DonateBanner (dismissible баннер)

**Файл:** `src/shared/ui/DonateBanner.tsx`

Баннер-карточка для HomePage:
- `Box` с `backgroundColor: 'rgba(255, 255, 255, 0.04)'`, `border: '1px solid'`, `borderColor: 'divider'`, `borderRadius: 2`
- Иконка Stars / Telegram
- Заголовок: `common:donate.bannerTitle`
- Текст: `common:donate.bannerText`
- CTA кнопка (DonateButton или стилизованная)
- Кнопка "Позже" (`common:donate.dismiss`) — dismiss в localStorage
- Возвращает `null` если dismissed или `isDonateEnabled() === false`

```tsx
// Логика dismiss
const DISMISS_KEY = 'balkanski-kod-donate-dismissed';
const [dismissed, setDismissed] = useState(
  () => localStorage.getItem(DISMISS_KEY) === '1'
);
const handleDismiss = () => {
  localStorage.setItem(DISMISS_KEY, '1');
  setDismissed(true);
};
```

### 2.3 Размещение на страницах

#### HomePage (`src/pages/home/ui/HomePage.tsx`)

**1. DonateBanner — между StatsBlock и LastSolvedBlock:**

```tsx
<Stack spacing={3}>
  <HeaderBlock ... />
  <StatsBlock stats={stats} />

  <DonateBanner />              {/* ← НОВОЕ: dismissible баннер */}

  <LastSolvedBlock ... />
  <TracksListBlock ... />
  <FooterBlock ... />
  ...
</Stack>
```

**Обоснование:** самое видное место после статистики. Пользователь видит свой прогресс и получает мягкий призыв поддержать проект. Баннер dismissible — не раздражает.

**2. DonateButton — в FooterBlock (`src/pages/home/ui/elements/FooterBlock.tsx`):**

```tsx
<Stack direction="row" justifyContent="space-between" alignItems="center">
  <Typography color="text.secondary">
    <Link ...>О проекте</Link>
  </Typography>

  <DonateButton />               {/* ← НОВОЕ: компактная кнопка */}

  <Button ...>Сбросить прогресс</Button>
</Stack>
```

**Обоснование:** ненавязчивое постоянное присутствие. Кнопка всегда видна в футере, даже если баннер закрыт.

#### TrackPage (`src/pages/track/ui/elements/ResultCardBlock.tsx`)

**DonateButton — в ряду action-кнопок:**

```tsx
<Stack direction="row" spacing={1} justifyContent="center">
  {sunoUrl && <Button ...>Suno</Button>}

  <DonateButton />               {/* ← НОВОЕ: рядом с Suno и Share */}

  <IconButton onClick={onOpenShare} ...>
    <ShareRoundedIcon />
  </IconButton>
</Stack>
```

**Обоснование:** момент после решения трека — пользователь в хорошем настроении, высокая конверсия. Кнопка появляется только после решения/раскрытия.

#### AboutPage (`src/pages/about/ui/AboutPage.tsx`)

**Блок "Поддержать проект" — после контактов, перед "Назад":**

```tsx
<Stack spacing={0.5}>
  <Typography variant="subtitle2" color="text.secondary">
    {/* Контакты */}
  </Typography>
  ...
</Stack>

{/* ← НОВОЕ: блок поддержки */}
<Stack spacing={0.5}>
  <Typography variant="subtitle2" color="text.secondary">
    {t('about.support')}  {/* "Поддержать проект" */}
  </Typography>
  <DonateButton />
</Stack>

<Typography>
  <Link ...>Назад на главную</Link>
</Typography>
```

**Обоснование:** страница "О проекте" — место для заинтересованной аудитории. Естественное расположение рядом с контактами.

### 2.4 i18n

**Namespace:** `common` (общие ключи, используемые на всех страницах)

Дополнительно: ключ `about.support` в namespace `pages` для AboutPage.

#### Русский (`src/shared/i18n/locales/ru/common.ts`)

```typescript
donate: {
  button: "Поддержать ⭐",
  bannerTitle: "Нравится викторина?",
  bannerText: "Поддержите проект через Telegram Stars — это быстро и просто",
  dismiss: "Позже",
  tooltip: "Поддержать проект через Telegram Stars",
}
```

#### English (`src/shared/i18n/locales/en/common.ts`)

```typescript
donate: {
  button: "Support ⭐",
  bannerTitle: "Enjoying the quiz?",
  bannerText: "Support the project with Telegram Stars — quick and easy",
  dismiss: "Later",
  tooltip: "Support the project via Telegram Stars",
}
```

#### Srpski latinica (`src/shared/i18n/locales/sr/common.ts`)

```typescript
donate: {
  button: "Podrži ⭐",
  bannerTitle: "Sviđa ti se kviz?",
  bannerText: "Podrži projekat putem Telegram Stars — brzo i jednostavno",
  dismiss: "Kasnije",
  tooltip: "Podrži projekat putem Telegram Stars",
}
```

#### Srpski ćirilica (`src/shared/i18n/locales/sr_cyrl/common.ts`)

```typescript
donate: {
  button: "Подржи ⭐",
  bannerTitle: "Свиђа ти се квиз?",
  bannerText: "Подржи пројекат путем Telegram Stars — брзо и једноставно",
  dismiss: "Касније",
  tooltip: "Подржи пројекат путем Telegram Stars",
}
```

### 2.5 Полная структура файлов (бот + веб)

```
balkanskikod-quiz/
├── bot/                                ← НОВЫЙ: серверная часть
│   ├── src/
│   │   └── index.ts                   ← код бота (Cloudflare Worker)
│   ├── wrangler.toml                  ← конфиг Worker
│   ├── .dev.vars                      ← локальные секреты (в .gitignore)
│   ├── package.json                   ← grammy
│   └── tsconfig.json
│
├── src/shared/
│   ├── config/
│   │   └── donate.ts                  ← НОВЫЙ: конфиг + isDonateEnabled()
│   ├── ui/
│   │   ├── DonateButton.tsx           ← НОВЫЙ: компактная кнопка
│   │   └── DonateBanner.tsx           ← НОВЫЙ: dismissible баннер
│   └── i18n/locales/
│       ├── ru/common.ts               ← ИЗМЕНЁН: + donate.*
│       ├── en/common.ts               ← ИЗМЕНЁН: + donate.*
│       ├── sr/common.ts               ← ИЗМЕНЁН: + donate.*
│       └── sr_cyrl/common.ts          ← ИЗМЕНЁН: + donate.*
│
├── src/pages/home/ui/
│   ├── HomePage.tsx                   ← ИЗМЕНЁН: + DonateBanner
│   └── elements/FooterBlock.tsx       ← ИЗМЕНЁН: + DonateButton
│
├── src/pages/track/ui/elements/
│   └── ResultCardBlock.tsx            ← ИЗМЕНЁН: + DonateButton
│
├── src/pages/about/ui/
│   └── AboutPage.tsx                  ← ИЗМЕНЁН: + блок поддержки
│
├── package.json                       ← ИЗМЕНЁН: + bot:* скрипты
└── .gitignore                         ← ИЗМЕНЁН: + bot/.dev.vars, bot/node_modules/
```

---

## Пошаговый план: кто что делает

> **Ты** = Михаил, **Claude** = я, **Вместе** = совместно в чате

| # | Шаг | Кто | Что конкретно |
|---|------|-----|---------------|
| 1 | Регистрация Cloudflare | **Ты** | dash.cloudflare.com/sign-up → бесплатный план |
| 2 | Установка Wrangler | **Ты** | `npm i -g wrangler` → `wrangler login` |
| 3 | Создание Telegram-бота | **Ты** | @BotFather → `/newbot` → сохранить токен, включить Stars |
| 4 | Инициализация `bot/` | **Вместе** | `npm create cloudflare@latest bot` из корня репо |
| 5 | Код бота | **Claude** | Написать `bot/src/index.ts`, `wrangler.toml`, скрипты в `package.json` |
| 6 | Секрет BOT_TOKEN | **Ты** | `cd bot && npx wrangler secret put BOT_TOKEN` → вставить токен |
| 7 | Первый деплой бота | **Ты** | `npm run bot:deploy` → запомнить URL Worker'а |
| 8 | Установка webhook | **Ты** | `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WORKER_URL>"` |
| 9 | Тест бота | **Ты** | Открыть deep link → проверить меню → тест 1 Star → refund |
| 10 | Веб-компоненты | **Claude** | `DonateButton`, `DonateBanner`, `donate.ts`, i18n ключи |
| 11 | Интеграция на страницы | **Claude** | HomePage, TrackPage, AboutPage — вставка компонентов |
| 12 | Env переменная | **Ты** | Добавить `VITE_TELEGRAM_DONATE_URL=https://t.me/BotName?start=donate` в `.env` |
| 13 | Проверка | **Вместе** | `npm run lint` + `npm run build` + визуальный тест |
| 14 | Деплой сайта | **Ты** | `npm run deploy` (GitHub Pages) |

**Порядок важен:** шаги 1–9 (бот) → шаги 10–11 (веб) → шаги 12–14 (финал). Веб-часть можно делать параллельно с шагами 1–3, но для проверки deep link нужен готовый бот.

---

## Фазы реализации (детально)

### Фаза 1: Telegram-бот (`bot/`)

- [ ] Создать бота через @BotFather, включить Telegram Stars
- [ ] Инициализировать `bot/` в репозитории (`npm create cloudflare@latest bot`)
- [ ] Написать код бота в `bot/src/index.ts`
- [ ] Добавить `bot:*` скрипты в корневой `package.json`
- [ ] Обновить `.gitignore` (`bot/.dev.vars`, `bot/node_modules/`)
- [ ] `npm run bot:deploy` → задеплоить на Cloudflare Workers
- [ ] Установить webhook
- [ ] Протестировать Stars-платёж (1 Star) + refund
- [ ] Получить финальный deep link URL

### Фаза 2: Shared-слой

- [ ] Создать `src/shared/config/donate.ts`
- [ ] Создать `src/shared/ui/DonateButton.tsx`
- [ ] Создать `src/shared/ui/DonateBanner.tsx`
- [ ] Добавить i18n ключи `donate.*` во все 4 языка
- [ ] Добавить `VITE_TELEGRAM_DONATE_URL` в `.env`

### Фаза 3: Интеграция на страницы

- [ ] HomePage: вставить DonateBanner между StatsBlock и LastSolvedBlock
- [ ] FooterBlock: вставить DonateButton между ссылками
- [ ] ResultCardBlock: вставить DonateButton в action-кнопки
- [ ] AboutPage: добавить блок поддержки в контакты

### Фаза 4: Проверка

- [ ] `npm run lint` — без ошибок
- [ ] `npm run lint:fsd` — FSD compliant (все новые файлы в shared)
- [ ] `npm run build` — собирается
- [ ] Без `VITE_TELEGRAM_DONATE_URL` — UI донатов скрыт
- [ ] С URL — все кнопки/баннер работают
- [ ] Deep link открывает Telegram с ботом
- [ ] Dismiss баннера сохраняется в localStorage
- [ ] Все 4 языка отображаются корректно
- [ ] Мобильный тест (основной сценарий — Telegram на телефоне)

---

## Риски и ограничения

| Риск | Митигация |
|------|-----------|
| Высокая комиссия Stars (~30% Apple/Google) | Информировать: это дополнительный канал, не основной |
| Бот требует хостинг | Cloudflare Workers — бесплатно, минимум обслуживания |
| Нет отслеживания донатов на сайте | На данном этапе не нужно; бот может логировать в Telegram |
| Stars нельзя купить без Telegram | Целевая аудитория уже в Telegram (сербский контент) |

## Будущие улучшения (не в скоупе)

- Счётчик собранных донатов на сайте (потребует backend/API)
- Благодарственный бейдж для доноров
- Кастомные суммы донатов
- Интеграция с Telegram Mini App
