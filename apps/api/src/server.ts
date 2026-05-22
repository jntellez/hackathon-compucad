import { app } from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`API server listening on port ${env.PORT}`);
});
