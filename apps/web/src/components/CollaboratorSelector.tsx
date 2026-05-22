import type { Collaborator } from '../types';

type CollaboratorSelectorProps = {
  collaborators: Collaborator[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
};

export function CollaboratorSelector({ collaborators, selectedId, onSelect }: CollaboratorSelectorProps) {
  return (
    <>
      <label htmlFor="collaborator-select" className="mb-2 block text-sm font-medium text-slate-300">
        Collaborator
      </label>
      <select
        id="collaborator-select"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
        value={selectedId ?? ''}
        onChange={(event) => onSelect(event.target.value ? Number(event.target.value) : null)}
      >
        <option value="">-- Select a collaborator --</option>
        {collaborators.map((collaborator) => (
          <option key={collaborator.id} value={collaborator.id}>
            {collaborator.name} ({collaborator.position.name} - {collaborator.area.name})
          </option>
        ))}
      </select>
    </>
  );
}
