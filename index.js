require("dotenv").config();
const { Telegraf } = require("telegraf");

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

const declOfNum = (number, titles) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};

const getText = (seconds, secondsLeft) => {
  return `${declOfNum(secondsLeft, [
    "Осталась",
    "Осталось",
    "Осталось",
  ])} ${secondsLeft} ${declOfNum(secondsLeft, [
    "секунда",
    "секунды",
    "секунд",
  ])} из ${seconds}`;
};

const createCountdownMessage = async (ctx, seconds) => {
  let secondsLeft = seconds;
  const text = getText(seconds, secondsLeft);
  let lastText = text;
  const { message_id } = await ctx.reply(text);
  while (secondsLeft > 0) {
    const nextStep = Math.ceil(secondsLeft / 10);
    secondsLeft -= nextStep;
    await wait(nextStep);
    const text = getText(seconds, secondsLeft);
    if (text !== lastText) {
      lastText = text;
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        message_id,
        undefined,
        text,
      );
    }
  }
  await ctx.telegram.sendMessage(ctx.chat.id, "Время вышло", {
    reply_to_message_id: message_id,
    allow_sending_without_reply: true,
  });
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
