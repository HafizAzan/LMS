import { useEffect, useRef, useState } from 'react';
import { askCourseAssistant } from '../services/aiService';

function AiAssistant({ courseId, lessonId }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask a question about this course. I will answer using the lesson materials.',
    },
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy) {
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setBusy(true);

    try {
      const data = await askCourseAssistant({
        courseId,
        lessonId,
        message: question,
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply || 'I could not find an answer.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            err.response?.data?.message ||
            'The assistant is unavailable right now.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ai-assistant">
      {open ? (
        <section className="ai-panel" aria-label="Course assistant">
          <header className="ai-panel-header">
            <h3>Learning assistant</h3>
            <button
              type="button"
              className="nav-button"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </header>
          <div className="ai-messages" ref={listRef}>
            {messages.map((item, index) => (
              <p key={index} className={`ai-bubble ${item.role}`}>
                {item.text}
              </p>
            ))}
            {busy ? <p className="ai-bubble assistant">Thinking...</p> : null}
          </div>
          <form className="ai-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about this lesson"
              aria-label="Ask the learning assistant"
            />
            <button type="submit" className="enroll-button" disabled={busy}>
              Send
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          className="ai-toggle enroll-button"
          onClick={() => setOpen(true)}
        >
          Ask AI
        </button>
      )}
    </div>
  );
}

export default AiAssistant;
