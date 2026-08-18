import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizBuilder, { type DraftQuestion } from '../../components/quiz-builder';
import Button from '../../components/ui/button';
import FileInput from '../../components/ui/file-input';
import Heading from '../../components/ui/heading';
import Input from '../../components/ui/input';
import Select from '../../components/ui/select';
import Text from '../../components/ui/text';
import Textarea from '../../components/ui/textarea';
import api from '../../lib/api';
import { getErrorMessage } from '../../lib/cn';

const steps = ['Basic info', 'Curriculum', 'Pricing', 'Publish'];

export default function CreateCourse() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [courseId, setCourseId] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'design',
    difficulty: 'beginner',
    duration: 0,
    price: 0,
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [lesson, setLesson] = useState({ title: '', duration: 0, video: null as File | null });
  const [lessons, setLessons] = useState<string[]>([]);
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [generating, setGenerating] = useState(false);

  const saveBasics = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/courses', form);
      setCourseId(data._id);
      if (thumbnail) {
        const body = new FormData();
        body.append('thumbnail', thumbnail);
        await api.post(`/courses/${data._id}/thumbnail`, body);
      }
      setStep(1);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to save course.'));
    } finally {
      setBusy(false);
    }
  };

  const addLesson = async (event: FormEvent) => {
    event.preventDefault();
    if (!courseId || !lesson.video) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append('title', lesson.title);
      body.append('duration', String(lesson.duration));
      body.append('video', lesson.video);
      await api.post(`/courses/${courseId}/lessons`, body);
      setLessons((prev) => [...prev, lesson.title]);
      setLesson({ title: '', duration: 0, video: null });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to add lesson.'));
    } finally {
      setBusy(false);
    }
  };

  const savePrice = async () => {
    await api.put(`/courses/${courseId}`, { price: form.price, duration: form.duration });
    setStep(3);
  };

  const publish = async () => {
    setBusy(true);
    await api.put(`/courses/${courseId}`, { isPublished: true, price: form.price });
    setBusy(false);
    navigate('/instructor/courses');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-xl">
      <Heading size="headline">Create Course</Heading>
      <ol className="grid grid-cols-2 gap-sm sm:grid-cols-4">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`rounded-xl px-sm py-sm text-center text-caption transition-colors duration-200 ${
              i === step
                ? 'bg-primary text-on-primary shadow-soft'
                : i < step
                  ? 'bg-primary-fixed text-primary'
                  : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>
      {error ? <Text tone="error">{error}</Text> : null}

      {step === 0 ? (
        <form className="space-y-lg" onSubmit={saveBasics}>
          <Input
            label="Course title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="grid gap-lg sm:grid-cols-2">
            <Select
              label="Category"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={[
                { value: 'design', label: 'Design' },
                { value: 'development', label: 'Development' },
                { value: 'business', label: 'Business' },
              ]}
            />
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(value) => setForm({ ...form, difficulty: value })}
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ]}
            />
          </div>
          <FileInput
            label="Thumbnail"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          />
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Next'}
          </Button>
        </form>
      ) : null}

      {step === 1 ? (
        <div className="space-y-lg">
          <ul className="list-disc pl-lg">
            {lessons.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
          <form className="space-y-md" onSubmit={addLesson}>
            <Input
              label="Lesson title"
              value={lesson.title}
              onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
              required
            />
            <Input
              label="Duration (seconds)"
              type="number"
              value={lesson.duration}
              onChange={(e) => setLesson({ ...lesson, duration: Number(e.target.value) })}
            />
            <FileInput
              label="Lesson video"
              accept="video/mp4"
              required
              onChange={(e) => setLesson({ ...lesson, video: e.target.files?.[0] || null })}
            />
            <Button type="submit" disabled={busy}>
              Add lesson
            </Button>
          </form>
          <QuizBuilder
            questions={questions}
            onChange={setQuestions}
            generating={generating}
            onGenerate={() => {
              void (async () => {
                setGenerating(true);
                setError('');
                try {
                  const { data } = await api.post('/ai/quiz', { courseId });
                  setQuestions(data.questions || []);
                } catch (err: unknown) {
                  setError(getErrorMessage(err, 'Unable to generate quiz. Is Ollama running?'));
                } finally {
                  setGenerating(false);
                }
              })();
            }}
          />
          <div className="flex gap-sm">
            <Button variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              onClick={() => {
                void (async () => {
                  const payload = questions.filter((item) => item.questionText && item.correctAnswer);
                  if (payload.length) {
                    try {
                      await api.post('/quizzes', { course: courseId, questions: payload });
                    } catch (err: unknown) {
                      setError(getErrorMessage(err, 'Unable to save quiz.'));
                      return;
                    }
                  }
                  setStep(2);
                })();
              }}
              disabled={!lessons.length}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-lg">
          <div className="grid gap-lg sm:grid-cols-2">
            <Input
              label="Price (USD, 0 = free)"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              label="Duration (hours)"
              type="number"
              min={0}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
            />
          </div>
          <Text muted>Paid courses checkout through Stripe.</Text>
          <div className="flex gap-sm">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => void savePrice()}>Next</Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-lg">
          <Text>
            Ready to publish <strong>{form.title}</strong> with {lessons.length} lesson
            {lessons.length === 1 ? '' : 's'} at {form.price > 0 ? `$${form.price.toFixed(2)}` : 'Free'}.
          </Text>
          <div className="flex gap-sm">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => void publish()} disabled={busy}>
              {busy ? 'Publishing...' : 'Publish course'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
