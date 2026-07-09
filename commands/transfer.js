module.exports = (bot, db, msg, amount, account) => {
  const sender = db.prepare("SELECT * FROM users WHERE id=?").get(msg.from.id);

  if (!user) {
  return bot.sendMessage(msg.chat.id, "❌ الحساب غير موجود");
}

  if (!amount || isNaN(amount) || amount <= 0) {
    return bot.sendMessage(msg.chat.id, "❌ اكتب مبلغ صحيح");
  }

  const receiver = db.prepare("SELECT * FROM users WHERE account=?").get(account);

  if (!receiver) {
    return bot.sendMessage(msg.chat.id, "❌ الحساب غير موجود");
  }

  if (sender.money < amount) {
    return bot.sendMessage(msg.chat.id, "❌ رصيدك لا يكفي");
  }

  db.prepare("UPDATE users SET money=? WHERE id=?")
    .run(sender.money - amount, sender.id);

  db.prepare("UPDATE users SET money=? WHERE id=?")
    .run(receiver.money + Number(amount), receiver.id);

  bot.sendMessage(
    receiver.id,
    `💸 تم استلام حوالة جديدة

👤 المرسل: ${sender.name}
💰 المبلغ: ${amount} ريال
💳 رصيدك الجديد: ${receiver.money + Number(amount)} ريال

🏦 شكراً لاستخدام بنك Rez`
  );

  bot.sendMessage(
    msg.chat.id,
    `✅ تم تحويل ${amount} ريال إلى الحساب ${account}`
  );
};
