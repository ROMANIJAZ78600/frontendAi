import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://backendai-swart.vercel.app/api/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            history: messages.map((msg) => ({
              role: msg.role,
              parts: [
                {
                  text: msg.content,
                },
              ],
            })),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "auto",
          background: "white",
          borderRadius: "15px",
          padding: "25px",
          minHeight: "80vh",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#000" }}>🤖 AI Assistant</h1>

        <hr />

        {/* Messages */}
        <div
          style={{
            minHeight: "55vh",
            padding: "20px 0",
          }}
        >
          {messages.length === 0 && (
            <p style={{ textAlign: "center", color: "gray" }}>
              Ask me anything...
            </p>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                padding: "15px",
                borderRadius: "10px",
                background: msg.role === "user" ? "#e8f0fe" : "#f1f1f1",
              }}
            >
              <strong>{msg.role === "user" ? "👤 You" : "🤖 AI"}</strong>

              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");

                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        style={{
                          background: "#eee",
                          padding: "3px 6px",
                          borderRadius: "5px",
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}

          {loading && <p>🤖 AI is thinking...</p>}
        </div>

        {/* Input */}
        <textarea
          rows="3"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            padding: "12px",
            boxSizing: "border-box",
            borderRadius: "10px",
            border: "1px solid #ccc",
            resize: "none",
          }}
        />

        <button
          onClick={askAI}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "12px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Thinking..." : "Send 🚀"}
        </button>

        <p
          style={{
            textAlign: "center",
            color: "gray",
            fontSize: "12px",
          }}
        >
          Enter = Send | Shift + Enter = New line
        </p>
      </div>
    </div>
  );
}

export default App;
