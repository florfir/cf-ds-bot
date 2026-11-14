export function baseMessage(c, str) {
    return c.json({
        type: 4,
        data: { content: str },
    });
}

export function hiddenMessage(c, str) {
    return c.json({
        type: 4,
        data: {
            content: str,
            flags: 64,
        },
    });
}