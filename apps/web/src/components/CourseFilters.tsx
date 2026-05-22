import { LEVELS, type CourseFilters as CourseFiltersState } from '../types';

type CourseFiltersProps = {
  filters: CourseFiltersState;
  categories: string[];
  modalities: string[];
  onUpdate: <K extends keyof CourseFiltersState>(key: K, value: CourseFiltersState[K]) => void;
  onClear: () => void;
};

export function CourseFilters({ filters, categories, modalities, onUpdate, onClear }: CourseFiltersProps) {
  const selectClass = 'rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none';
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mb-3 space-y-2">
      <input
        type="text"
        placeholder="Search by name, category, provider, modality..."
        value={filters.search}
        onChange={(event) => onUpdate('search', event.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
      />
      <div className="flex flex-wrap gap-2">
        <select value={filters.category} onChange={(event) => onUpdate('category', event.target.value)} className={selectClass}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select value={filters.level} onChange={(event) => onUpdate('level', event.target.value)} className={selectClass}>
          <option value="">All levels</option>
          {LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        <select value={filters.modality} onChange={(event) => onUpdate('modality', event.target.value)} className={selectClass}>
          <option value="">All modalities</option>
          {modalities.map((modality) => (
            <option key={modality} value={modality}>{modality}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
