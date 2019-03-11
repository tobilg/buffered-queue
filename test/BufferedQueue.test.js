const requireModule = () => require('../lib/BufferedQueue');

describe('BufferedQueue', () => {

    describe('construction', () => {
        test('it should require the module without errors', () => {
            expect(requireModule).not.toThrow();
        });

        test('it expose a function', () => {
            const BufferedQueue = requireModule();

            expect(BufferedQueue).toEqual(expect.any(Function));
        });
    });

    describe('use cases', () => {
        test('Flush when buffer is full', done => {
            const Queue = requireModule();

            const size = 5;
            const flushTimeout = Infinity;

            const q = new Queue('example', {
                size,
                flushTimeout,
                verbose: false
            });

            const n_of_exceeding_items = 2; //random

            const items = Array
              .from({ length: size + n_of_exceeding_items})
              .map((_, i) => i);
            const expected = items.slice(0, size);

            q.on("flush", (data, name) => {
                expect(data).toEqual(expected);
                done()
            });

            items.forEach(item => q.add(item));

        });

        test('Flush when timeout expires', done => {
            const Queue = requireModule();

            const size = 9999999;
            const flushTimeout = 500;

            const q = new Queue('example', {
                size,
                flushTimeout,
                verbose: false
            });

            const items = [];

            q.on("flush", (data, name) => {
                clearInterval(tid);
                const expected = items;
                expect(data).toEqual(expected);
                done()
            });

            const pushEvery = flushTimeout / 2;
            const tid = setInterval(() => {
                items.push(`item-${Date.now()}`);
            }, pushEvery);

        });


    });

});
