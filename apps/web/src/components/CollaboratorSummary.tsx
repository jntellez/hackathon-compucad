import type { Collaborator } from '../types';

type CollaboratorSummaryProps = {
  collaborator: Collaborator | null;
};

export function CollaboratorSummary({ collaborator }: CollaboratorSummaryProps) {
  if (!collaborator) return null;

  return (
    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
      <span className="text-slate-400">
        Score: <span className="text-slate-100">{collaborator.score}</span>
      </span>
      <span className="text-slate-400">
        Level: <span className="text-slate-100">{collaborator.position.level}</span>
      </span>
      <span className="text-slate-400">
        Status: <span className="text-slate-100">{collaborator.status}</span>
      </span>
    </div>
  );
}
