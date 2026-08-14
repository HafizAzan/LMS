import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import Badge from './ui/badge';
import Button from './ui/button';
import Heading from './ui/heading';
import Text from './ui/text';

export type Course = {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  difficulty?: string;
  duration?: number;
  price?: number;
  ratingsAverage?: number;
  ratingsCount?: number;
  instructor?: { name?: string; email?: string; avatar?: string };
  enrolledStudents?: unknown[];
};

export default function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const instructor = course.instructor?.name || course.instructor?.email || 'Instructor';
  const difficulty = course.difficulty || 'beginner';

  return (
    <article className="card card-hover flex flex-col">
      <Link to={`/courses/${course._id}`} className="block overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt="" className="h-40 w-full object-cover" />
        ) : (
          <div className="h-40 w-full bg-surface-container" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-sm p-lg">
        <div className="flex items-center justify-between gap-sm">
          <Badge tone={difficulty === 'advanced' ? 'accent' : difficulty === 'intermediate' ? 'neutral' : 'primary'}>
            {difficulty}
          </Badge>
          <Text muted size="caption">
            {course.duration || 0} hrs
          </Text>
        </div>
        <Heading as="h2" size="title">
          <Link to={`/courses/${course._id}`} className="hover:text-primary">
            {course.title}
          </Link>
        </Heading>
        <Text muted size="sm">
          {instructor}
        </Text>
        <Text size="sm">
          ★ {Number(course.ratingsAverage || 0).toFixed(1)}
          <span className="ml-xs text-on-surface-variant">({course.ratingsCount || 0})</span>
        </Text>
        <Text className="text-title">
          {course.price ? `$${Number(course.price).toFixed(2)}` : 'Free'}
        </Text>
        <Button
          className="mt-auto w-full"
          onClick={() => {
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }
            navigate(`/courses/${course._id}`);
          }}
        >
          {course.price ? 'Buy & enroll' : 'Enroll'}
        </Button>
      </div>
    </article>
  );
}
