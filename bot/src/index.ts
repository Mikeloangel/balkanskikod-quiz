import { Bot, InlineKeyboard, webhookCallback } from 'grammy';

interface Env {
  BOT_TOKEN: string;
}

/** Star amount presets for the donation menu */
const DONATE_PRESETS = [
  { label: '⭐ 50 Stars', amount: 50 },
  { label: '⭐ 100 Stars', amount: 100 },
  { label: '⭐ 250 Stars', amount: 250 },
];

const MIN_STARS = 1;
const MAX_STARS = 10000;

function buildDonateKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const preset of DONATE_PRESETS) {
    keyboard.text(preset.label, `donate_${preset.amount}`);
  }
  keyboard.row().text('✨ Другая сумма', 'donate_custom');
  return keyboard;
}

function setupBot(token: string): Bot {
  const bot = new Bot(token);

  // /start or /start donate
  bot.command('start', async (ctx) => {
    if (ctx.match === 'donate') {
      await ctx.reply(
        '🎵 Спасибо, что хочешь поддержать Balkanski kod!\n\nВыбери сумму:',
        { reply_markup: buildDonateKeyboard() },
      );
    } else {
      await ctx.reply(
        'Привет! Я бот для поддержки проекта Balkanski kod 🎵\n' +
          'Нажми кнопку ниже, чтобы поддержать проект.',
        {
          reply_markup: new InlineKeyboard().text('💫 Поддержать', 'donate_menu'),
        },
      );
    }
  });

  // Show donate menu from main chat
  bot.callbackQuery('donate_menu', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      '🎵 Спасибо, что хочешь поддержать Balkanski kod!\n\nВыбери сумму:',
      { reply_markup: buildDonateKeyboard() },
    );
  });

  // Custom amount — ask user to type a number
  bot.callbackQuery('donate_custom', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      '✨ Введи количество звёзд (от ' + MIN_STARS + ' до ' + MAX_STARS + '):',
    );
  });

  // Handle text message as custom star amount
  bot.on('message:text', async (ctx) => {
    const amount = parseInt(ctx.message.text);
    if (isNaN(amount) || amount < MIN_STARS || amount > MAX_STARS) return;

    await ctx.api.sendInvoice(
      ctx.chat.id,
      'Поддержка Balkanski kod',
      'Спасибо за поддержку проекта! 🎵',
      `donate_${amount}_${Date.now()}`,
      'XTR',
      [{ label: 'Донат', amount }],
    );
  });

  // Handle preset amount selection → send invoice
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

  // Must answer pre-checkout query, otherwise payment is rejected
  bot.on('pre_checkout_query', async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
  });

  // Successful payment → thank the user
  bot.on('message:successful_payment', async (ctx) => {
    const payment = ctx.message!.successful_payment!;
    await ctx.reply(
      `🎉 Спасибо за поддержку!\n\n` +
        `Ты отправил ${payment.total_amount} ⭐\n` +
        `Balkanski kod станет ещё лучше благодаря тебе!`,
    );
  });

  return bot;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const bot = setupBot(env.BOT_TOKEN);
    return webhookCallback(bot, 'std/http')(request);
  },
};
