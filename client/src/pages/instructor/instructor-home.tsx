import { useEffect, useState } from 'react';
import { BookOpen, RefreshCw, Star, Users, Wallet } from 'lucide-react';
import Button from '../../components/ui/button';
import Card from '../../components/ui/card';
import Heading from '../../components/ui/heading';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../components/ui/table';
import Text from '../../components/ui/text';
import api from '../../lib/api';

type Overview = {
  totalStudents: number;
  totalCourses: number;
  drafts: number;
  averageRating: number;
  ratingsCount: number;
  totalRevenue: number;
};

type CourseRow = {
  _id: string;
  title: string;
  ratingsAverage?: number;
  enrolledStudents?: unknown[];
  lessons?: unknown[];
  isPublished?: boolean;
};

export default function InstructorHome() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [courses, setCourses] = useState<CourseRow[]>([]);

  const load = async () => {
    const [{ data: stats }, { data: mine }] = await Promise.all([
      api.get('/instructor/overview'),
      api.get('/courses/instructor/mine'),
    ]);
    setOverview(stats);
    setCourses(mine.courses || []);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-xl">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <Heading size="headline">Instructor Overview</Heading>
        <Button variant="secondary" onClick={() => void load()}>
          <RefreshCw size={16} /> Refresh Data
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-gutter stagger-grid sm:grid-cols-2 xl:grid-cols-4">
        <Card className="min-w-0">
          <div className="flex items-start justify-between gap-sm">
            <Text muted size="sm">
              Total Students
            </Text>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-fixed text-primary">
              <Users size={18} />
            </span>
          </div>
          <Heading size="headline" className="mt-sm">
            {overview?.totalStudents ?? 0}
          </Heading>
        </Card>
        <Card className="min-w-0">
          <div className="flex items-start justify-between gap-sm">
            <Text muted size="sm">
              Total Courses
            </Text>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-fixed text-primary">
              <BookOpen size={18} />
            </span>
          </div>
          <Heading size="headline" className="mt-sm">
            {overview?.totalCourses ?? 0}
          </Heading>
          <Text muted size="caption">
            {overview?.drafts || 0} drafts pending
          </Text>
        </Card>
        <Card className="min-w-0">
          <div className="flex items-start justify-between gap-sm">
            <Text muted size="sm">
              Average Rating
            </Text>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-container">
              <Star size={18} />
            </span>
          </div>
          <Heading size="headline" className="mt-sm">
            {overview?.averageRating ?? 0}{' '}
            <span className="text-lg font-normal text-on-surface-variant">/ 5.0</span>
          </Heading>
        </Card>
        <Card className="min-w-0">
          <div className="flex items-start justify-between gap-sm">
            <Text muted size="sm">
              Total Revenue
            </Text>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-fixed text-primary">
              <Wallet size={18} />
            </span>
          </div>
          <Heading size="headline" className="mt-sm">
            ${(overview?.totalRevenue || 0).toFixed(2)}
          </Heading>
          <Text muted size="caption">
            From Stripe enrollments
          </Text>
        </Card>
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>Course</Th>
            <Th>Students</Th>
            <Th>Lessons</Th>
            <Th>Rating</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {courses.map((course) => (
            <Tr key={course._id}>
              <Td>
                <Button variant="ghost" className="!h-auto px-0" to={`/courses/${course._id}`}>
                  {course.title}
                </Button>
              </Td>
              <Td>{course.enrolledStudents?.length || 0}</Td>
              <Td>{course.lessons?.length || 0}</Td>
              <Td>{course.ratingsAverage || 0}</Td>
              <Td>{course.isPublished === false ? 'Draft' : 'Published'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
