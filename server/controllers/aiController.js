const Course = require('../models/Course');

const SYSTEM_PROMPT =
  'You are a learning assistant for an online course. Answer only using the provided course context. If the question is outside that material, say so and point the student back to a relevant lesson. Keep answers concise.';

const buildCourseContext = async (courseId, lessonId) => {
  const course = await Course.findById(courseId).populate(
    'lessons',
    'title order duration',
  );

  if (!course) {
    return null;
  }

  const lessons = [...(course.lessons || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );
  const currentLesson = lessonId
    ? lessons.find((lesson) => lesson._id.toString() === lessonId.toString())
    : null;

  const lessonList = lessons
    .map((lesson, index) => `${index + 1}. ${lesson.title}`)
    .join('\n');

  return {
    course,
    currentLesson,
    context: [
      `Course title: ${course.title}`,
      `Category: ${course.category}`,
      `Difficulty: ${course.difficulty}`,
      `Description: ${course.description}`,
      currentLesson ? `Current lesson: ${currentLesson.title}` : '',
      `Lessons:\n${lessonList || 'No lessons yet.'}`,
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
};

const fallbackAnswer = (question, contextData) => {
  const haystack = [
    contextData.course.title,
    contextData.course.description,
    contextData.currentLesson?.title,
    ...(contextData.course.lessons || []).map((lesson) => lesson.title),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const words = question
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3);
  const matched = words.filter((word) => haystack.includes(word));

  const lessonHint = contextData.currentLesson
    ? ` You are currently in the lesson "${contextData.currentLesson.title}".`
    : '';

  if (!matched.length) {
    return `I can only answer from this course's materials. "${contextData.course.title}" covers: ${contextData.course.description.slice(0, 240)}${lessonHint} Try asking about a lesson title or a topic from the description.`;
  }

  return `"${contextData.course.title}" (${contextData.course.difficulty} · ${contextData.course.category}) includes those ideas.${lessonHint} Course overview: ${contextData.course.description.slice(0, 400)}`;
};

const cleanReply = (text) =>
  String(text || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();

const chatOllama = async (messages) => {
  const base = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(
    /\/$/,
    '',
  );
  const model = process.env.OLLAMA_MODEL || 'qwen3:4b';
  const response = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(`Ollama ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const reply = cleanReply(data.message?.content);
  if (!reply) {
    throw new Error('Empty Ollama reply');
  }
  return reply;
};

const chatOpenAI = async (messages) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI is not configured');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const endpoint =
    process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const reply = cleanReply(data.choices?.[0]?.message?.content);
  if (!reply) {
    throw new Error('Empty OpenAI reply');
  }
  return reply;
};

const askAssistant = async (req, res) => {
  try {
    const { courseId, lessonId, message } = req.body;
    if (!courseId || !message?.trim()) {
      return res.status(400).json({ message: 'courseId and message are required' });
    }

    const contextData = await buildCourseContext(courseId, lessonId);
    if (!contextData) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isInstructor =
      contextData.course.instructor.toString() === req.user._id.toString();
    const isStudent = contextData.course.enrolledStudents.some(
      (studentId) => studentId.toString() === req.user._id.toString(),
    );

    if (!isInstructor && !isStudent) {
      return res.status(403).json({ message: 'Enroll in this course to use the assistant' });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Course context:\n${contextData.context}\n\nStudent question:\n${message.trim()}`,
      },
    ];

    try {
      const { text, provider } = await completeChat(messages);
      return res.json({ reply: text, provider });
    } catch (error) {
      console.warn('AI providers unavailable, using course context:', error.message);
      return res.json({
        reply: fallbackAnswer(message.trim(), contextData),
        provider: 'course-context',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const parseGeneratedQuestions = (text) => {
  const cleaned = cleanReply(text).replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start < 0 || end <= start) {
    throw new Error('AI did not return quiz questions');
  }

  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed) || !parsed.length) {
    throw new Error('AI did not return quiz questions');
  }

  return parsed.map((item) => {
    const type = ['mcq', 'true_false', 'fill_blank'].includes(item.type)
      ? item.type
      : 'mcq';
    const options =
      type === 'mcq'
        ? (item.options || []).map((option) => String(option).trim()).filter(Boolean).slice(0, 4)
        : type === 'true_false'
          ? ['true', 'false']
          : [];
    const correctAnswer = String(item.correctAnswer || '').trim();

    return {
      questionText: String(item.questionText || '').trim(),
      type,
      options,
      correctAnswer,
    };
  }).filter((item) => item.questionText && item.correctAnswer);
};

const completeChat = async (messages) => {
  try {
    return { text: await chatOllama(messages), provider: 'ollama' };
  } catch (ollamaError) {
    console.warn('Ollama unavailable, trying OpenAI:', ollamaError.message);
  }

  return { text: await chatOpenAI(messages), provider: 'openai' };
};

const generateQuiz = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    const contextData = await buildCourseContext(courseId);
    if (!contextData) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (contextData.course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to generate a quiz for this course' });
    }

    const messages = [
      {
        role: 'system',
        content:
          'You create quizzes for an online course. Reply with JSON only. No markdown. No extra text.',
      },
      {
        role: 'user',
        content: `Create 5 multiple-choice questions from this course. JSON array format:
[{"questionText":"...","type":"mcq","options":["A","B","C","D"],"correctAnswer":"A"}]
correctAnswer must exactly match one option.

Course context:
${contextData.context}`,
      },
    ];

    const { text, provider } = await completeChat(messages);
    const questions = parseGeneratedQuestions(text);
    if (!questions.length) {
      return res.status(502).json({ message: 'Could not generate quiz questions' });
    }

    return res.json({ questions, provider });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { askAssistant, generateQuiz };
