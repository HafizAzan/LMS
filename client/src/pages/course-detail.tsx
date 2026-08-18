import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Course } from '../components/course-card';
import Avatar from '../components/ui/avatar';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button';
import Card from '../components/ui/card';
import Heading from '../components/ui/heading';
import Select from '../components/ui/select';
import Tabs from '../components/ui/tabs';
import Text from '../components/ui/text';
import Textarea from '../components/ui/textarea';
import { useAuth } from '../context/auth-context';
import api from '../lib/api';
import { getErrorMessage } from '../lib/cn';

type Lesson = { _id: string; title: string; duration?: number };
type Review = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  user?: { _id: string; name?: string; avatar?: string };
};

type CourseDetailData = Course & {
  lessons?: Lesson[];
  enrolledStudents?: Array<string | { _id: string }>;
  instructor?: { _id?: string; name?: string; email?: string; avatar?: string };
};

function isSameId(value: unknown, userId?: string) {
  if (!value || !userId) return false;
  const id = typeof value === 'object' && value && '_id' in value ? (value as { _id: string })._id : value;
  return String(id) === String(userId);
}

export default function CourseDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState('curriculum');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('5');

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const [{ data: courseData }, { data: reviewData }] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get('/reviews', { params: { courseId: id } }),
        ]);
        setCourse(courseData);
        setReviews(reviewData.reviews || reviewData || []);
      } catch {
        setError('Unable to load this course.');
      }
    })();
  }, [id]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const payment = searchParams.get('payment');
    if (payment === 'cancelled') {
      setError('Payment was cancelled.');
      setSearchParams({});
    }
    if (!sessionId || !isAuthenticated) return;
    const confirm = async () => {
      setBusy(true);
      try {
        const { data } = await api.post('/payments/confirm', { sessionId });
        if (data.course) setCourse(data.course);
        if (data.user) updateUser(data.user);
        setSearchParams({});
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Unable to confirm payment.'));
      } finally {
        setBusy(false);
      }
    };
    void confirm();
  }, [searchParams, isAuthenticated, updateUser, setSearchParams]);

  const enrolled = useMemo(() => {
    if (!course || !user) return false;
    return (
      course.enrolledStudents?.some((item) => isSameId(item, user._id)) ||
      isSameId(course.instructor, user._id)
    );
  }, [course, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (course?.price && course.price > 0) {
        const { data } = await api.post('/payments/create-checkout-session', { courseId: id });
        window.location.href = data.url;
        return;
      }
      const { data } = await api.post(`/courses/${id}/enroll`);
      setCourse(data.course);
      if (data.user) updateUser(data.user);
    } catch (err: unknown) {
      const payload =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string; requiresPayment?: boolean } } }).response?.data
          : null;
      if (payload?.requiresPayment) {
        const { data } = await api.post('/payments/create-checkout-session', { courseId: id });
        window.location.href = data.url;
        return;
      }
      setError(payload?.message || 'Unable to enroll.');
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async () => {
    try {
      const { data } = await api.post('/reviews', { course: id, rating: Number(rating), comment });
      setReviews((prev) => [data, ...prev]);
      setComment('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to post review.'));
    }
  };

  if (!course) {
    return <Text>{error || 'Loading course...'}</Text>;
  }

  return (
    <div className="space-y-xl">
      <section className="grid items-start gap-xl lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0">
          <Badge tone="primary">{course.category || 'Course'}</Badge>
          <Heading size="headline" className="mt-sm">
            {course.title}
          </Heading>
          <Text muted className="mt-sm max-w-2xl">
            {course.description}
          </Text>
          <div className="mt-md flex flex-wrap items-center gap-md text-label text-on-surface-variant">
            <span>★ {Number(course.ratingsAverage || 0).toFixed(1)}</span>
            <span>{course.enrolledStudents?.length || 0} students</span>
            <span>{course.duration || 0} hrs</span>
          </div>
          <div className="mt-lg flex flex-wrap gap-sm">
            {enrolled ? (
              <>
                <Button to={`/courses/${id}/learn`}>Continue learning</Button>
                <Button variant="secondary" to={`/courses/${id}/quiz`}>
                  Take quiz
                </Button>
              </>
            ) : (
              <Button onClick={handleEnroll} disabled={busy}>
                {busy
                  ? 'Please wait...'
                  : course.price
                    ? `Enroll · $${Number(course.price).toFixed(2)}`
                    : 'Enroll for free'}
              </Button>
            )}
          </div>
          {error ? <Text tone="error" className="mt-sm">{error}</Text> : null}
        </div>
        <div className="aspect-video min-w-0 overflow-hidden rounded-2xl bg-surface-container shadow-soft">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary-fixed to-surface-container" />
          )}
        </div>
      </section>

      <Tabs
        tabs={[
          { id: 'curriculum', label: 'Curriculum' },
          { id: 'reviews', label: 'Reviews' },
          { id: 'instructor', label: 'Instructor' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'curriculum' ? (
        <ol className="space-y-sm">
          {(course.lessons || []).map((lesson, index) => (
            <li
              key={lesson._id}
              className="flex min-w-0 items-center justify-between gap-md rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-md py-sm shadow-soft"
            >
              <span className="min-w-0 truncate">
                {index + 1}. {lesson.title}
              </span>
              {enrolled ? (
                <Button variant="ghost" size="sm" className="!h-auto px-0" to={`/courses/${id}/learn/${lesson._id}`}>
                  Play
                </Button>
              ) : (
                <Text muted size="caption">
                  Locked
                </Text>
              )}
            </li>
          ))}
          {!course.lessons?.length ? <Text muted>No lessons yet.</Text> : null}
        </ol>
      ) : null}

      {tab === 'reviews' ? (
        <div className="space-y-lg">
          <Card>
            <Heading size="headline">{Number(course.ratingsAverage || 0).toFixed(1)}</Heading>
            <Text muted>{course.ratingsCount || 0} reviews</Text>
          </Card>
          {enrolled ? (
            <div className="space-y-sm">
              <Select
                className="max-w-[140px]"
                value={rating}
                onChange={(value) => setRating(value)}
                options={[5, 4, 3, 2, 1].map((value) => ({
                  value: String(value),
                  label: `${value} stars`,
                }))}
              />
              <Textarea
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a review"
              />
              <Button onClick={() => void submitReview()}>Write a review</Button>
            </div>
          ) : null}
          <ul className="space-y-md">
            {reviews.map((review) => (
              <li key={review._id} className="card p-lg">
                <div className="mb-sm flex items-center gap-sm">
                  <Avatar name={review.user?.name} src={review.user?.avatar} />
                  <div>
                    <Text className="font-medium">{review.user?.name || 'Student'}</Text>
                    <Text muted size="caption">
                      ★ {review.rating}
                    </Text>
                  </div>
                </div>
                <Text>{review.comment}</Text>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === 'instructor' ? (
        <Card className="flex items-center gap-md">
          <Avatar name={course.instructor?.name} src={course.instructor?.avatar} className="h-14 w-14" />
          <div>
            <Heading as="h2" size="title">
              {course.instructor?.name || 'Instructor'}
            </Heading>
            <Text muted>{course.instructor?.email}</Text>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
