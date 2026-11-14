process.loadEnvFile();

const { APP_ID, BOT_TOKEN, GUILD_ID } = process.env;

const url = GUILD_ID
  ? `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
  : `https://discord.com/api/v10/applications/${APP_ID}/commands`;

const res = await fetch(url, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify([
    { name: 'nya', description: 'nya~', type: 1 },
    { name: 'дехаб', description: 'когда дехаб', type: 1},
    {
      name: 'выбери',
      description: 'не придумал',
      type: 1,
      options: [
        {
          name: 'ch1',
          description: 'ага',
          type: 3, // str
          required: true
        },
        {
          name: 'ch2',
          description: 'ага',
          type: 3, // str
          required: true
        },
        {
          name: 'ch3',
          description: 'ага',
          type: 3, // str
          required: false
        }
      ]
    },
    {
      name: 'ip',
      description: 'ачё',
      type: 1,
      options: [
        {
          name: 'ip',
          description: 'думай',
          type: 3,
          required: true
        }
      ]
    },
        {
      name: 'browser',
      description: 'скриншот страницы',
      type: 1,
      options: [
        {
          name: 'url',
          description: 'ссылка',
          type: 3,
          required: true
        }
      ]
    }
  ]),
});

console.log(res.status, await res.text());