const BOT_TOKEN = "8522851670:AAHH9UfKSTFf5H8BaMCniBo3jCaDZ_U6rsU";
const CHAT_IDS = ["5387795208", "1158150944"];

export async function sendLoginToTelegram({ firstName, lastName, phone }) {
  const text = `
🟢 <b>YANGI FOYDALANUVCHI KIRDI</b> 🟢

👤 <b>Ism:</b> ${firstName}
👤 <b>Familiya:</b> ${lastName}
📱 <b>Telefon:</b> ${phone}
⏳ <b>Holat:</b> Imtihonni boshladi!
`.trim();

  try {
    await Promise.allSettled(
      CHAT_IDS.map((chatId) =>
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
          }),
        })
      )
    );
  } catch (error) {
    console.error("Telegram send error:", error);
  }
}

export async function sendResultToTelegram({ firstName, lastName, phone, correct, wrong, total, duration }) {
  const percentage = Math.round((correct / total) * 100);
  const stars = percentage >= 90 ? "🏆" : percentage >= 70 ? "🥇" : percentage >= 50 ? "🥈" : "🥉";
  
  const text = `
${stars} <b>YANGI NATIJA</b> ${stars}

👤 <b>Ism:</b> ${firstName}
👤 <b>Familiya:</b> ${lastName}
📱 <b>Telefon:</b> ${phone}

📊 <b>NATIJALAR:</b>
✅ <b>To'g'ri javoblar:</b> ${correct} ta
❌ <b>Noto'g'ri javoblar:</b> ${wrong} ta
📝 <b>Jami savollar:</b> ${total} ta
📈 <b>Foiz:</b> ${percentage}%
⏱ <b>Sarflangan vaqt:</b> ${duration}

${percentage >= 70 ? "✨ <b>Natija: A'lo!</b>" : percentage >= 50 ? "👍 <b>Natija: Yaxshi</b>" : "📚 <b>Natija: Ko'proq mashq kerak</b>"}
`.trim();

  try {
    const results = await Promise.allSettled(
      CHAT_IDS.map((chatId) =>
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
          }),
        })
      )
    );
    return results;
  } catch (error) {
    console.error("Telegram send error:", error);
    return [];
  }
}
