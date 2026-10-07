import React, { useState } from "react";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "https://debugsense-ai-xoft.onrender.com";

function App() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const analyzeError = async () => {
    if (!code.trim()) {
      setMessage("Please enter your code.");
      return;
    }

    if (!error.trim()) {
      setMessage("Please enter the error message.");
      return;
    }

    setLoading(true);
    setResult("");
    setMessage("");

    try {
      const apiUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/debug`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          error,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Server error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Unable to analyze the code."
        );
      }

      setResult(
        typeof data.result === "string"
          ? data.result
          : JSON.stringify(data.result, null, 2)
      );
    } catch (err) {
      console.error("DebugSense error:", err);

      setMessage(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setError("");
    setResult("");
    setMessage("");
  };

  /*
   * Convert the AI's markdown response into
   * readable sections.
   */
  const formatAIResponse = (text) => {
    if (!text) return null;

    const sections = [];

    const cleaned = text
      .replace(/\r\n/g, "\n")
      .replace(/```[a-zA-Z0-9+#.-]*/g, "```");

    const parts = cleaned.split("```");

    let normalText = parts[0] || "";

    const codeBlocks = [];

    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i]) {
        codeBlocks.push(parts[i].trim());
      }
    }

    /*
     * Look for common headings from AI responses.
     */
    const headingRegex =
      /(Problem|Issue|Cause|Why.*?(?:happened|occurs)|Explanation|Solution|Fix|Corrected Code|Correct Code|How to Fix|Recommendation)/gi;

    const lines = normalText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let currentHeading = "Analysis";
    let currentContent = [];

    const flushSection = () => {
      if (currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n"),
        });
      }
    };

    lines.forEach((line) => {
      const match = line.match(
        /^(?:#+\s*|[-*]\s*)?(Problem|Issue|Cause|Explanation|Solution|Fix|Corrected Code|Correct Code|How to Fix|Recommendation)\s*:?\s*(.*)$/i
      );

      if (match) {
        flushSection();

        currentHeading = match[1];

        currentContent = match[2]
          ? [match[2]]
          : [];

        return;
      }

      currentContent.push(line);
    });

    flushSection();

    /*
     * If the AI didn't use headings, display the
     * entire response cleanly as one explanation.
     */
    if (sections.length === 0 && normalText.trim()) {
      sections.push({
        heading: "AI Analysis",
        content: normalText.trim(),
      });
    }

    return (
      <div className="ai-result">

        {sections.map((section, index) => (
          <div className="ai-section" key={index}>

            <div className="ai-section-title">
              {section.heading === "Problem" && "🔍"}
              {section.heading === "Issue" && "🔍"}
              {section.heading === "Cause" && "⚙️"}
              {section.heading === "Explanation" && "📖"}
              {section.heading === "Solution" && "✅"}
              {section.heading === "Fix" && "✅"}
              {section.heading === "Recommendation" && "💡"}
              {section.heading === "How to Fix" && "🛠️"}
              {![
                "Problem",
                "Issue",
                "Cause",
                "Explanation",
                "Solution",
                "Fix",
                "Recommendation",
                "How to Fix",
              ].includes(section.heading) && "✦"}

              <span>{section.heading}</span>
            </div>

            <div className="ai-section-content">
              {section.content}
            </div>
          </div>
        ))}

        {codeBlocks.length > 0 && (
          <div className="corrected-code-section">

            <div className="corrected-code-header">
              <div>
                <span className="code-check">✓</span>
                <span>Corrected Code</span>
              </div>

              <span className="code-language">
                {language}
              </span>
            </div>

            {codeBlocks.map((block, index) => (
              <div className="corrected-code" key={index}>
                <pre>
                  <code>{block}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">
            &lt;/&gt;
          </div>

          <div>
            <div className="brand-name">
              DebugSense<span> AI</span>
            </div>

            <div className="brand-subtitle">
              Intelligent Code Debugging
            </div>
          </div>
        </div>

        <div className="online">
          <span className="online-dot"></span>
          SYSTEM ONLINE
        </div>
      </nav>

      {/* MAIN */}
      <main className="main">

        {/* HERO */}
        <section className="hero">

          <div className="hero-tag">
            <span>✦</span>
            AI POWERED DEBUGGING
          </div>

          <h1>
            Find the bug.
            <br />
            <span>Fix the code.</span>
          </h1>

          <p>
            Paste your code and error message.
            DebugSense AI analyzes the problem
            and provides a clear solution.
          </p>

        </section>

        {/* INPUTS */}
        <section className="workspace">

          {/* CODE */}
          <div className="panel">

            <div className="panel-top">

              <div className="panel-title">

                <div className="step">
                  01
                </div>

                <div>
                  <h2>CODE</h2>

                  <p>
                    Enter the code causing the problem
                  </p>
                </div>

              </div>

              <span className="required">
                REQUIRED
              </span>

            </div>

            <div className="field">

              <label>
                LANGUAGE
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
                }
              >
                <option>JavaScript</option>
                <option>Python</option>
                <option>Java</option>
                <option>C</option>
                <option>C++</option>
                <option>C#</option>
                <option>TypeScript</option>
                <option>PHP</option>
                <option>Go</option>
                <option>Rust</option>
              </select>

            </div>

            <div className="field">

              <div className="label-row">

                <label>
                  YOUR CODE
                </label>

                <span className="hint">
                  Paste your code here
                </span>

              </div>

              <div className="editor">

                <div className="editor-bar">

                  <div className="traffic-lights">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <span className="editor-language">
                    {language}
                  </span>

                </div>

                <textarea
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value)
                  }
                  placeholder={`const users = undefined;

users.map(user => {
  console.log(user);
});`}
                  spellCheck="false"
                />

              </div>

            </div>

          </div>

          {/* ERROR */}
          <div className="panel">

            <div className="panel-top">

              <div className="panel-title">

                <div className="step">
                  02
                </div>

                <div>
                  <h2>ERROR</h2>

                  <p>
                    Paste the exact error message
                  </p>
                </div>

              </div>

              <span className="required">
                REQUIRED
              </span>

            </div>

            <div className="field">

              <div className="label-row">

                <label>
                  ERROR MESSAGE
                </label>

                <span className="hint">
                  From your compiler or console
                </span>

              </div>

              <div className="error-editor">

                <textarea
                  value={error}
                  onChange={(e) =>
                    setError(e.target.value)
                  }
                  placeholder="TypeError: Cannot read properties of undefined (reading 'map')"
                  spellCheck="false"
                />

              </div>

            </div>

            <div className="error-tip">

              <span>💡</span>

              <div>
                <strong>Tip</strong>

                <p>
                  Copy the complete error message,
                  including the line number if available.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ERROR MESSAGE */}
        {message && (
          <div className="message-box">

            <span>⚠</span>

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>
                {message}
              </p>
            </div>

          </div>
        )}

        {/* BUTTONS */}
        <div className="actions">

          <button
            className="clear-btn"
            onClick={clearAll}
            disabled={loading}
          >
            CLEAR
          </button>

          <button
            className="analyze-btn"
            onClick={analyzeError}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                ANALYZING...
              </>
            ) : (
              <>✦ ANALYZE ERROR</>
            )}
          </button>

        </div>

        {/* AI RESULT */}
        {result && (
          <section className="result-panel">

            <div className="result-top">

              <div className="result-heading">

                <div className="result-icon">
                  ✓
                </div>

                <div>

                  <div className="result-label">
                    03 — AI ANALYSIS
                  </div>

                  <h2>
                    Debugging Analysis
                  </h2>

                </div>

              </div>

              <div className="result-status">
                ANALYSIS COMPLETE
              </div>

            </div>

            <div className="result-body">
              {formatAIResponse(result)}
            </div>

          </section>
        )}

        <div className="security-note">
          <span>●</span>
          Your code is analyzed securely through DebugSense AI
        </div>

      </main>

      <footer className="footer">

        <span>
          DEBUGSENSE AI © 2026
        </span>

        <span>
          Built for developers
        </span>

      </footer>

    </div>
  );
}

export default App;