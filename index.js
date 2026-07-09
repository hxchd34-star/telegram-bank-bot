require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const Database = require("better-sqlite3");
const transfer = require("./commands/transfer");
const bot = new TelegramBot(process.env.TOKEN, {
  polling: true,
});

const db = new Database("/var/data/data.db");

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY,
username TEXT,
name TEXT,
account TEXT,
bank TEXT,
card TEXT,
money INTEGER DEFAULT 1000,
wallet INTEGER DEFAULT 0,
rank INTEGER DEFAULT 0
)
`).run();

function randomAccount() {
  let num = "";
  for (let i = 0; i < 16; i++) {
    num += Math.floor(Math.random() * 10);
  }
  return num;
}

bot.onText(/\/start/, (msg) => {
  const id = msg.from.id;

  let user = db.prepare("SELECT * FROM users WHERE id=?").get(id);

  if (!user) {
    db.prepare(`
INSERT INTO users
(id,username,name,account,bank,card)
VALUES
(?,?,?,?,?,?)
`).run(
      id,
      msg.from.username || "",
      msg.from.first_name,
      randomAccount(),
      "الراجحي",
      "ماستر كارد"
    );

    bot.sendMessage(
      msg.chat.id,
      "🎉 تم إنشاء حسابك البنكي بنجاح."
    );
  } else {
    bot.sendMessage(
      msg.chat.id,
      "أهلاً بك مرة أخرى ❤️"
    );
  }
});

bot.onText(/حسابي/, (msg) => {

  const user = db.prepare(
    "SELECT * FROM users WHERE id=?"
  ).get(msg.from.id);

  if (!user) {
    bot.sendMessage(msg.chat.id, "أرسل /start أولاً");
    return;
  }

  bot.sendMessage(
    msg.chat.id,
`🏦 معلومات الحساب

• الاسم ↞ ${user.name}
• الحساب ↞ ${user.account}
• البنك ↞ ${user.bank}
• النوع ↞ ${user.card}
• الرصيد ↞ ${user.money} ريال 💸
• الزرف ↞ ${user.wallet} ريال 💵
• التصنيف ↞ ${user.rank} 🏅`
  );

});

console.log("Bot Started...");
bot.onText(/^\/?حول (.+) (\d+)$/, (msg, match) => {
  const account = match[1];
  const amount = Number(match[2]);

  transfer(bot, db, msg, amount, account);
});
