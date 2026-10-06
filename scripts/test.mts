process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

process.on('unhandledRejection', (err) => {
  throw err;
});

const {run} = await import('jest');

await run(process.argv.slice(2));
