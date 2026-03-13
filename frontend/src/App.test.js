// Bun smoke test: verify the main app module loads without runtime import errors.
test('app module loads', async () => {
    globalThis.window = {
        location: {
            hostname: 'localhost'
        }
    };

    globalThis.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
    };

    const appModule = await import('./App.jsx');
    expect(typeof appModule.default).toBe('function');
});
