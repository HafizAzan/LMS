const Course = require('../models/Course');

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

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        reply: fallbackAnswer(message.trim(), contextData),
        provider: 'course-context',
      });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const endpoint =
      process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You are a learning assistant for an online course. Answer only using the provided course context. If the question is outside that material, say so and point the student back to a relevant lesson. Keep answers concise.',
          },
          {
            role: 'user',
            content: `Course context:\n${contextData.context}\n\nStudent question:\n${message.trim()}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('AI provider error:', errBody);
      return res.json({
        reply: fallbackAnswer(message.trim(), contextData),
        provider: 'course-context',
      });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      fallbackAnswer(message.trim(), contextData);

    return res.json({ reply, provider: 'openai' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { askAssistant };
