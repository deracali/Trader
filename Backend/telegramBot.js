import axios from 'axios';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('❌ TELEGRAM_BOT_TOKEN missing');

const bot = new TelegramBot(token, { polling: true });
const sessions = new Map();

bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  const rawText = msg.text?.trim() || '';
  const text = rawText.toLowerCase(); // lowercase for case-insensitive comparison
  const photo = msg.photo;

  // /help command
 if (text === '/help') {
   return bot.sendMessage(
     chatId,
     `📖 *Bot Commands & Shortcuts*\n\n` +
     `• /help — Show this help message\n` +
     `• restart — Start the trade process from the beginning\n` +
     `• rates — Show all available gift cards and their rates\n` +
     `• start over — Same as restart\n` +
     `• maybe restart — Same as restart\n\n` +
     `💡 Tip: Type the gift card name exactly as listed when prompted.`,
     { parse_mode: 'Markdown' }
   );
 }

   if (text === 'restart' || text === 'start over' || text === 'maybe restart') {
    sessions.delete(chatId);
    sessions.set(chatId, { step: 1, data: {} });
    return bot.sendMessage(chatId, '🔄 Restarting... 🛍️ What gift card are you trading?');
  }

  // NEW: Show all gift cards and rates if user types 'rates'
  if (text === 'rates') {
    try {
      const { data } = await axios.get('https://trader-pmqb.onrender.com/api/cards/get');
      if (!data.data || data.data.length === 0) {
        return bot.sendMessage(chatId, '⚠️ No gift cards found.');
      }

      // Build a message listing all cards + their rates
      let message = '📊 Available Gift Cards and Rates:\n\n';

      data.data.forEach(card => {
        message += `*${card.name}*\n`;  // you can add markdown formatting
        card.types.forEach(rate => {
          message += `- ${rate.country}: 1 ${rate.currency} = ₦${rate.rate}\n`;
        });
        message += '\n';
      });

      return bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error(error);
      return bot.sendMessage(chatId, '❌ Could not fetch rates right now. Please try again later.');
    }
  }


  if (!sessions.has(chatId)) {
    sessions.set(chatId, { step: 1, data: {} });

    try {
      const { data } = await axios.get('https://trader-pmqb.onrender.com/api/cards/get');
      if (data.data && data.data.length > 0) {
        // Extract card names
        const cardNames = data.data.map(card => card.name).join(', ');

        return bot.sendMessage(
          chatId,
          `🛍️ What gift card are you trading?\n\nAvailable: ${cardNames}`
        );
      } else {
        return bot.sendMessage(chatId, '⚠️ No gift cards available at the moment.');
      }
    } catch (error) {
      console.error(error);
      return bot.sendMessage(chatId, '❌ Could not fetch gift cards right now.');
    }
  }

  const session = sessions.get(chatId);

  switch (session.step) {
    case 1: // Card type
    session.data.type = text;
    session.step = 2;

    try {
      const { data } = await axios.get('https://trader-pmqb.onrender.com/api/cards/get');
      const card = data.data.find(c => c.name.toLowerCase() === session.data.type.toLowerCase());

      if (!card) {
        session.step = 1; // stay in step 1
        return bot.sendMessage(chatId, '❌ Card not found. Please type one from the list.');
      }

      // Save category in session for later
      session.data.category = card.category;

      // Show the card type (category) and prompt them
      let message = `📌 *${card.name}* card type: *${card.category}*\n\n`;

      // If you want to also list rate options:
      message += `Available options:\n`;
      card.types.forEach(rate => {
        message += `- ${rate.country} (${rate.currency})\n`;
      });

      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

      return bot.sendMessage(chatId, '💳 Which option do you want? (Type the currency exactly as shown above)');
    } catch (error) {
      console.error(error);
      session.step = 1;
      return bot.sendMessage(chatId, '❌ Could not fetch card info right now. Please try again.');
    }

    case 2: // Amount
      session.data.currency = text.toUpperCase();
      session.step = 3;
      return bot.sendMessage(chatId, '💰 Amount (number only):');

    case 3: { // Calculate NGN + prompt card number
      session.data.amount = Number(text);
      try {
        const { data } = await axios.get('https://trader-pmqb.onrender.com/api/cards/get');
        const card = data.data.find(c => c.name.toLowerCase() === session.data.type.toLowerCase());
        if (!card) return bot.sendMessage(chatId, '❌ Card not found.');
        const rateEntry = card.types.find(t => t.currency === session.data.currency);
        if (!rateEntry) return bot.sendMessage(chatId, '❌ No rate for that currency.');

        session.data.exchangeRate = rateEntry.rate;
        session.data.ngnAmount = session.data.amount * rateEntry.rate;

        await bot.sendMessage(
          chatId,
          `💱 1 ${session.data.currency} = ₦${rateEntry.rate}\n` +
          `💵 You get ≈ ₦${session.data.ngnAmount.toLocaleString()}`
        );
        session.step = 4;
        return bot.sendMessage(chatId, '🔢 Enter the card number:');
      } catch (e) {
        console.error(e);
        return bot.sendMessage(chatId, '❌ Could not fetch card rate.');
      }
    }

    case 4: // Card number
      session.data.cardNumber = text;
      session.step = 5;
      return bot.sendMessage(chatId, '🖼️ Send the card image as photo:');

    case 5: // Image
      if (!photo) return bot.sendMessage(chatId, '❗ Please send the image now.');
      try {
        const file = await bot.getFile(photo.pop().file_id);
        session.data.imageUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      } catch (e) {
        console.error(e);
      }
      session.step = 6;
      return bot.sendMessage(chatId, '📝 Add a description? (or type "skip")');

    case 6: // Description
      if (text.toLowerCase() !== 'skip') session.data.userDescription = text;
      session.step = 7;
      return bot.sendMessage(chatId, '📱 Please enter your phone number:');

    case 7: { // Phone number with retry logic
      const phoneRegex = /^[\d+\- ]{6,15}$/;
      if (!phoneRegex.test(text)) {
        await bot.sendMessage(chatId, '❗ Invalid phone number format. Please enter again:');
        // Do NOT advance step, keep waiting here for valid input
        return;
      }
      // Valid phone number, proceed
      session.data.phoneNumber = text;
      session.step = 8;
      return bot.sendMessage(chatId, '💳 Choose payment: USDT, or Bank Transfer');
    }

    case 8: { // Payment method with retry logic
      const choice = text.toLowerCase();
      if (choice === 'usdt' || choice === 'btc') {
        session.data.paymentMethod = choice.toUpperCase();
        session.step = 9;

        try {
          const { data: rates } = await axios.get('http://localhost:5000/api/crypto-rate/get');
          const rateObj = rates.find(r => r.symbol === session.data.paymentMethod);
          if (rateObj) {
            session.data.cryptoPayout = session.data.ngnAmount / rateObj.rateInNGN;
            await bot.sendMessage(
              chatId,
              `💸 ₦${session.data.ngnAmount.toLocaleString()} ≈ ${session.data.cryptoPayout.toFixed(8)} ${rateObj.symbol}`
            );
          }
        } catch (e) {
          console.error(e);
          await bot.sendMessage(chatId, '⚠️ Could not fetch crypto rate.');
        }
        return bot.sendMessage(chatId, `📩 Enter your ${session.data.paymentMethod} wallet address:`);
      }
      if (choice === 'bank transfer' || choice === 'bank') {
        session.data.paymentMethod = 'BANK';
        session.step = 10;
        return bot.sendMessage(chatId, '🏦 Enter your bank name:');
      }
      await bot.sendMessage(chatId, '❗ Invalid. Type USDT, BTC or Bank');
      // Keep waiting here until valid input
      return;
    }

    case 9: { // Submit without wallet address format validation
      session.data.walletAddress = text;
      try {
        const payload = {
          ...session.data,
          status: 'pending',
          cryptoPayout: session.data.cryptoPayout
        };
        await axios.post('http://localhost:5000/api/gift-cards/create', payload);
       const payoutMessage = (session.data.cryptoPayout !== undefined)
  ? `\nYou’ll receive ${session.data.cryptoPayout.toFixed(8)} ${session.data.paymentMethod}`
  : '';

await bot.sendMessage(chatId, `✅ Submitted!${payoutMessage}`);

      } catch (e) {
        console.error(e);
        await bot.sendMessage(chatId, '❌ Submission failed.');
      }
      sessions.delete(chatId);
      break;
    }

    // BANK FLOW
    case 10:
      session.data.bankName = text;
      session.step = 11;
      return bot.sendMessage(chatId, '🏛️ Enter your account number:');

    case 11:
      session.data.accountNumber = text;
      session.step = 12;
      return bot.sendMessage(chatId, '👤 Enter your account name:');

    case 12:
      session.data.accountName = text;
      try {
        const payload = { ...session.data, status: 'pending' };
        await axios.post('http://localhost:5000/api/gift-cards/create', payload);
        await bot.sendMessage(chatId, '✅ Submitted for review!');
      } catch (e) {
        console.error(e);
        await bot.sendMessage(chatId, '❌ Submission failed.');
      }
      sessions.delete(chatId);
      break;

    default:
      return bot.sendMessage(chatId, '❓ Type anything to restart');
  }
});

export default bot;
