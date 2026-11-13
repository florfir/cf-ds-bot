import { verifyKey } from 'discord-interactions';
import { Hono } from 'hono';
import { baseMessage } from './response.js'

const app = new Hono();

app.get('/', (c) => c.json({ status: 'ok' }));

app.get('/204', () => new Response(null, { status: 204 }));

app.get('/robots.txt', (c) => c.text(`User-agent: *
Disallow: /`));

app.post('/interactions', async (c) => {
  const signature = c.req.header('X-Signature-Ed25519');
  const timestamp = c.req.header('X-Signature-Timestamp');
  const body = await c.req.text();

  // console.log('key:', c.env.DISCORD_PUBLIC_KEY ? 'set' : 'MISSING', 'sig:', !!signature);

  let valid = false;
  try {
    valid = await verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY);
  } catch (e) {
    console.log('verifyKey error:', e.message);
  }

  if (!valid) {
    return c.text('Bad request signature', 401);
  }

  const interaction = JSON.parse(body);

  if (interaction.type === 1) {
    return c.json({ type: 1 });
  }

  if (interaction.type === 2) {
    const userId = interaction.member?.user?.id ?? interaction.user?.id;

    switch (interaction.data.name) {
      case 'nya':
        return c.json({
          type: 4,
          data: { content: 'nya~' },
        });
      case 'дехаб':
        return c.json({
          type: 4,
          data: { content: Math.random() > 0.5 ? 'Завтра' : 'Сегодня!' },
        });
      case 'выбери':
        const arr = interaction.data.options
        const ch = (
          arr[Math.floor(Math.random() * arr.length)]?.value ?? ''
        ).slice(0, 20).replace(/@/g, '\\@');

        return c.json({
          type: 4,
          data: { content: `Выбираю...\n${ch}` },
        });
      case 'ip':
        if (userId != c.env.OWNER_ID) {
          return baseMessage(c, "Не дорос");
        }
        const ip = interaction.data.options[0];
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=17023488`);

        if(!response.ok) {
          return baseMessage(c, "У респонса статус не ок");
        }

        const text = await response.text();

        if(!text) {
          return baseMessage(c, "Пустое тело");
        }

        /*let parsed;

        try {
          parsed = JSON.parse(text)
        } catch {
          return baseMessage(c, "Жсон не парсится")
        }*/
       return baseMessage(c, `Ну значится, смотри\n\n\`\`\`json\n${text}\`\`\``);
    }
  }

  return new Response(null, { status: 404 });
});

export default app;