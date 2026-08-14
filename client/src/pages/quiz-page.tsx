import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/ui/button';
import Card from '../components/ui/card';
import Heading from '../components/ui/heading';
import Input from '../components/ui/input';
import ProgressBar from '../components/ui/progress-bar';
import Text from '../components/ui/text';
import { useAuth } from '../context/auth-context.tsx';
import api from '../lib/api';

type Question = {
  _id?: string;
  questionText: string;
  type: 'mcq' | 'true_false' | 'fill_blank';
  options?: string[];
};

type Result = {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  results: Array<{
    questionText: string;
    isCorrect: boolean;
    submittedAnswer: string;
    correctAnswer: string;
  }>;
};

export default function QuizPage() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<{ _id: string; questions: Question[] } | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/quizzes/course/${courseId}`, {
        params: lessonId ? { lessonId } : {},
      });
      const first = data.quizzes?.[0];
      setQuiz(first || null);
      setAnswers(first ? first.questions.map(() => '') : []);
    };
    void load()
      .catch(() => setError('Unable to load quiz.'))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  if (error) return <Text tone="error">{error}</Text>;
  if (loading) return <Text muted>Loading quiz...</Text>;
  if (!quiz) {
    return (
      <div className="space-y-md">
        <Text>No quiz is available yet.</Text>
        {user?.role === 'instructor' ? (
          <Button to={`/instructor/courses/${courseId}/quiz`}>Create quiz</Button>
        ) : (
          <Text muted>The instructor has not added a quiz for this course.</Text>
        )}
      </div>
    );
  }

  const question = quiz.questions[index];
  const progress = ((index + (result ? 1 : 0)) / quiz.questions.length) * 100;

  const submit = async () => {
    const { data } = await api.post(`/quizzes/${quiz._id}/submit`, { answers });
    setResult(data);
  };

  if (result) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <Text muted size="caption" className="text-primary">
          {result.passed ? 'Passed' : 'Keep practicing'}
        </Text>
        <Heading size="display" className="mt-sm">
          {result.score}%
        </Heading>
        <Text muted>
          {result.correctCount} of {result.total} correct
        </Text>
        <ul className="mt-lg space-y-sm text-left">
          {result.results.map((item, i) => (
            <li key={i} className={item.isCorrect ? 'text-primary' : 'text-error'}>
              {item.questionText} — {item.isCorrect ? 'Correct' : `Answer: ${item.correctAnswer}`}
            </li>
          ))}
        </ul>
        <div className="mt-lg flex justify-center gap-sm">
          <Button
            onClick={() => {
              setResult(null);
              setIndex(0);
              setAnswers(quiz.questions.map(() => ''));
            }}
          >
            Retry
          </Button>
          <Button variant="secondary" to={`/courses/${courseId}`}>
            Back to course
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-lg">
      <ProgressBar percent={progress} label={false} />
      <Text muted size="caption">
        Question {index + 1} of {quiz.questions.length}
      </Text>
      <Card>
        <Heading size="title">{question.questionText}</Heading>
        <div className="mt-lg space-y-sm">
          {question.type === 'mcq'
            ? (question.options || []).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={answers[index] === option ? 'primary' : 'secondary'}
                  className="w-full justify-start"
                  onClick={() => setAnswers((prev) => prev.map((value, i) => (i === index ? option : value)))}
                >
                  {option}
                </Button>
              ))
            : null}
          {question.type === 'true_false'
            ? ['true', 'false'].map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={answers[index] === option ? 'primary' : 'secondary'}
                  className="mr-sm capitalize"
                  onClick={() => setAnswers((prev) => prev.map((value, i) => (i === index ? option : value)))}
                >
                  {option}
                </Button>
              ))
            : null}
          {question.type === 'fill_blank' ? (
            <Input
              value={answers[index]}
              onChange={(event) =>
                setAnswers((prev) => prev.map((value, i) => (i === index ? event.target.value : value)))
              }
            />
          ) : null}
        </div>
      </Card>
      <div className="flex justify-end">
        {index < quiz.questions.length - 1 ? (
          <Button onClick={() => setIndex((value) => value + 1)}>Next question</Button>
        ) : (
          <Button onClick={() => void submit()}>Submit quiz</Button>
        )}
      </div>
    </div>
  );
}
