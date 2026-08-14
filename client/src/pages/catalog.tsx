import { ArrowUpDown, BookOpen, Layers, Search, Signal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCard, { type Course } from '../components/course-card';
import Heading from '../components/ui/heading';
import Input from '../components/ui/input';
import Select from '../components/ui/select';
import Text from '../components/ui/text';
import api from '../lib/api';
import { getErrorMessage } from '../lib/cn';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const difficulty = params.get('difficulty') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/courses', {
          params: { search, category, difficulty, sort, limit: 24 },
        });
        setCourses(data.courses || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Unable to load courses.'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [search, category, difficulty, sort]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <div className="space-y-xl">
      <div>
        <Heading size="display">Explore Courses</Heading>
        <Text muted size="lg" className="mt-sm">
          Discover new skills and elevate your career.
        </Text>
      </div>
      <div className="relative z-20 flex flex-col gap-sm rounded-2xl border border-outline-variant/80 bg-surface-container-lowest p-sm shadow-lift md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <Input
            placeholder="Search by title"
            defaultValue={search}
            icon={<Search size={18} />}
            onBlur={(event) => update('search', event.target.value.trim())}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                update('search', (event.target as HTMLInputElement).value.trim());
              }
            }}
          />
        </div>
        <Select
          className="md:w-[200px] md:shrink-0"
          value={category}
          onChange={(value) => update('category', value)}
          placeholder="All categories"
          icon={<Layers size={16} />}
          options={[
            { value: 'design', label: 'Design' },
            { value: 'development', label: 'Development' },
            { value: 'business', label: 'Business' },
          ]}
        />
        <Select
          className="md:w-[180px] md:shrink-0"
          value={difficulty}
          onChange={(value) => update('difficulty', value)}
          placeholder="All levels"
          icon={<Signal size={16} />}
          options={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ]}
        />
        <Select
          className="md:w-[210px] md:shrink-0"
          value={sort}
          onChange={(value) => update('sort', value)}
          icon={<ArrowUpDown size={16} />}
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'rating', label: 'Top rated' },
            { value: 'popular', label: 'Most popular' },
            { value: 'price_asc', label: 'Price: low to high' },
            { value: 'price_desc', label: 'Price: high to low' },
          ]}
        />
      </div>
      {loading ? <Text muted>Loading courses...</Text> : null}
      {error ? <Text tone="error">{error}</Text> : null}
      {!loading && !courses.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-xl py-xxl text-center">
          <div className="mb-md flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
            <BookOpen size={26} />
          </div>
          <Heading as="h2" size="title">
            No courses found
          </Heading>
          <Text muted className="mt-sm max-w-md">
            Try a different search or clear the filters to see more courses.
          </Text>
        </div>
      ) : null}
      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </section>
    </div>
  );
}
