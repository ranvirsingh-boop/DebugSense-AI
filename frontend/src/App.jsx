import React, { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://debugsense-ai-xoft.onrender.com";

function App() {
  const [language, setLanguage] = useState("JavaScript");

  const [code, setCode] = useState(
    `const users = undefined;

users.map(user => {
  console.log(user);
});`
  );

  const [errorMessage, setErrorMessage] = useState(
    "TypeError: Cannot read properties of undefined (reading 'map')"
  );

  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(false);

  const [connectionError, setConnectionError] = useState("");

  const analyzeError = async () => {
    if (!code.trim()) {
      setConnectionError("Please enter your code.");
      return;
    }

    if (!errorMessage.trim()) {
      setConnectionError("Please enter the error message.");
      return;
    }

    if (!language.trim()) {
      setConnectionError("Please select a programming language.");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setConnectionError("");

    try {
      const response = await fetch(`${API_URL}/api/debug`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          code: code,
          error: errorMessage,
          language: language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to analyze the code."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Unable to analyze the code."
        );
      }

      setAnalysis(data.result);
    } catch (error) {
      console.error("DebugSense AI Error:", error);

      setConnectionError(
        error.message ||
          "Unable to connect to the DebugSense backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setErrorMessage("");
    setLanguage("JavaScript");
    setAnalysis(null);
    setConnectionError("");
  };

  const renderAnalysis = () => {
    if (!analysis) {
      return null;
    }

    if (typeof analysis === "string") {
      return (
        <div className="result-card">
          <div className="result-header">
            <h2>🤖 AI Analysis</h2>
          </div>

          <div className="result-content">
            <pre className="analysis-text">
              {analysis}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="result-card">
        <div className="result-header">
          <h2>🤖 AI Analysis</h2>
        </div>

        <div className="result-content">

          {analysis.analysis && (
            <div className="result-section">
              <h3>Analysis</h3>

              <p>{analysis.analysis}</p>
            </div>
          )}

          {analysis.explanation && (
            <div className="result-section">
              <h3>Explanation</h3>

              <p>{analysis.explanation}</p>
            </div>
          )}

          {analysis.error && (
            <div className="result-section">
              <h3>Error</h3>

              <p>{analysis.error}</p>
            </div>
          )}

          {analysis.solution && (
            <div className="result-section">
              <h3>Solution</h3>

              <p>{analysis.solution}</p>
            </div>
          )}

          {analysis.fixedCode && (
            <div className="result-section">
              <h3>Corrected Code</h3>

              <pre>{analysis.fixedCode}</pre>
            </div>
          )}

          {analysis.correctedCode && (
            <div className="result-section">
              <h3>Corrected Code</h3>

              <pre>{analysis.correctedCode}</pre>
            </div>
          )}

          {analysis.suggestions && (
            <div className="result-section">
              <h3>Suggestions</h3>

              {Array.isArray(analysis.suggestions) ? (
                <ul>
                  {analysis.suggestions.map(
                    (suggestion, index) => (
                      <li key={index}>
                        {suggestion}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>{analysis.suggestions}</p>
              )}
            </div>
          )}

          {!analysis.analysis &&
            !analysis.explanation &&
            !analysis.error &&
            !analysis.solution &&
            !analysis.fixedCode &&
            !analysis.correctedCode &&
            !analysis.suggestions && (
              <pre>
                {JSON.stringify(
                  analysis,
                  null,
                  2
                )}
              </pre>
            )}

        </div>
      </div>
    );
  };

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="logo-section">

          <div className="logo-icon">
            DS
          </div>

          <div>
            <h1>
              DebugSense AI
            </h1>

            <p>
              Intelligent Code Debugging Assistant
            </p>
          </div>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          SYSTEM ONLINE

        </div>

      </header>


      {/* MAIN */}

      <main className="main-container">

        {/* HERO */}

        <section className="hero">

          <div className="hero-badge">
            ✦ AI-POWERED DEBUGGING SYSTEM
          </div>

          <h2>
            Find the Bug.
            <span>
              Understand the Fix.
            </span>
          </h2>

          <p>
            DebugSense AI analyzes your code,
            identifies the underlying error,
            explains why it happened, and helps
            you understand the corrected solution.
          </p>

        </section>


        {/* CODE INPUT */}

        <section className="panel">

          <div className="panel-title">

            <div>

              <span className="panel-number">
                01
              </span>

              <span>
                CODE INPUT
              </span>

            </div>

            <span>
              REQUIRED
            </span>

          </div>


          <div className="field">

            <label>
              PROGRAMMING LANGUAGE
            </label>

            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
            >

              <option value="JavaScript">
                JavaScript
              </option>

              <option value="Python">
                Python
              </option>

              <option value="Java">
                Java
              </option>

              <option value="C">
                C
              </option>

              <option value="C++">
                C++
              </option>

              <option value="C#">
                C#
              </option>

              <option value="TypeScript">
                TypeScript
              </option>

              <option value="PHP">
                PHP
              </option>

            </select>

          </div>


          <div className="field">

            <label>
              SOURCE CODE
            </label>

            <textarea
              className="code-input"
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              placeholder="// Paste your code here..."
              spellCheck="false"
            />

          </div>

        </section>


        {/* ERROR INFORMATION */}

        <section className="panel">

          <div className="panel-title">

            <div>

              <span className="panel-number">
                02
              </span>

              <span>
                ERROR INFORMATION
              </span>

            </div>

            <span>
              REQUIRED
            </span>

          </div>


          <div className="field">

            <label>
              ERROR MESSAGE
            </label>

            <textarea
              value={errorMessage}
              onChange={(e) =>
                setErrorMessage(e.target.value)
              }
              placeholder="Paste the error message here..."
            />

          </div>

        </section>


        {/* CONNECTION ERROR */}

        {connectionError && (

          <div className="api-error">

            <strong>
              ⚠ SYSTEM MESSAGE
            </strong>

            <p>
              {connectionError}
            </p>

          </div>

        )}


        {/* BUTTONS */}

        <div className="actions">

          <button
            className="clear-button"
            onClick={clearAll}
            disabled={loading}
          >
            CLEAR
          </button>


          <button
            className="analyze-button"
            onClick={analyzeError}
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="spinner"></span>
                ANALYZING...
              </>
            ) : (
              <>
                ✦ &nbsp; ANALYZE ERROR
              </>
            )}

          </button>

        </div>


        {/* AI RESULT */}

        {analysis && renderAnalysis()}

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <span>
          DEBUGSENSE AI
        </span>

        <span>
          AI CODE ANALYSIS SYSTEM
        </span>

        <span>
          VERCEL × RENDER
        </span>

      </footer>

    </div>
  );
}

export default App;