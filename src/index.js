import { verifyKey } from 'discord-interactions';
import { Hono } from 'hono';
import { baseMessage, hiddenMessage } from './response.js'

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

    console.log(`Словил новый интеракшен ${interaction.data.name}`)

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
      case 'browser':
        if (userId != c.env.OWNER_ID) {
          return baseMessage(c, "Не дорос");
        }

        const target = interaction.data.options?.[0]?.value;
        try {
          new URL(target);
        } catch {
          return hiddenMessage(c, "Это не ссылка");
        }

        const hook = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;

        c.executionCtx.waitUntil((async () => {
          try {
            const res = await c.env.BROWSER.quickAction('screenshot', { url: target });
            if (!res.ok) throw new Error(`browser run вернул ${res.status}`);

            const form = new FormData();
            form.append('payload_json', JSON.stringify({
              attachments: [{ id: 0, filename: 'screenshot.png' }],
            }));
            form.append(
              'files[0]',
              new Blob([await res.arrayBuffer()], { type: 'image/png' }),
              'screenshot.png',
            );

            await fetch(hook, { method: 'PATCH', body: form });
          } catch (e) {
            await fetch(hook, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: `Упало: ${e.message}` }),
            });
          }
        })());

        return c.json({ type: 5 });
      case 'ip':
        if (userId != c.env.OWNER_ID) {
          return baseMessage(c, "Не дорос");
        }
        const ip = interaction.data.options[0].value;
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=21221145&lang=ru`);

        if (!response.ok) {
          return baseMessage(c, "У респонса статус не ок");
        }

        const text = await response.text();

        if (!text) {
          return baseMessage(c, "Пустое тело");
        }

        /*let parsed;

        try {
          parsed = JSON.parse(text)
        } catch {
          return baseMessage(c, "Жсон не парсится")
        }*/
        return baseMessage(c, `Ну значится, смотри\n\`\`\`json\n${text}\n\`\`\``);
      default:
        return baseMessage(c, "Команда не найдена.")
    }
  }

  return new Response(null, { status: 404 });
});

export default app;