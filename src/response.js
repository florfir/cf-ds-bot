export function baseMessage(c, str) {
    return c.json({
        type: 4,
        data: { content: str },
    });
}