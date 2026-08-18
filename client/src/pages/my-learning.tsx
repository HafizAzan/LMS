import { useEffect, useState } from 'react';
import Button from '../components/ui/button';
import Card from '../components/ui/card';
import Heading from '../components/ui/heading';
import ProgressBar from '../components/ui/progress-bar';
import Skeleton from '../components/ui/skeleton';
import Text from '../components/ui/text';
import { useAuth } from '../context/auth-context';
import api from '../lib/api';

type Item = {
  course: { _id: string; title: string; thumbnail?: string };
  overallPercent: number;
  lastAccessedAt?: string;
  nextLesson?: { _id: string };
};

export default function MyLearning() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/progress');
      setCourses(data.courses || []);
      setLoading(false);
    };
    void load();
  }, []);

  const inProgress = courses.filter((item) => item.overallPercent < 100).length;
  const completed = courses.filter((item) => item.overallPercent >= 100).length;

  const downloadCert = async (courseId: string, title: string) => {
    const res = await api.get(`/certificates/${courseId}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}-certificate.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-xl">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-sm h-5 w-48" />
        </div>
        <div className="grid gap-gutter md:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      <div>
        <Heading size="headline">Welcome back, {user?.name?.split(' ')[0] || 'learner'}</Heading>
        <Text muted className="mt-sm">
          {inProgress} in progress · {completed} completed · {courses.length} enrolled
        </Text>
      </div>
      {!courses.length ? (
        <Card className="p-xxl text-center">
          <Heading as="h2" size="title">
            Your library is empty
          </Heading>
          <Text muted className="mt-sm">
            Browse the catalog and enroll in your first course.
          </Text>
          <Button className="mt-lg" to="/courses">
            Browse courses
          </Button>
        </Card>
      ) : (
        <section className="grid gap-gutter stagger-grid md:grid-cols-2 xl:grid-cols-3">
          {courses.map((item) => (
            <article key={item.course._id} className="card flex h-full min-w-0 flex-col overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden bg-surface-container">
                {item.course.thumbnail ? (
                  <img src={item.course.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary-fixed to-surface-container" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-sm p-lg">
                <Heading as="h2" size="subtitle" className="line-clamp-2">
                  {item.course.title}
                </Heading>
                <Text muted size="caption">
                  {item.lastAccessedAt
                    ? new Date(item.lastAccessedAt).toLocaleString()
                    : 'Not started yet'}
                </Text>
                <ProgressBar percent={item.overallPercent} />
                <div className="mt-auto flex flex-wrap gap-sm pt-xs">
                  <Button
                    size="sm"
                    to={
                      item.nextLesson?._id
                        ? `/courses/${item.course._id}/learn/${item.nextLesson._id}`
                        : `/courses/${item.course._id}/learn`
                    }
                  >
                    Continue Learning
                  </Button>
                  {item.overallPercent >= 100 ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void downloadCert(item.course._id, item.course.title)}
                    >
                      Download certificate
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
