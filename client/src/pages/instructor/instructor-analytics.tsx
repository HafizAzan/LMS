import { useEffect, useState } from 'react';
import Card from '../../components/ui/card';
import Heading from '../../components/ui/heading';
import Select from '../../components/ui/select';
import Text from '../../components/ui/text';
import api from '../../lib/api';

type Analytics = {
  totalEnrolled: number;
  averageProgress: number;
  averageQuizScore: number;
  averageRating: number;
};

export default function InstructorAnalytics() {
  const [courses, setCourses] = useState<Array<{ _id: string; title: string }>>([]);
  const [courseId, setCourseId] = useState('');
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    void api.get('/courses/instructor/mine').then(({ data: mine }) => {
      const list = mine.courses || [];
      setCourses(list);
      if (list[0]?._id) setCourseId(list[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!courseId) return;
    void api
      .get(`/instructor/courses/${courseId}/analytics`)
      .then(({ data: stats }) => setData(stats));
  }, [courseId]);

  return (
    <div className="space-y-xl">
      <Heading size="headline">Analytics</Heading>
      <Select
        className="max-w-md"
        value={courseId}
        onChange={(value) => setCourseId(value)}
        options={courses.map((course) => ({ value: course._id, label: course.title }))}
      />
      {data ? (
        <div className="grid grid-cols-1 gap-gutter stagger-grid sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <Heading size="headline">{data.totalEnrolled}</Heading>
            <Text muted>Enrolled</Text>
          </Card>
          <Card>
            <Heading size="headline">{data.averageProgress}%</Heading>
            <Text muted>Avg progress</Text>
          </Card>
          <Card>
            <Heading size="headline">{data.averageQuizScore}%</Heading>
            <Text muted>Avg quiz</Text>
          </Card>
          <Card>
            <Heading size="headline">{data.averageRating}</Heading>
            <Text muted>Rating</Text>
          </Card>
        </div>
      ) : (
        <Text muted>Create a course to see analytics.</Text>
      )}
    </div>
  );
}
