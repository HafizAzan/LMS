import { Clock, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import Badge from './ui/badge';
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
  const href = `/courses/${course._id}`;

  const openCourse = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(href);
  };

  return (
    <article className="card card-hover group flex h-full min-w-0 flex-col">
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden bg-surface-container">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-fixed to-surface-container" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Badge
          tone={difficulty === 'advanced' ? 'accent' : difficulty === 'intermediate' ? 'neutral' : 'primary'}
          className="absolute left-sm top-sm shadow-soft"
        >
          {difficulty}
        </Badge>
      </Link>
      <div className="flex min-h-0 flex-1 flex-col gap-sm p-lg">
        <div className="flex items-center justify-between gap-sm text-on-surface-variant">
          <Text muted size="caption" className="truncate capitalize">
            {course.category || 'Course'}
          </Text>
          <span className="inline-flex shrink-0 items-center gap-xs text-caption">
            <Clock size={12} />
            {course.duration || 0} hrs
          </span>
        </div>
        <Heading as="h2" size="subtitle" className="line-clamp-2 min-h-[2.5rem]">
          <Link to={href} className="transition-colors duration-200 hover:text-primary">
            {course.title}
          </Link>
        </Heading>
        <Text muted size="sm" className="truncate">
          {instructor}
        </Text>
        <div className="mt-auto flex items-center justify-between gap-sm border-t border-outline-variant/60 pt-sm">
          <span className="inline-flex items-center gap-xs text-sm text-on-surface">
            <Star size={14} className="fill-secondary-container text-secondary-container" />
            {Number(course.ratingsAverage || 0).toFixed(1)}
            <span className="text-on-surface-variant">({course.ratingsCount || 0})</span>
          </span>
          <button
            type="button"
            className="text-label font-semibold text-primary transition-colors duration-200 hover:text-surface-tint"
            onClick={openCourse}
          >
            {course.price ? `$${Number(course.price).toFixed(2)}` : 'Free'}
          </button>
        </div>
      </div>
    </article>
  );
}
