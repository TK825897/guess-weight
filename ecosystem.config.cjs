module.exports = {
  apps: [
    {
      name: 'guess-weight',
      script: './node_modules/.bin/tsx',
      args: 'server/index.ts',
      cwd: '/home/guess-weight',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '256M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
    },
  ],
};
