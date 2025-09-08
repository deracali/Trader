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




  // Handle /start command
  if (text === '/start') {
    // New session for the user
    sessions.set(chatId, { step: 0, data: {} });

    const welcomeMessage =
  `👋 Welcome to Gift Card Trader Bot!\n\n` +
  `💡 This bot helps you trade gift cards and get crypto or bank payouts.\n\n` +
  `📌 To start trading, type *trade*.\n` +
  `💱 To check gift card rates, type *rates*.\n` +
  `ℹ️ You can also type *help* to see all commands.`;

    return bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  }



  // /help command
 if (text === 'help') {
   return bot.sendMessage(
     chatId,
     `📖 *Bot Commands & Shortcuts*\n\n` +
     `• /help — Show this help message\n` +
     `• trade — Start the trade process from the beginning\n` +
     `• rates — Show all available gift cards and their rates\n` +
     `• start over — Same as restart\n` +
     `💡 Tip: Type the gift card name exactly as listed when prompted.`,
     { parse_mode: 'Markdown' }
   );
 }

 if (text === 'trade' || text === 'start over' || text === 'maybe restart') {
   sessions.delete(chatId);
   sessions.set(chatId, { step: 1, data: {} });

   try {
     const { data } = await axios.get('https://trader-sr5j.onrender.com/api/cards/get');

     if (data.data && data.data.length > 0) {
       const cardNames = data.data.map(card => card.name).join(', ');

       await bot.sendMessage(
         chatId,
         `🔄 Starting Trade....\n\n🛍️ What gift card are you trading?\n\nAvailable: ${cardNames}`
       );
     } else {
       await bot.sendMessage(chatId, '⚠️ No gift cards available at the moment.');
     }
   } catch (error) {
     console.error(error);
     await bot.sendMessage(chatId, '❌ Could not fetch gift cards right now.');
   }

   return; // ⬅ stops further execution so it won’t hit the next block
 }


  // NEW: Show all gift cards and rates if user types 'rates'
  if (text === 'rates') {
    try {
      const { data } = await axios.get('https://trader-sr5j.onrender.com/api/cards/get');
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


  // if (!sessions.has(chatId)) {
  //   sessions.set(chatId, { step: 1, data: {} });
  //
  //   try {
  //     const { data } = await axios.get('https://trader-sr5j.onrender.com/api/cards/get');
  //
  //     if (data.data && data.data.length > 0) {
  //       const cardNames = data.data.map(card => card.name).join(', ');
  //       await bot.sendMessage(
  //         chatId,
  //         `🛍️ What gift card are you trading?\n\nAvailable: ${cardNames}`
  //       );
  //     } else {
  //       await bot.sendMessage(chatId, '⚠️ No gift cards available at the moment.');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     await bot.sendMessage(chatId, '❌ Could not fetch gift cards right now.');
  //   }
  //
  //   // Exit completely so no other logic runs
  //   return;
  // }

  const session = sessions.get(chatId);

  switch (session.step) {
    // CASE 1 — choose card type (ensure we do not advance on invalid input)
    case 1: {
    // If we previously showed a numbered list, allow numeric replies to pick one
    if (session.data.listingCards && /^\d+$/.test(rawText)) {
      const idx = Number(rawText) - 1;
      const cards = session.data.listingCards;
      const chosen = cards[idx];
      if (!chosen) {
        return bot.sendMessage(
          chatId,
          `❗ Invalid selection. Reply with a number between 1 and ${cards.length}, or type the card name exactly.`
        );
      }

      // accept chosen card and proceed
      session.data.card = chosen;
      session.data.type = chosen.name;
      session.data.category = chosen.category;
      session.data.listingCards = undefined; // clear listing cache

      let message = `📌 *${chosen.name}* card type: *${chosen.category}*\n\nAvailable options:\n`;
      chosen.types.forEach(rate => { message += `${rate.currency}\n`; });

      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      session.step = 2;
      return bot.sendMessage(chatId, '💳 Which option do you want? (Type the card type exactly as shown above)');
    }

    // Normal flow: try to find the card by name
    try {
      const { data } = await axios.get('https://trader-sr5j.onrender.com/api/cards/get');
      const cards = data.data || [];
      if (!cards.length) {
        return bot.sendMessage(chatId, '⚠️ No gift cards available at the moment.');
      }

      const card = cards.find(c => c.name.toLowerCase() === text.toLowerCase());
      if (card) {
        // exact match -> proceed
        session.data.card = card;
        session.data.type = card.name;
        session.data.category = card.category;

        let message = `📌 *${card.name}* card type: *${card.category}*\n\nAvailable options:\n`;
        card.types.forEach(rate => { message += `${rate.currency}\n`; });

        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        session.step = 2;
        return bot.sendMessage(chatId, '💳 Which option do you want? (Type the card type exactly as shown above)');
      }

      // No exact match -> show numbered list and let user pick
      // (show all or limit to first N; here we show up to 20 to avoid extremely long lists)
      const maxShow = 20;
      const toShow = cards.slice(0, maxShow);
      const listText = toShow.map((c, i) => `${i + 1}. ${c.name}`).join('\n');

      // cache the list so numeric replies work
      session.data.listingCards = toShow;

      let reply = `❌ Card not found. Please either type the card name, or reply with the number (1-${toShow.length}) to choose:\n\n${listText}`;
      if (cards.length > maxShow) reply += `\n\n...and ${cards.length - maxShow} more. Type the full name if you don't see it above.`;

      return bot.sendMessage(chatId, reply);
    } catch (error) {
      console.error(error);
      return bot.sendMessage(chatId, '❌ Could not fetch card info right now. Please try again.');
    }
  }

  // CASE 2 — choose currency option (validate and do NOT advance until valid)
  // CASE 2 — choose currency option (supports numbers or text; won't advance on invalid input)
  case 2: {
    // If user replies with a number and we already showed options
    if (session.data.listingOptions && /^\d+$/.test(rawText)) {
      const idx = Number(rawText) - 1;
      const opts = session.data.listingOptions;
      const chosen = opts[idx];
      if (!chosen) {
        return bot.sendMessage(
          chatId,
          `❗ Invalid selection. Reply with a number between 1 and ${opts.length}, or type the currency code.`
        );
      }

      // valid choice
      session.data.currency = chosen.currency.toUpperCase();
      session.data.exchangeRate = chosen.rate;
      session.data.listingOptions = undefined;
      session.step = 3;
      return bot.sendMessage(chatId, '💰 Amount (number only):');
    }

    // Otherwise user typed text
    const chosenCurrency = text.trim().toUpperCase();

    // Make sure we already know the card
    let card = session.data.card;
    if (!card) {
      return bot.sendMessage(chatId, '⚠️ Please pick a card first.');
    }

    // Build options if not cached
    if (!session.data.listingOptions) {
      session.data.listingOptions = card.types.map(t => ({
        currency: t.currency.toUpperCase(),
        rate: t.rate,
      }));
    }

    // Check if user typed a valid option (case-insensitive)
    const match = session.data.listingOptions.find(
      opt => opt.currency.toUpperCase() === chosenCurrency
    );

    if (match) {
      // valid -> advance
      session.data.currency = match.currency;
      session.data.exchangeRate = match.rate;
      session.data.listingOptions = undefined;
      session.step = 3;
      return bot.sendMessage(chatId, '💰 Amount (number only):');
    }

    // Invalid -> re-show available options, don't advance
    const listText = session.data.listingOptions
      .map((o, i) => `${i + 1}. ${o.currency} — ₦${o.rate}`)
      .join('\n');

    return bot.sendMessage(
      chatId,
      `❗ Please type one of the valid currency options or reply with the number:\n\n${listText}`
    );
  }

// CASE 3 — amount (validate numeric and positive; do NOT advance until valid)
case 3: {
  const amountValue = Number(text.trim());
  if (Number.isNaN(amountValue) || amountValue <= 0) {
    // keep them at step 3
    return bot.sendMessage(chatId, '❗ Invalid amount. Please enter a number greater than 0 (e.g., 50):');
  }

  session.data.amount = amountValue;

  try {
    // Prefer the card stored in session
    let card = session.data.card;
    if (!card) {
      const { data } = await axios.get('https://trader-sr5j.onrender.com/api/cards/get');
      card = data.data.find(c => c.name.toLowerCase() === session.data.type.toLowerCase());
      if (card) session.data.card = card;
    }

    if (!card) {
      session.step = 1;
      return bot.sendMessage(chatId, '❌ Card not found. Please type the card name again.');
    }

    const rateEntry = card.types.find(t => t.currency.toUpperCase() === session.data.currency);
    if (!rateEntry) {
      session.step = 2;
      const available = card.types.map(t => t.currency).join(', ');
      return bot.sendMessage(chatId, `⚠️ Rate for ${session.data.currency} not available. Please choose one of: ${available}`);
    }

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
    return bot.sendMessage(chatId, '❌ Could not fetch card rate. Please try again or type start over to start the trade over.');
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
        // Fetch latest crypto rates
        const { data: rates } = await axios.get('https://trader-sr5j.onrender.com/api/crypto-rate/get');
        const rateObj = rates.find(r => r.symbol.toLowerCase() === session.data.paymentMethod.toLowerCase());

        if (!rateObj) {
          return bot.sendMessage(chatId, `⚠️ Rate for ${session.data.paymentMethod} not available.`);
        }

        // Calculate payout
        session.data.cryptoPayout = session.data.ngnAmount / rateObj.rateInNGN;

        // Display results
        await bot.sendMessage(
          chatId,
          `💱 ₦${session.data.ngnAmount.toLocaleString()} ≈ ${session.data.cryptoPayout.toFixed(8)} ${rateObj.symbol}`
        );
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

    await bot.sendMessage(chatId, '❗ Invalid. Type USDT, BTC, or Bank');
    return;
  }

  case 9: { // Submit without wallet address format validation
  session.data.walletAddress = text;

  // 🔄 Recalculate payout if crypto method and not already set
  if ((session.data.paymentMethod === 'USDT' || session.data.paymentMethod === 'BTC') && session.data.cryptoPayout === undefined) {
    try {
      const { data: rates } = await axios.get('https://trader-sr5j.onrender.com/api/crypto-rate/get');
      const rateObj = rates.find(r => r.symbol.toLowerCase() === session.data.paymentMethod.toLowerCase());

      if (rateObj) {
        session.data.cryptoPayout = session.data.ngnAmount / rateObj.rateInNGN;
      }
    } catch (e) {
      console.error('⚠️ Failed to recalc payout in case 9:', e);
    }
  }

  try {
    const payload = {
      ...session.data,
      status: 'pending',
      cryptoPayout: session.data.cryptoPayout
    };

    await axios.post('https://trader-sr5j.onrender.com/api/gift-cards/create', payload);

    const payoutMessage = (session.data.cryptoPayout !== undefined)
      ? `\nYou’ll receive ${session.data.cryptoPayout.toFixed(8)} ${session.data.paymentMethod}`
      : '';

    await bot.sendMessage(chatId, `✅ Submitted for review!\n\n💳 Payment: up to 8 minutes\n💰 Crypto: up to 15 minutes !${payoutMessage}`);

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
        await axios.post('https://trader-sr5j.onrender.com/api/gift-cards/create', payload);
        await bot.sendMessage(
  chatId,
  '✅ Submitted for review!\n\n💳 Payment: up to 8 minutes\n💰 Crypto: up to 15 minutes'
);

      } catch (e) {
        console.error(e);
        await bot.sendMessage(chatId, '❌ Submission failed.');
      }
      sessions.delete(chatId);
      break;

    default:
      return bot.sendMessage(chatId, '❓ Sorry, I did not understand that. Type "trade" to start over or "help" for commands.');
  }
});

export default bot;
