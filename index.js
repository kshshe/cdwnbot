require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TOKEN);

bot.catch((err) => console.error(err));

bot.start((ctx) =>
  ctx.reply(
    `Чтобы запустить таймер, напишите "@cdwnbot <время в секундах>"\nНапример, @cdwnbot 100 для таймера на 100 секунд.`,
  ),
);

const waitForSecond = () =>
  new Promise((res) => {
    setTimeout(res, 1000);
  });

const createCountdownMessage = async (ctx, seconds) => {
  const { message_id } = await ctx.reply(`${seconds}`);
  while (seconds-- > 0) {
    await waitForSecond();
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      message_id,
      undefined,
      seconds,
    );
  }
};

bot.on("text", (ctx) => {
  const text = ctx?.message?.text;
  if (text) {
    const words = text
      .split(" ")
      .map((s) => s.trim())
      .filter(Boolean);
    if (words[0] === `@${ctx.botInfo.username}` && words[1]) {
      let seconds = parseInt(words[1], 10);
      if (seconds) {
        createCountdownMessage(ctx, seconds);
      }
    }
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
