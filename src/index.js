import { verifyKey } from 'discord-interactions';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.json({ status: 'ok' }));

app.get('/204', () => new Response(null, { status: 204 }));

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
    }
  }

  return new Response(null, { status: 204 });
});

export default app;