module.exports = {
  apps: [
    {
      name: 'guess-weight',
      script: 'npx',
      args: 'tsx server/index.ts',
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
