import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QuizSkeleton } from '../components/Skeletons';
import { getQuizzesByCourse, submitQuiz } from '../services/quizService';

function emptyAnswers(questions = []) {
  return questions.map(() => '');
}

function TrueFalseToggle({ name, value, onChange, disabled }) {
  return (
    <div className="tf-toggle" role="group" aria-label="True or false">
      {['true', 'false'].map((option) => (
        <button
          key={option}
          type="button"
          className={`tf-option ${value === option ? 'selected' : ''}`}
          onClick={() => onChange(option)}
          disabled={disabled}
          aria-pressed={value === option}
        >
          {option === 'true' ? 'True' : 'False'}
        </button>
      ))}
    </div>
  );
}

function QuizPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError('');
      setResult(null);

      try {
        let data = await getQuizzesByCourse(courseId, lessonId);
        let quizzes = data.quizzes || [];

        if (lessonId && quizzes.length === 0) {
          data = await getQuizzesByCourse(courseId);
          quizzes = (data.quizzes || []).filter((item) => !item.lesson);
        }

        const nextQuiz = quizzes[0] || null;
        setQuiz(nextQuiz);
        setAnswers(emptyAnswers(nextQuiz?.questions));
      } catch (err) {
        setQuiz(null);
        setError(err.response?.data?.message || 'Unable to load the quiz.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [courseId, lessonId]);

  const setAnswer = (index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!quiz?._id) {
      return;
    }

    setSubmitting(true);
    setError('');

    const missing = quiz.questions.some((question, index) => {
      if (question.type === 'true_false') {
        return answers[index] !== 'true' && answers[index] !== 'false';
      }
      return !String(answers[index] ?? '').trim();
    });

    if (missing) {
      setSubmitting(false);
      setError('Please answer every question before submitting.');
      return;
    }

    try {
      const data = await submitQuiz(quiz._id, answers);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit the quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers(emptyAnswers(quiz?.questions));
    setError('');
  };

  if (loading) {
    return (
      <main className="page catalog-page">
        <QuizSkeleton />
      </main>
    );
  }

  if (error && !quiz) {
    return (
      <main className="page catalog-page">
        <p className="form-error">{error}</p>
        <Link to={`/courses/${courseId}`}>Back to course</Link>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="page catalog-page">
        <p>No quiz is available for this course yet.</p>
        <Link to={`/courses/${courseId}`}>Back to course</Link>
      </main>
    );
  }

  const backTo = lessonId
    ? `/courses/${courseId}/learn/${lessonId}`
    : `/courses/${courseId}`;

  return (
    <main className="page catalog-page quiz-page">
      <Link to={backTo} className="back-link">
        Back
      </Link>
      <h1>Quiz</h1>
      <p>
        {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'}
      </p>

      {result ? (
        <section className="quiz-results">
          <h2>
            Score: {result.score}%{' '}
            <span className={result.passed ? 'quiz-passed' : 'quiz-failed'}>
              {result.passed ? 'Passed' : 'Failed'}
            </span>
          </h2>
          <p>
            {result.correctCount} of {result.total} correct
          </p>

          <ol className="quiz-breakdown">
            {(result.results || []).map((item, index) => (
              <li
                key={item.questionId || index}
                className={item.isCorrect ? 'correct' : 'incorrect'}
              >
                <p className="quiz-question-text">{item.questionText}</p>
                <p>
                  Your answer: {item.submittedAnswer || '(blank)'}
                </p>
                {item.isCorrect ? (
                  <p className="quiz-mark">Correct</p>
                ) : (
                  <p className="quiz-mark">
                    Incorrect — correct answer: {item.correctAnswer}
                  </p>
                )}
              </li>
            ))}
          </ol>

          <button type="button" className="enroll-button" onClick={handleRetry}>
            Retry
          </button>
        </section>
      ) : (
        <form className="quiz-form" onSubmit={handleSubmit}>
          {error ? <p className="form-error">{error}</p> : null}

          {quiz.questions.map((question, index) => (
            <fieldset key={question._id || index} className="quiz-question">
              <legend>
                {index + 1}. {question.questionText}
              </legend>

              {question.type === 'mcq' ? (
                (question.options || []).map((option) => (
                  <label key={option} className="quiz-option">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={answers[index] === option}
                      onChange={() => setAnswer(index, option)}
                      required
                    />
                    {option}
                  </label>
                ))
              ) : null}

              {question.type === 'true_false' ? (
                <TrueFalseToggle
                  name={`question-${index}`}
                  value={answers[index]}
                  onChange={(value) => setAnswer(index, value)}
                />
              ) : null}

              {question.type === 'fill_blank' ? (
                <input
                  type="text"
                  className="quiz-blank"
                  value={answers[index]}
                  onChange={(event) => setAnswer(index, event.target.value)}
                  placeholder="Type your answer"
                  required
                />
              ) : null}
            </fieldset>
          ))}

          <button type="submit" className="enroll-button" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit quiz'}
          </button>
        </form>
      )}
    </main>
  );
}

export default QuizPage;
