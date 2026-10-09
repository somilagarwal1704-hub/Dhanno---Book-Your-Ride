import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api, errorMessage } from "../../lib/api.js";
import { formatTime } from "../../lib/format.js";

/**
 * In-ride chat between rider and captain.
 * Messages are persisted server-side, so reopening the trip shows history.
 * `socket` must already be connected; the parent is responsible for ride:join.
 */
const ChatPanel = ({ open, onClose, rideId, socket, selfRole, otherName, onUnreadChange }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [typingFrom, setTypingFrom] = useState("");
  const listRef = useRef(null);
  const typingTimer = useRef(null);
  const sentTyping = useRef(false);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  // History
  useEffect(() => {
    if (!rideId) return;
    let cancelled = false;
    api
      .get(`/rides/${rideId}/messages`)
      .then(({ data }) => !cancelled && setMessages(data.messages))
      .catch((err) => !cancelled && setError(errorMessage(err, "Couldn't load chat")));
    return () => {
      cancelled = true;
    };
  }, [rideId]);

  // Live messages
  useEffect(() => {
    if (!socket) return undefined;
    const onMessage = (msg) => {
      if (msg.rideId !== rideId) return;
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      if (msg.senderRole !== selfRole) {
        setTypingFrom("");
        if (!openRef.current) onUnreadChange?.((n) => n + 1);
      }
    };
    const onTyping = (evt) => {
      if (evt.rideId !== rideId || evt.senderRole === selfRole) return;
      setTypingFrom(evt.typing ? evt.senderName || otherName : "");
    };
    socket.on("chat:message", onMessage);
    socket.on("chat:typing", onTyping);
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:typing", onTyping);
    };
  }, [socket, rideId, selfRole, otherName, onUnreadChange]);

  useEffect(() => {
    if (open) {
      onUnreadChange?.(0);
      scrollToEnd();
    }
  }, [open, messages.length, onUnreadChange, scrollToEnd]);

  const setTyping = (typing) => {
    if (!socket || sentTyping.current === typing) return;
    sentTyping.current = typing;
    socket.emit("chat:typing", { rideId, typing });
  };

  const onChange = (value) => {
    setDraft(value);
    setTyping(value.trim().length > 0);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 1500);
  };

  const send = (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setError("");
    setTyping(false);

    socket.timeout(8000).emit("chat:send", { rideId, text }, (err, response) => {
      setSending(false);
      if (err || !response?.ok) {
        setError(response?.message || "Message not delivered. Try again.");
        return;
      }
      setDraft("");
      setMessages((prev) =>
        prev.some((m) => m._id === response.message._id) ? prev : [...prev, response.message],
      );
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-label="Trip chat"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 flex h-[82%] max-w-xl flex-col overflow-hidden rounded-t-[1.75rem] border-t border-line bg-canvas shadow-card sm:mx-auto"
          >
            <header className="flex items-center gap-3 border-b border-line bg-surface px-5 py-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-ink">
                <i className="ri-chat-3-fill" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{otherName || "Trip chat"}</p>
                <p className="text-xs text-ink-2">
                  {typingFrom ? `${typingFrom} is typing...` : "Chat is private to this trip"}
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close chat" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2">
                <i className="ri-close-line text-lg" />
              </button>
            </header>

            <div ref={listRef} className="dh-no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <p className="py-10 text-center text-sm text-ink-3">
                  No messages yet. Say hi, or let them know where you are.
                </p>
              )}
              {messages.map((m) => {
                const mine = m.senderRole === selfRole;
                return (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        mine
                          ? "rounded-br-md bg-brand text-brand-ink"
                          : "rounded-bl-md bg-surface text-ink"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className={`mt-1 text-right text-[10px] ${mine ? "text-brand-ink/70" : "text-ink-3"}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {error && <p className="px-4 pb-1 text-center text-xs text-danger">{error}</p>}

            <form onSubmit={send} className="flex items-end gap-2 border-t border-line bg-surface px-4 py-3">
              <textarea
                value={draft}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) send(e);
                }}
                rows={1}
                maxLength={500}
                placeholder="Type a message"
                className="max-h-28 flex-1 resize-none rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                aria-label="Send message"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-canvas transition active:scale-95 disabled:opacity-40"
              >
                {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <i className="ri-send-plane-fill" />}
              </button>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;
