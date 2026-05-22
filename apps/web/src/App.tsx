import { AlertMessage } from './components/AlertMessage';
import { CollaboratorSelector } from './components/CollaboratorSelector';
import { CollaboratorSummary } from './components/CollaboratorSummary';
import { CompletedHistory } from './components/CompletedHistory';
import { CourseFilters } from './components/CourseFilters';
import { CourseList } from './components/CourseList';
import { Layout } from './components/Layout';
import { RecommendationsList } from './components/RecommendationsList';
import { ActiveEnrollments } from './components/ActiveEnrollments';
import { AgentChat } from './components/AgentChat';
import { useTrainingDemo } from './hooks/useTrainingDemo';

export default function App() {
  const {
    collaborators,
    selectedId,
    setSelectedId,
    selectedCollaborator,
    message,
    filteredCourses,
    categories,
    modalities,
    filters,
    updateFilter,
    clearFilters,
    activeEnrollments,
    completedEnrollments,
    recommendations,
    alreadyEnrolledCourseIds,
    loading,
    handleAgentSuccess,
    handleEnroll,
    handleCancel,
    handleComplete
  } = useTrainingDemo();

  return (
    <Layout>
      <header className="space-y-2">
        <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
          Demo
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Compucad Training Platform</h1>
        <p className="text-sm text-slate-400">Select a collaborator to manage their course enrollments</p>
      </header>

      <AlertMessage message={message} />

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <CollaboratorSelector
          collaborators={collaborators}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <CollaboratorSummary collaborator={selectedCollaborator} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="flex flex-col">
          <h2 className="mb-3 text-lg font-medium text-white">Available Courses</h2>

          <CourseFilters
            filters={filters}
            categories={categories}
            modalities={modalities}
            onUpdate={updateFilter}
            onClear={clearFilters}
          />

          <CourseList
            courses={filteredCourses}
            selectedCollaborator={!!selectedCollaborator}
            enrolledCourseIds={alreadyEnrolledCourseIds}
            loading={loading}
            onEnroll={handleEnroll}
          />
        </section>

        <section className="space-y-4">
          <AgentChat
            collaboratorId={selectedId}
            collaboratorName={selectedCollaborator?.name}
            onAgentSuccess={handleAgentSuccess}
          />

          <RecommendationsList
            recommendations={recommendations}
            hasSelection={!!selectedCollaborator}
            enrolledCourseIds={alreadyEnrolledCourseIds}
            loading={loading}
            onEnroll={handleEnroll}
          />

          <ActiveEnrollments
            enrollments={activeEnrollments}
            hasSelection={!!selectedCollaborator}
            loading={loading}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />

          <CompletedHistory
            enrollments={completedEnrollments}
            hasSelection={!!selectedCollaborator}
          />
        </section>
      </div>
    </Layout>
  );
}
