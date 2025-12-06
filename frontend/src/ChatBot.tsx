import React, { useState } from "react";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:10000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ answer: "Backend error" });
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      sendMessage();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          background: "white",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "white",
              margin: "0 0 8px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "40px" }}>🧠</span> AI Database Query Bot
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "15px", margin: 0 }}>
            Ask questions in natural language and get instant database insights
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: "32px" }}>
          {/* Input Section */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#334155",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Your Question
            </label>
            <textarea
              rows={4}
              placeholder="Ask something like: 'Show all projects' or 'List tasks assigned to Malik'…"
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "15px",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                resize: "vertical",
                fontFamily: "inherit",
                transition: "all 0.2s",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#f8fafc",
                color: "#1e293b",
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.backgroundColor = "white";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.backgroundColor = "#f8fafc";
              }}
            />
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
              Press Ctrl+Enter to submit
            </div>
          </div>

          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading
                ? "#cbd5e1"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              transition: "all 0.3s",
              boxShadow: loading
                ? "none"
                : "0 4px 20px rgba(102, 126, 234, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            <span style={{ fontSize: "20px" }}>{loading ? "⏳" : "🚀"}</span>
            {loading ? "Processing..." : "Ask AI"}
          </button>

          {/* Response Section */}
          {response && (
            <div style={{ marginTop: "32px" }}>
              {/* AI Answer */}
              <div
                style={{
                  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  padding: "24px",
                  borderRadius: "16px",
                  marginBottom: "20px",
                  border: "2px solid #93c5fd",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    🤖
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                    }}
                  >
                    AI Answer
                  </h3>
                </div>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: "15px",
                    lineHeight: "1.7",
                    color: "#1e293b",
                  }}
                >
                  {response.answer}
                </div>
              </div>

              {/* SQL Output */}
              <div
                style={{
                  background: "#0f172a",
                  padding: "24px",
                  borderRadius: "16px",
                  marginBottom: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    📝
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#94a3b8",
                    }}
                  >
                    Generated SQL
                  </h3>
                </div>
                <div
                  style={{
                    background: "#1e293b",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #334155",
                  }}
                >
                  <pre
                    style={{
                      color: "#10b981",
                      fontSize: "14px",
                      fontFamily: "'Consolas', 'Monaco', monospace",
                      margin: 0,
                      lineHeight: "1.6",
                      overflowX: "auto",
                    }}
                  >
                    {response.sql}
                  </pre>
                </div>
              </div>

              {/* Table Section */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    📊
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#334155",
                    }}
                  >
                    Data Results
                  </h3>
                </div>

                {response.data && response.data.length > 0 ? (
                  <div style={{ overflowX: "auto", borderRadius: "12px" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        background: "white",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <thead>
                        <tr>
                          {Object.keys(response.data[0]).map((col) => (
                            <th
                              key={col}
                              style={{
                                background:
                                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                padding: "16px 20px",
                                textAlign: "left",
                                fontWeight: "700",
                                fontSize: "13px",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {response.data.map((row: any, index: number) => (
                          <tr
                            key={index}
                            style={{
                              background:
                                index % 2 === 0 ? "#ffffff" : "#f8fafc",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              e.currentTarget.style.transform = "scale(1.01)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                index % 2 === 0 ? "#ffffff" : "#f8fafc";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            {Object.values(row).map((value: any, i: number) => (
                              <td
                                key={i}
                                style={{
                                  padding: "14px 20px",
                                  color: "#334155",
                                  fontSize: "14px",
                                  borderBottom:
                                    index === response.data.length - 1
                                      ? "none"
                                      : "1px solid #e2e8f0",
                                  fontWeight: "500",
                                }}
                              >
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                      📭
                    </div>
                    No data found for this query.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;