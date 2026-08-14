import Button from './ui/button';
import Card from './ui/card';
import Input from './ui/input';
import Select from './ui/select';
import Text from './ui/text';

export type DraftQuestion = {
  questionText: string;
  type: 'mcq' | 'true_false' | 'fill_blank';
  options: string[];
  correctAnswer: string;
};

export const emptyQuestion = (): DraftQuestion => ({
  questionText: '',
  type: 'mcq',
  options: ['', '', '', ''],
  correctAnswer: '',
});

type QuizBuilderProps = {
  questions: DraftQuestion[];
  onChange: (questions: DraftQuestion[]) => void;
  onGenerate?: () => void;
  generating?: boolean;
};

export default function QuizBuilder({
  questions,
  onChange,
  onGenerate,
  generating,
}: QuizBuilderProps) {
  const update = (index: number, patch: Partial<DraftQuestion>) => {
    onChange(questions.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-md">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <Text className="font-medium">Course quiz</Text>
        <div className="flex gap-sm">
          {onGenerate ? (
            <Button variant="secondary" size="sm" onClick={onGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate with AI'}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange([...questions, emptyQuestion()])}
          >
            Add question
          </Button>
        </div>
      </div>
      {!questions.length ? (
        <Text muted>Add questions or generate them from this course with AI.</Text>
      ) : null}
      {questions.map((question, index) => (
        <Card key={index} className="space-y-md">
          <div className="flex items-start justify-between gap-sm">
            <Text className="font-medium">Question {index + 1}</Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(questions.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </div>
          <Input
            label="Question"
            value={question.questionText}
            onChange={(event) => update(index, { questionText: event.target.value })}
          />
          <Select
            label="Type"
            value={question.type}
            onChange={(value) => {
              const type = value as DraftQuestion['type'];
              update(index, {
                type,
                options: type === 'mcq' ? ['', '', '', ''] : type === 'true_false' ? ['true', 'false'] : [],
                correctAnswer: type === 'true_false' ? 'true' : '',
              });
            }}
            options={[
              { value: 'mcq', label: 'Multiple choice' },
              { value: 'true_false', label: 'True / false' },
              { value: 'fill_blank', label: 'Fill in the blank' },
            ]}
          />
          {question.type === 'mcq'
            ? question.options.map((option, optionIndex) => (
                <Input
                  key={optionIndex}
                  label={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(event) => {
                    const options = question.options.map((item, i) =>
                      i === optionIndex ? event.target.value : item,
                    );
                    update(index, {
                      options,
                      correctAnswer: optionIndex === 0 && !question.correctAnswer ? event.target.value : question.correctAnswer,
                    });
                  }}
                />
              ))
            : null}
          {question.type === 'mcq' ? (
            <Select
              label="Correct answer"
              value={question.correctAnswer}
              onChange={(value) => update(index, { correctAnswer: value })}
              options={question.options.filter(Boolean).map((option) => ({
                value: option,
                label: option,
              }))}
              placeholder="Select the correct option"
            />
          ) : null}
          {question.type === 'true_false' ? (
            <Select
              label="Correct answer"
              value={question.correctAnswer || 'true'}
              onChange={(value) => update(index, { correctAnswer: value })}
              options={[
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' },
              ]}
            />
          ) : null}
          {question.type === 'fill_blank' ? (
            <Input
              label="Correct answer"
              value={question.correctAnswer}
              onChange={(event) => update(index, { correctAnswer: event.target.value })}
            />
          ) : null}
        </Card>
      ))}
    </div>
  );
}
