import { useMemo } from 'react';

import { useAgentChat } from '../hooks/useAgentChat';

type AgentChatProps = {
  collaboratorId: number | null;
  collaboratorName?: string;
  onAgentSuccess?: () => Promise<void> | void;
};

export function AgentChat({ collaboratorId, collaboratorName, onAgentSuccess }: AgentChatProps) {
  const { messages, input, setInput, loading, error, canSend, sendMessage, clearChat } = useAgentChat({
    collaboratorId,
    onAgentSuccess
  });

  const subtitle = useMemo(() => {
    if (!collaboratorId) return 'Select a collaborator to start chatting';
    return collaboratorName ? `Chatting as ${collaboratorName}` : `Chatting with collaborator #${collaboratorId}`;
  }, [collaboratorId, collaboratorName]);

  return (
    <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium text-white">AI Agent Chat</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={clearChat}
          disabled={messages.length === 0 || loading}
          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {error && <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-200">{error}</p>}

      <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-slate-800 bg-slate-950 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Send a message to ask for enrollments, history, recommendations, or actions.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">{message.role === 'user' ? 'You' : 'Agent'}</p>
              <p className="rounded-md bg-slate-900 p-2 text-sm text-slate-100">{message.text}</p>
              {message.role === 'agent' && (message.intent || message.action || message.usage) ? (
                <p className="text-xs text-slate-500">
                  {message.intent ? `intent: ${message.intent}` : ''}
                  {message.intent && message.action ? ' · ' : ''}
                  {message.action ? `action: ${message.action}` : ''}
                  {message.usage ? ` · tokens: ${message.usage.totalTokens}` : ''}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage();
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask the training agent..."
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400 transition focus:ring-1"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
}
