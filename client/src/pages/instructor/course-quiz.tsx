import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizBuilder, { type DraftQuestion } from '../../components/quiz-builder';
import Button from '../../components/ui/button';
import Heading from '../../components/ui/heading';
import Text from '../../components/ui/text';
import api from '../../lib/api';
import { getErrorMessage } from '../../lib/cn';

export default function CourseQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('Course quiz');

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const [{ data: courseData }, { data: quizData }] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/quizzes/course/${id}`),
        ]);
        setTitle(courseData.title || 'Course quiz');
        const first = quizData.quizzes?.[0];
        setQuestions(first?.questions || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Unable to load quiz.'));
      }
    })();
  }, [id]);

  const save = async () => {
    const payload = questions.filter((item) => item.questionText && item.correctAnswer);
    if (!payload.length) {
      setError('Add at least one complete question.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.post('/quizzes', { course: id, questions: payload });
      navigate('/instructor/courses');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to save quiz.'));
    } finally {
      setBusy(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post('/ai/quiz', { courseId: id });
      setQuestions(data.questions || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to generate quiz. Is Ollama running?'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-xl">
      <div>
        <Heading size="headline">Quiz</Heading>
        <Text muted className="mt-sm">
          {title}
        </Text>
      </div>
      {error ? <Text tone="error">{error}</Text> : null}
      <QuizBuilder
        questions={questions}
        onChange={setQuestions}
        onGenerate={() => void generate()}
        generating={generating}
      />
      <div className="flex gap-sm">
        <Button variant="secondary" to="/instructor/courses">
          Back
        </Button>
        <Button onClick={() => void save()} disabled={busy}>
          {busy ? 'Saving...' : 'Save quiz'}
        </Button>
      </div>
    </div>
  );
}
