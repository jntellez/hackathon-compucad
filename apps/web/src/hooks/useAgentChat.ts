import { useCallback, useEffect, useMemo, useState } from 'react';

import { sendAgentMessage } from '../api';
import type { AgentChatMessage } from '../types';

type UseAgentChatOptions = {
  collaboratorId: number | null;
  onAgentSuccess?: () => Promise<void> | void;
};

export function useAgentChat({ collaboratorId, onAgentSuccess }: UseAgentChatOptions) {
  const loadingMessageId = 'loading-message';
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => {
    return !!collaboratorId && input.trim().length > 0 && !loading;
  }, [collaboratorId, input, loading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setError(null);
  }, []);

  useEffect(() => {
    clearChat();
  }, [collaboratorId, clearChat]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!collaboratorId || !content || loading) return;

    const userMessage: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: content
    };

    const loadingMessage: AgentChatMessage = {
      id: loadingMessageId,
      role: 'agent',
      text: 'El agente está analizando tu solicitud...'
    };

    setMessages((current) => [...current, userMessage, loadingMessage]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await sendAgentMessage(collaboratorId, content);
      const data = response.data;

      const agentMessage: AgentChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: data.message,
        intent: data.intent,
        action: data.action,
        usage: data.usage
      };

      setMessages((current) => {
        const messagesWithoutLoading = current.filter((message) => message.id !== loadingMessageId);
        return [...messagesWithoutLoading, agentMessage];
      });
      await onAgentSuccess?.();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No pude enviar tu mensaje al agente.';
      setMessages((current) => current.filter((chatMessage) => chatMessage.id !== loadingMessageId));
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [collaboratorId, input, loading, onAgentSuccess]);

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    canSend,
    sendMessage,
    clearChat
  };
}
