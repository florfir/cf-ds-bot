export function baseMessage(c, str) {
    c.json({
        type: 4,
        data: { content: str },
    });
}