import { Router } from 'express';

import { postAgentMessage } from './agent.controller';

export const agentRouter = Router();

agentRouter.post('/agent/message', postAgentMessage);
