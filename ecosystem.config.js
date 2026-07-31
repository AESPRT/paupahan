module.exports = {
    apps: [
        {
            name: 'paupahan-worker',
            script: 'node_modules/tsx/dist/cli.mjs',
            args: '-r tsconfig-paths/register src/workers/run.ts',
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                REDIS_HOST: '127.0.0.1',
                REDIS_PORT: 6379,
            },
        },
    ],
};