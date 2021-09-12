require("dotenv").config();
const { Telegraf } = require("telegraf");
const moment = require("moment");

const bot = new Telegraf(process.env.TOKEN);

bot.catch((err) => console.error(err));

bot.start((ctx) =>
  ctx.reply(
    `Чтобы запустить таймер, напишите "@cdwnbot <время в секундах>"\nНапример, @cdwnbot 100 для таймера на 100 секунд.`,
  ),
);

const wait = (seconds) =>
  new Promise((res) => {
    setTimeout(res, seconds * 1000);
  });

const createCountdownMessage = async (ctx, seconds) => {
  const secondsLeft = seconds;
  const { message_id } = await ctx.reply(`${secondsLeft} / ${seconds}`);
  while (secondsLeft > 0) {
    const nextStep = Math.ceil(secondsLeft / 10);
    secondsLeft -= nextStep;
    await wait(nextStep);
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      message_id,
      undefined,
      `${secondsLeft} / ${seconds}`,
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
