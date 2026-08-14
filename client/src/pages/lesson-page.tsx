import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, Play } from 'lucide-react';
import Button from '../components/ui/button';
import Card from '../components/ui/card';
import Heading from '../components/ui/heading';
import Text from '../components/ui/text';
import api from '../lib/api';
import { cn } from '../lib/cn';

type Lesson = {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number;
  resources?: Array<{ name: string; fileUrl: string }>;
};

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<{
    title: string;
    lessons?: Lesson[];
    enrolledStudents?: unknown[];
    instructor?: { _id?: string };
  } | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: courseData }, { data: progress }] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/progress/${courseId}`),
      ]);
      setCourse(courseData);
      setCompleted((progress.completedLessons || []).map((id: string) => String(id)));
    };
    void load();
  }, [courseId]);

  const lessons = useMemo(() => [...(course?.lessons || [])], [course]);
  const selected = lessons.find((lesson) => lesson._id === lessonId) || lessons[0];

  useEffect(() => {
    if (!lessonId && selected) {
      navigate(`/courses/${courseId}/learn/${selected._id}`, { replace: true });
    }
  }, [lessonId, selected, courseId, navigate]);

  const markComplete = async () => {
    if (!selected) return;
    await api.post(`/progress/${courseId}/lessons/${selected._id}/complete`);
    setCompleted((prev) => Array.from(new Set([...prev, selected._id])));
  };

  if (!course || !selected) {
    return <Text>Loading lesson...</Text>;
  }

  return (
    <div className="grid gap-lg lg:grid-cols-[1fr_280px]">
      <section>
        <Text muted size="caption" className="text-primary">
          {course.title}
        </Text>
        <Heading size="headline" className="mt-xs">
          {selected.title}
        </Heading>
        {selected.videoUrl ? (
          <video
            key={selected._id}
            className="mt-lg w-full overflow-hidden rounded-xl bg-inverse-surface"
            src={selected.videoUrl}
            controls
            onEnded={() => void markComplete()}
          />
        ) : (
          <Text className="mt-lg">This lesson does not have a video yet.</Text>
        )}
        <div className="mt-lg flex flex-wrap gap-sm">
          <Button variant="secondary" onClick={() => void markComplete()}>
            Mark complete
          </Button>
          <Button to={`/courses/${courseId}/lessons/${selected._id}/quiz`}>Take lesson quiz</Button>
        </div>
        {selected.resources?.length ? (
          <div className="mt-lg flex flex-wrap gap-sm">
            {selected.resources.map((file) => (
              <a
                key={file.fileUrl}
                href={file.fileUrl}
                className="rounded-full bg-surface-container px-sm py-xs text-caption text-primary"
              >
                {file.name}
              </a>
            ))}
          </div>
        ) : null}
      </section>
      <Card className="h-fit p-md">
        <Heading as="h2" size="title" className="mb-sm">
          Lessons
        </Heading>
        <ul className="space-y-xs">
          {lessons.map((lesson) => {
            const active = lesson._id === selected._id;
            const done = completed.includes(lesson._id);
            return (
              <li key={lesson._id}>
                <Link
                  to={`/courses/${courseId}/learn/${lesson._id}`}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-sm py-sm text-sm',
                    active
                      ? 'bg-surface-container-low font-semibold text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container',
                  )}
                >
                  <span className="flex items-center gap-xs">
                    {done ? <Check size={14} /> : <Play size={14} />}
                    {lesson.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
