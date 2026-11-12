import { verifyKey } from 'discord-interactions';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c)=>{
  return c.json({
    status: 'ok'
  })
});

app.get('/204', (c)=>{
  return new Response(null, { status: 204 });
});

app.post('/interactions', async (c) => {
  const signature = c.req.header('X-Signature-Ed25519');
  const timestamp = c.req.header('X-Signature-Timestamp');
  const body = await c.req.text();

  const valid = await verifyKey(
    body,
    signature,
    timestamp,
    c.env.DISCORD_PUBLIC_KEY
  );

  if (!valid) {
    return c.json({message: "Bad sign"}, 401);
  }

  const interaction = JSON.parse(body);

  // ping
  if (interaction.type === 1) {
    return c.json({ type: 1 });
  }

  // commands
  if (interaction.type === 2) {
    switch (interaction.data.name) {
      case 'nya':
        return c.json({
          type: 4,
          data: {
            content: 'nya~',
          },
        });
    }
  }

  return new Response(null, { status: 204 });
});

export default app;