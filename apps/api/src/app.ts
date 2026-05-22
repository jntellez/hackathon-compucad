import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { modulesRouter } from './modules';
import { errorHandler } from './shared/errors/error-handler';
import { API_PREFIX } from './shared/http';

export const app = express();

app.use(
  cors({
    origin: env.WEB_ORIGIN
  })
);
app.use(express.json());

app.use(API_PREFIX, modulesRouter);

app.use(errorHandler);
