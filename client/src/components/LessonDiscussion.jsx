import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createDiscussion,
  getDiscussions,
  replyToDiscussion,
} from '../services/discussionService';

function formatTime(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function LessonDiscussion({ courseId, lessonId }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [message, setMessage] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getDiscussions(courseId, lessonId);
        setThreads(data.discussions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load discussion.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) {
      load();
    }
  }, [courseId, lessonId]);

  const handlePost = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    setPosting(true);
    setError('');
    try {
      const data = await createDiscussion({
        courseId,
        lessonId,
        message: message.trim(),
      });
      setThreads((prev) => [data.discussion, ...prev]);
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to post comment.');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (event, discussionId) => {
    event.preventDefault();
    const reply = replyDrafts[discussionId]?.trim();
    if (!reply) {
      return;
    }

    setPosting(true);
    setError('');
    try {
      const data = await replyToDiscussion(discussionId, reply);
      setThreads((prev) =>
        prev.map((thread) =>
          thread._id === discussionId ? data.discussion : thread,
        ),
      );
      setReplyDrafts((prev) => ({ ...prev, [discussionId]: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to post reply.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="discussion-panel">
      <h3>Lesson discussion</h3>
      <p>Ask questions and reply to classmates in this lesson.</p>

      <form className="discussion-form" onSubmit={handlePost}>
        <label htmlFor="discussion-message" className="sr-only">
          New comment
        </label>
        <textarea
          id="discussion-message"
          rows="3"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={`Share a thought${user?.name ? `, ${user.name}` : ''}...`}
          required
        />
        <button type="submit" className="enroll-button" disabled={posting}>
          {posting ? 'Posting...' : 'Post comment'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p>Loading discussion...</p> : null}

      {!loading && threads.length === 0 ? (
        <p>No comments yet. Start the thread.</p>
      ) : null}

      <ul className="discussion-list">
        {threads.map((thread) => (
          <li key={thread._id} className="discussion-thread">
            <div className="discussion-meta">
              <strong>{thread.user?.name || 'Student'}</strong>
              <span>{formatTime(thread.createdAt)}</span>
            </div>
            <p>{thread.message}</p>

            {thread.replies?.length ? (
              <ul className="discussion-replies">
                {thread.replies.map((reply) => (
                  <li key={reply._id}>
                    <div className="discussion-meta">
                      <strong>{reply.user?.name || 'Student'}</strong>
                      <span>{formatTime(reply.createdAt)}</span>
                    </div>
                    <p>{reply.message}</p>
                  </li>
                ))}
              </ul>
            ) : null}

            <form
              className="discussion-reply-form"
              onSubmit={(event) => handleReply(event, thread._id)}
            >
              <input
                type="text"
                value={replyDrafts[thread._id] || ''}
                onChange={(event) =>
                  setReplyDrafts((prev) => ({
                    ...prev,
                    [thread._id]: event.target.value,
                  }))
                }
                placeholder="Write a reply"
              />
              <button type="submit" className="nav-button" disabled={posting}>
                Reply
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default LessonDiscussion;
