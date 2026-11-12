export default {
  async fetch(request, env, ctx) {
    const data = {
      status: "ok",
      code: 0,
    };

    return Response.json(data);
  },
};