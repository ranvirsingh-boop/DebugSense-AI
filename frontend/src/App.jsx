import React, { useState } from "react";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://debugsense-ai-xoft.onrender.com";

function App() {
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [copied, setCopied] = useState(false);

  const analyzeError = async () => {
    setMessage("");
    setResult(null);
    setCopied(false);

    if (!code.trim()) {
      setMessage("Please enter your source code.");
      return;
    }

    if (!error.trim()) {
      setMessage("Please enter the error message.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/debug`, {
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
          data.message || "Unable to analyze the code."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Unable to analyze the code."
        );
      }

      let analysis = data.result;

      /*
       * The backend may return the analysis as:
       * 1. An object
       * 2. A JSON string
       * 3. A string containing JSON
       *
       * This handles all three cases.
       */

      if (typeof analysis === "string") {
        try {
          analysis = JSON.parse(analysis);
        } catch {
          analysis = {
            explanation: analysis,
          };
        }
      }

      setResult(analysis);
    } catch (err) {
      console.error("DebugSense AI Error:", err);

      setMessage(
        err.message || "Failed to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setError("");
    setResult(null);
    setMessage("");
    setCopied(false);
  };

  const copyCorrectedCode = async () => {
    if (!result?.fixedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        formatCode(result.fixedCode)
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  /*
   * Makes sure escaped newline characters such as:
   *
   * \n
   *
   * become actual lines in the code editor.
   */
  const formatCode = (value) => {
    if (!value) {
      return "";
    }

    let formatted = String(value);

    formatted = formatted.replace(/\\n/g, "\n");
    formatted = formatted.replace(/\\r/g, "\r");
    formatted = formatted.replace(/\\t/g, "\t");

    formatted = formatted.replace(/\\"/g, '"');
    formatted = formatted.replace(/\\'/g, "'");

    return formatted.trim();
  };

  const getSeverityClass = (severity) => {
    if (!severity) {
      return "";
    }

    const value = severity.toLowerCase();

    if (value === "high") {
      return "severity-high";
    }

    if (value === "medium") {
      return "severity-medium";
    }

    if (value === "low") {
      return "severity-low";
    }

    return "";
  };

  const displayValue = (value) => {
    if (value === undefined || value === null) {
      return "Not available";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <nav className="navbar">

        <div className="brand">

          <div className="brand-icon">
            DS
          </div>

          <div>
            <div className="brand-name">
              Debug<span>Sense</span> AI
            </div>

            <div className="brand-subtitle">
              INTELLIGENT CODE DEBUGGER
            </div>
          </div>

        </div>

        <div className="online">
          <span className="online-dot"></span>
          SYSTEM ONLINE
        </div>

      </nav>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="main">

        {/* HERO */}

        <section className="hero">

          <div className="hero-tag">
            <span>✦</span>
            AI-POWERED DEBUGGING
          </div>

          <h1>
            Debug Your Code.
            <br />
            <span>Understand the Error.</span>
          </h1>

          <p>
            Paste your code and error message. DebugSense AI
            analyzes the problem, explains the root cause,
            suggests a fix, and generates corrected code.
          </p>

        </section>


        {/* =================================================
            WORKSPACE
            ================================================= */}

        <section className="workspace">

          {/* CODE PANEL */}

          <div className="panel">

            <div className="panel-top">

              <div className="panel-title">

                <div className="step">
                  01
                </div>

                <div>
                  <h2>
                    SOURCE CODE
                  </h2>

                  <p>
                    Enter the code containing the error
                  </p>
                </div>

              </div>

              <div className="required">
                REQUIRED
              </div>

            </div>


            {/* LANGUAGE */}

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
                <option>JavaScript</option>
                <option>Python</option>
                <option>Java</option>
                <option>C</option>
                <option>C++</option>
                <option>C#</option>
                <option>PHP</option>
                <option>TypeScript</option>
              </select>

            </div>


            {/* SOURCE CODE */}

            <div className="field">

              <div className="label-row">

                <label>
                  SOURCE CODE
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

                  <div className="editor-language">
                    {language.toUpperCase()}
                  </div>

                </div>

                <textarea
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value)
                  }
                  placeholder={`Paste your ${language} code here...`}
                  spellCheck="false"
                />

              </div>

            </div>

          </div>


          {/* ERROR PANEL */}

          <div className="panel">

            <div className="panel-top">

              <div className="panel-title">

                <div className="step">
                  02
                </div>

                <div>
                  <h2>
                    ERROR INFORMATION
                  </h2>

                  <p>
                    Tell us what went wrong
                  </p>
                </div>

              </div>

              <div className="required">
                REQUIRED
              </div>

            </div>


            <div className="field">

              <div className="label-row">

                <label>
                  ERROR MESSAGE
                </label>

                <span className="hint">
                  Include the complete error
                </span>

              </div>

              <div className="error-editor">

                <textarea
                  value={error}
                  onChange={(e) =>
                    setError(e.target.value)
                  }
                  placeholder="Example: TypeError: Cannot read properties of undefined..."
                  spellCheck="false"
                />

              </div>

            </div>


            <div className="error-tip">

              <span>ⓘ</span>

              <div>

                <strong>
                  FOR BETTER RESULTS
                </strong>

                <p>
                  Provide the complete error message
                  along with the source code that caused it.
                </p>

              </div>

            </div>

          </div>


          {/* SYSTEM MESSAGE */}

          {message && (
            <div className="message-box">

              <span>⚠</span>

              <div>

                <strong>
                  SYSTEM MESSAGE
                </strong>

                <p>
                  {message}
                </p>

              </div>

            </div>
          )}


          {/* ACTION BUTTONS */}

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
                <>
                  ✦ &nbsp; ANALYZE ERROR
                </>
              )}

            </button>

          </div>


          {/* =================================================
              RESULT
              ================================================= */}

          {result && (

            <section className="result-panel">

              {/* RESULT HEADER */}

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

                <div className="ai-result">


                  {/* =========================================
                      ERROR INFORMATION
                      ========================================= */}

                  <div className="ai-section">

                    <div className="ai-section-title">
                      ✦ ERROR INFORMATION
                    </div>

                    <div className="error-info-grid">

                      <div className="info-card">

                        <div className="info-card-label">
                          ERROR TYPE
                        </div>

                        <div className="info-card-value">
                          {displayValue(
                            result.errorType
                          )}
                        </div>

                      </div>


                      <div className="info-card">

                        <div className="info-card-label">
                          SEVERITY
                        </div>

                        <div
                          className={`info-card-value ${getSeverityClass(
                            result.severity
                          )}`}
                        >
                          {displayValue(
                            result.severity
                          )}
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* =========================================
                      ROOT CAUSE
                      ========================================= */}

                  <div className="ai-section">

                    <div className="ai-section-title">
                      ⌁ ROOT CAUSE
                    </div>

                    <div className="ai-section-content">
                      {displayValue(
                        result.rootCause
                      )}
                    </div>

                  </div>


                  {/* =========================================
                      EXPLANATION
                      ========================================= */}

                  <div className="ai-section">

                    <div className="ai-section-title">
                      ◈ EXPLANATION
                    </div>

                    <div className="ai-section-content">
                      {displayValue(
                        result.explanation
                      )}
                    </div>

                  </div>


                  {/* =========================================
                      SUGGESTED FIX
                      SEPARATE SECTION
                      ========================================= */}

                  <div className="suggested-fix-section">

                    <div className="suggested-fix-header">

                      <div className="suggested-fix-title">

                        <div className="fix-icon">
                          💡
                        </div>

                        <div>

                          <div className="fix-label">
                            RECOMMENDED SOLUTION
                          </div>

                          <h3>
                            Suggested Fix
                          </h3>

                        </div>

                      </div>

                    </div>


                    <div className="suggested-fix-body">

                      {displayValue(
                        result.suggestedFix
                      )}

                    </div>

                  </div>


                  {/* =========================================
                      CORRECTED CODE
                      SEPARATE SECTION
                      ========================================= */}

                  {result.fixedCode && (

                    <div className="corrected-code-section">

                      <div className="corrected-code-header">

                        <div className="corrected-code-title">

                          <div className="code-check">
                            ✓
                          </div>

                          <span>
                            CORRECTED CODE
                          </span>

                        </div>


                        <div className="corrected-code-actions">

                          <span className="code-language">
                            {language}
                          </span>

                          <button
                            className={`copy-code-btn ${
                              copied ? "copied" : ""
                            }`}
                            onClick={
                              copyCorrectedCode
                            }
                          >
                            {copied
                              ? "✓ COPIED"
                              : "COPY CODE"}
                          </button>

                        </div>

                      </div>


                      <div className="corrected-code">

                        <pre>
                          <code>
                            {formatCode(
                              result.fixedCode
                            )}
                          </code>
                        </pre>

                      </div>

                    </div>

                  )}


                  {/* =========================================
                      PREVENTION TIP
                      ========================================= */}

                  {result.preventionTip && (

                    <div className="ai-section">

                      <div className="ai-section-title">
                        🛡 PREVENTION TIP
                      </div>

                      <div className="ai-section-content">
                        {displayValue(
                          result.preventionTip
                        )}
                      </div>

                    </div>

                  )}


                  {/* DEMO MODE */}

                  {result.demoMode === true && (

                    <div className="demo-note">

                      Demo Mode is currently active.
                      The displayed analysis is based on
                      the available demonstration scenarios.

                    </div>

                  )}

                </div>

              </div>

            </section>

          )}

        </section>


        {/* SECURITY */}

        <div className="security-note">

          <span>●</span>

          Your code is analyzed securely through
          DebugSense AI.

        </div>

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <span>
          DEBUGSENSE AI
        </span>

        <span>
          INTELLIGENT DEBUGGING PLATFORM
        </span>

      </footer>

    </div>
  );
}

export default App;