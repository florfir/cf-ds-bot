import { verifyKey } from 'discord-interactions';
import { Hono } from 'hono';

const app = new Hono();

app.get('/204', (c)=>{
  return new Response(null, { status: 204 });
});

export default app;