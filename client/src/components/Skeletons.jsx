export function CourseCardSkeleton() {
  return (
    <article className="course-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-thumb" />
      <div className="course-card-body">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line tiny" />
      </div>
    </article>
  );
}

export function CourseGridSkeleton({ count = 8 }) {
  return (
    <section className="course-grid" aria-busy="true" aria-label="Loading courses">
      {Array.from({ length: count }, (_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </section>
  );
}

export function LessonListSkeleton() {
  return (
    <div className="lesson-layout" aria-busy="true" aria-label="Loading lessons">
      <aside className="lesson-sidebar">
        <div className="skeleton skeleton-line short" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="skeleton skeleton-line" />
        ))}
      </aside>
      <section className="lesson-player">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-player" />
      </section>
    </div>
  );
}

export function LessonItemsSkeleton({ count = 6 }) {
  return (
    <ul className="lesson-list" aria-busy="true" aria-label="Loading lessons">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <div className="skeleton skeleton-line" />
        </li>
      ))}
    </ul>
  );
}

export function QuizSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading quiz">
      <div className="skeleton skeleton-line short" />
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="quiz-question">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-line tiny" />
        </div>
      ))}
    </div>
  );
}

export function LearningListSkeleton({ count = 3 }) {
  return (
    <section className="learning-list" aria-busy="true" aria-label="Loading courses">
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="learning-card skeleton-card">
          <div className="skeleton learning-thumb" />
          <div className="learning-body">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
          </div>
        </article>
      ))}
    </section>
  );
}
