import { useEffect, useState } from "react";
import { Pencil, Send, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from "../api/comment.api";
import { useApi } from "../hooks";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

export default function CommentSection({ videoId }) {
  const user = useSelector((state) => state.auth.user);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const addApi = useApi(addComment);

  async function loadComments() {
    setLoading(true);
    setError("");
    try {
      const result = await getComments(videoId, { page: 1, limit: 50 });
      setComments(result.data.comments || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load comments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [videoId]);

  async function submitComment(event) {
    event.preventDefault();
    if (!text.trim()) return;

    try {
      const result = await addApi.execute(videoId, text.trim());
      setComments((current) => [result.data, ...current]);
      setText("");
    } catch {
      // useApi exposes the message through addApi.error.
      throw error;
    }
  }

  async function saveEdit(commentId) {
    if (!editText.trim()) return;
    try {
      await updateComment(commentId, editText.trim());
      setComments((current) =>
        current.map((comment) =>
          comment._id === commentId
            ? { ...comment, content: editText.trim() }
            : comment,
        ),
      );
      setEditingId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update comment");
    }
  }

  async function removeComment(commentId) {
    try {
      await deleteComment(commentId);
      setComments((current) =>
        current.filter((comment) => comment._id !== commentId),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete comment");
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-white">Comments</h2>

      <form onSubmit={submitComment} className="mt-4 flex gap-3">
        <img
          src={user?.avatar}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full bg-zinc-800 object-cover"
        />
        <div className="flex flex-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 focus-within:border-zinc-600">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Add a comment..."
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
          />
          <button
            disabled={addApi.loading}
            className="px-4 text-zinc-300 hover:text-white disabled:opacity-50"
            aria-label="Add comment"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      <ErrorMessage message={error || addApi.error} />

      {loading ? (
        <Loading label="Loading comments..." />
      ) : (
        <div className="mt-5 space-y-5">
          {comments.length === 0 && (
            <p className="text-sm text-zinc-500">No comments yet.</p>
          )}
          {comments.map((comment) => {
            const isOwner = String(comment.owner) === String(user?._id);
            return (
              <article key={comment._id} className="flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-800" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-500">
                    {isOwner ? "You" : "TubeX user"}
                  </p>
                  {editingId === comment._id ? (
                    <div className="mt-1 flex gap-2">
                      <input
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(comment._id)}
                        className="rounded-lg bg-white px-3 text-xs font-semibold text-black"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
                      {comment.content}
                    </p>
                  )}
                  {isOwner && (
                    <div className="mt-2 flex gap-2">
                      
                      <button
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditText(comment.content);
                        }}
                        className="text-xs text-zinc-500 hover:text-white"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => removeComment(comment._id)}
                        className="text-xs text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
