
import { useEffect, useState } from "react";

// =========================================================
// API CONFIGURATION
// Local:
// http://localhost:5000/api/debug
//
// Production:
// Vercel will use VITE_API_URL from its environment variables
// =========================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/debug";

// =========================================================
// DEMO EXAMPLES
// =========================================================

const examples = [
  {
    id: 1,
    title: "Python IndexError",
    language: "Python",
    code: `numbers = [10, 20, 30]

for i in range(4):
    print(numbers[i])`,
    error: "IndexError: list index out of range",
  },

  {
    id: 2,
    title: "Python NameError",
    language: "Python",
    code: `print(username)`,
    error: "NameError: name 'username' is not defined",
  },

  {
    id: 3,
    title: "JavaScript TypeError",
    language: "JavaScript",
    code: `const user = undefined;

console.log(user.name);`,
    error: "TypeError: Cannot read properties of undefined",
  },
];

// =========================================================
// APP
// =========================================================

function App() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("Python");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // =======================================================
  // LOAD HISTORY
  // =======================================================

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(
        "debugsense-history"
      );

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error(
        "Could not load history:",
        err
      );
    }
  }, []);

  // =======================================================
  // SAVE HISTORY
  // =======================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "debugsense-history",
        JSON.stringify(history)
      );
    } catch (err) {
      console.error(
        "Could not save history:",
        err
      );
    }
  }, [history]);

  // =======================================================
  // LOAD DEMO EXAMPLE
  // =======================================================

  const loadExample = (example) => {
    setLanguage(example.language);
    setCode(example.code);
    setError(example.error);

    setResult(null);
    setApiError("");
    setCopied(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =======================================================
  // CLEAR INPUTS
  // =======================================================

  const clearAll = () => {
    setCode("");
    setError("");
    setResult(null);
    setApiError("");
    setCopied(false);
  };

  // =======================================================
  // ANALYZE CODE
  // =======================================================

  const analyzeCode = async () => {
    setApiError("");
    setResult(null);
    setCopied(false);

    // Empty code validation
    if (!code.trim()) {
      setApiError(
        "Please enter some code before analyzing."
      );
      return;
    }

    // Empty error validation
    if (!error.trim()) {
      setApiError(
        "Please enter the error message."
      );
      return;
    }

    // Language validation
    if (!language.trim()) {
      setApiError(
        "Please select a programming language."
      );
      return;
    }

    setLoading(true);

    try {
      console.log(
        "Sending request to:",
        API_URL
      );

      const response = await fetch(API_URL, {
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

      console.log(
        "Backend response status:",
        response.status
      );

      // ---------------------------------------------------
      // Parse response
      // ---------------------------------------------------

      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "Invalid JSON response:",
          jsonError
        );

        throw new Error(
          "The server returned an invalid response."
        );
      }

      console.log(
        "Backend response:",
        data
      );

      // ---------------------------------------------------
      // Handle HTTP errors
      // ---------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to analyze the code."
        );
      }

      // ---------------------------------------------------
      // Extract debugging result
      // ---------------------------------------------------

      const analysis =
        data?.result ||
        data?.debugging ||
        data?.analysis ||
        data?.data ||
        data;

      if (
        !analysis ||
        typeof analysis !== "object"
      ) {
        throw new Error(
          "The API returned an invalid debugging result."
        );
      }

      // ---------------------------------------------------
      // Validate debugging response
      // ---------------------------------------------------

      const hasDebuggingData =
        analysis.errorType ||
        analysis.errorTypeName ||
        analysis.error_type ||
        analysis.rootCause ||
        analysis.root_cause ||
        analysis.explanation ||
        analysis.suggestedFix ||
        analysis.suggested_fix ||
        analysis.fixedCode ||
        analysis.fixed_code;

      if (!hasDebuggingData) {
        console.error(
          "Invalid debugging response:",
          data
        );

        throw new Error(
          "The API response does not contain valid debugging information."
        );
      }

      // ---------------------------------------------------
      // Display result
      // ---------------------------------------------------

      setResult(analysis);

      // ---------------------------------------------------
      // Save history
      // ---------------------------------------------------

      const historyItem = {
        id: Date.now(),

        language,

        errorType:
          analysis.errorType ||
          analysis.errorTypeName ||
          analysis.error_type ||
          "Unknown Error",

        timestamp:
          new Date().toLocaleString(),

        errorPreview: error.slice(0, 90),

        result: analysis,

        code,

        error,
      };

      setHistory((previous) => [
        historyItem,
        ...previous,
      ].slice(0, 10));

    } catch (err) {
      console.error(
        "Debug request failed:",
        err
      );

      // Network error
      if (
        err instanceof TypeError ||
        err.message?.includes(
          "Failed to fetch"
        )
      ) {
        setApiError(
          "Unable to connect to the backend. Make sure the backend is running."
        );
      } else {
        setApiError(
          err.message ||
            "Something went wrong while analyzing the code."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // COPY FIXED CODE
  // =======================================================

  const copyFixedCode = async () => {
    if (!result) {
      return;
    }

    const fixedCode =
      result.fixedCode ||
      result.fixed_code ||
      result.correctedCode ||
      result.corrected_code ||
      "";

    if (!fixedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        fixedCode
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );
    }
  };

  // =======================================================
  // OPEN HISTORY
  // =======================================================

  const openHistory = (item) => {
    setCode(item.code || "");
    setError(item.error || "");

    setLanguage(
      item.language || "Python"
    );

    setResult(item.result || null);
    setApiError("");
    setCopied(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =======================================================
  // CLEAR HISTORY
  // =======================================================

  const clearHistory = () => {
    setHistory([]);

    localStorage.removeItem(
      "debugsense-history"
    );
  };

  // =======================================================
  // GET RESULT VALUE
  // =======================================================

  const getValue = (
    object,
    keys,
    fallback = "Not available"
  ) => {
    if (!object) {
      return fallback;
    }

    for (const key of keys) {
      if (
        object[key] !== undefined &&
        object[key] !== null &&
        String(object[key]).trim() !== ""
      ) {
        return object[key];
      }
    }

    return fallback;
  };

  // =======================================================
  // RESULT DATA
  // =======================================================

  const errorType = getValue(
    result,
    [
      "errorType",
      "errorTypeName",
      "error_type",
    ]
  );

  const severity = getValue(
    result,
    [
      "severity",
      "errorSeverity",
    ]
  );

  const rootCause = getValue(
    result,
    [
      "rootCause",
      "root_cause",
    ]
  );

  const explanation = getValue(
    result,
    [
      "explanation",
      "details",
    ]
  );

  const suggestedFix = getValue(
    result,
    [
      "suggestedFix",
      "suggested_fix",
      "fix",
    ]
  );

  const fixedCode = getValue(
    result,
    [
      "fixedCode",
      "fixed_code",
      "correctedCode",
      "corrected_code",
    ],
    ""
  );

  const preventionTip = getValue(
    result,
    [
      "preventionTip",
      "prevention_tip",
    ]
  );

  // =======================================================
  // DEMO MODE
  // =======================================================

  const demoMode =
    result?.demoMode === true ||
    result?.demo === true ||
    result?.mode === "demo" ||
    result?.fallback === true ||
    result?.isDemo === true;

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="app">

      {/* =================================================
          SPACE PARTICLES
      ================================================= */}

      <div className="space-particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        <div className="nav-container">

          <div className="brand">

            <div className="brand-logo">
              <span>&lt;/&gt;</span>
            </div>

            <div>

              <h1>
                DebugSense <span>AI</span>
              </h1>

              <p>
                INTELLIGENT DEBUGGING SYSTEM
              </p>

            </div>

          </div>

          <div className="nav-status">

            <span className="status-dot"></span>

            SYSTEM ONLINE

          </div>

        </div>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main-container">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">

          <div className="hero-badge">
            <span>✦</span>
            AI-POWERED CODE ANALYSIS
          </div>

          <h2>
            Debug Smarter.
            <br />
            <span>Build Better.</span>
          </h2>

          <p>
            An intelligent debugging assistant that
            analyzes programming errors, identifies
            root causes, explains what went wrong,
            and generates corrected code.
          </p>

        </section>

        {/* =================================================
            DEMO EXAMPLES
        ================================================= */}

        <section className="demo-section">

          <div className="section-header">

            <div>

              <span className="eyebrow">
                QUICK LAUNCH
              </span>

              <h2>
                Try a Demo Scenario
              </h2>

            </div>

            <span className="demo-label">
              03 AVAILABLE TEST CASES
            </span>

          </div>

          <div className="demo-grid">

            {examples.map((example) => (

              <button
                key={example.id}
                className="demo-card"
                onClick={() =>
                  loadExample(example)
                }
              >

                <span className="demo-number">
                  0{example.id}
                </span>

                <div className="demo-content">

                  <h3>
                    {example.title}
                  </h3>

                  <p>
                    {example.error}
                  </p>

                </div>

                <span className="arrow">
                  →
                </span>

              </button>

            ))}

          </div>

        </section>

        {/* =================================================
            DEBUG WORKSPACE
        ================================================= */}

        <section className="workspace">

          <div className="section-header workspace-header">

            <div>

              <span className="eyebrow">
                DEBUG CONSOLE
              </span>

              <h2>
                Analyze Your Code
              </h2>

            </div>

            <div className="language-wrapper">

              <label htmlFor="language">
                PROGRAMMING LANGUAGE
              </label>

              <select
                id="language"
                value={language}
                onChange={(event) =>
                  setLanguage(
                    event.target.value
                  )
                }
              >

                <option value="Python">
                  Python
                </option>

                <option value="C">
                  C
                </option>

                <option value="C++">
                  C++
                </option>

                <option value="Java">
                  Java
                </option>

                <option value="JavaScript">
                  JavaScript
                </option>

                <option value="TypeScript">
                  TypeScript
                </option>

              </select>

            </div>

          </div>

          {/* =================================================
              SOURCE CODE
          ================================================= */}

          <div className="input-card">

            <div className="input-header">

              <div>

                <span className="input-icon">
                  ●
                </span>

                SOURCE CODE

                <span className="input-language">
                  {language}
                </span>

              </div>

              <span className="required-label">
                REQUIRED
              </span>

            </div>

            <textarea
              className="code-editor"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                )
              }
              placeholder={`// Paste your ${language} code here...

// Example:
// const user = undefined;
// console.log(user.name);`}
              spellCheck="false"
            />

          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          <div className="input-card error-input-card">

            <div className="input-header">

              <div>

                <span className="input-icon error-symbol">
                  !
                </span>

                ERROR MESSAGE

              </div>

              <span className="required-label">
                REQUIRED
              </span>

            </div>

            <textarea
              className="error-editor"
              value={error}
              onChange={(event) =>
                setError(
                  event.target.value
                )
              }
              placeholder="Paste the compiler or runtime error message here..."
              spellCheck="false"
            />

          </div>

          {/* =================================================
              API ERROR
          ================================================= */}

          {apiError && (

            <div className="api-error">

              <span>⚠</span>

              <p>
                {apiError}
              </p>

            </div>

          )}

          {/* =================================================
              ACTION BAR
          ================================================= */}

          <div className="action-bar">

            <button
              className="clear-button"
              onClick={clearAll}
              disabled={loading}
            >
              CLEAR
            </button>

            <button
              className="analyze-button"
              onClick={analyzeCode}
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="spinner"></span>
                  ANALYZING...
                </>

              ) : (

                <>
                  <span>✦</span>
                  ANALYZE ERROR
                </>

              )}

            </button>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="loading-message">

              <div className="loading-orbit">
                <span></span>
              </div>

              <div>

                <strong>
                  Analyzing your code...
                </strong>

                <p>
                  DebugSense AI is investigating
                  the error and identifying
                  the root cause.
                </p>

              </div>

            </div>

          )}

        </section>

        {/* =================================================
            RESULTS
        ================================================= */}

        <section className="results-section">

          <div className="section-header">

            <div>

              <span className="eyebrow">
                ANALYSIS OUTPUT
              </span>

              <h2>
                Debugging Results
              </h2>

            </div>

            {demoMode && (

              <div className="demo-mode">

                <span></span>
                DEMO MODE

              </div>

            )}

          </div>

          {result ? (

            <div className="results-content">

              <div className="result-grid">

                {/* ERROR TYPE */}

                <div className="result-card">

                  <div className="card-heading">

                    <div className="card-icon">
                      !
                    </div>

                    <h3>
                      ERROR TYPE
                    </h3>

                  </div>

                  <p>
                    {errorType}
                  </p>

                </div>

                {/* SEVERITY */}

                <div className="result-card severity-card">

                  <div className="card-heading">

                    <div className="card-icon">
                      ◈
                    </div>

                    <h3>
                      SEVERITY
                    </h3>

                  </div>

                  <p>
                    {severity}
                  </p>

                </div>

                {/* ROOT CAUSE */}

                <div className="result-card">

                  <div className="card-heading">

                    <div className="card-icon">
                      ◎
                    </div>

                    <h3>
                      ROOT CAUSE
                    </h3>

                  </div>

                  <p>
                    {rootCause}
                  </p>

                </div>

                {/* EXPLANATION */}

                <div className="result-card">

                  <div className="card-heading">

                    <div className="card-icon">
                      ?
                    </div>

                    <h3>
                      EXPLANATION
                    </h3>

                  </div>

                  <p>
                    {explanation}
                  </p>

                </div>

                {/* SUGGESTED FIX */}

                <div className="result-card">

                  <div className="card-heading">

                    <div className="card-icon">
                      ⚡
                    </div>

                    <h3>
                      SUGGESTED FIX
                    </h3>

                  </div>

                  <p>
                    {suggestedFix}
                  </p>

                </div>

                {/* PREVENTION */}

                <div className="result-card">

                  <div className="card-heading">

                    <div className="card-icon">
                      ✓
                    </div>

                    <h3>
                      PREVENTION TIP
                    </h3>

                  </div>

                  <p>
                    {preventionTip}
                  </p>

                </div>

              </div>

              {/* =================================================
                  FIXED CODE
              ================================================= */}

              <div className="fixed-code-card">

                <div className="fixed-code-header">

                  <div className="card-heading">

                    <div className="card-icon">
                      {"</>"}
                    </div>

                    <h3>
                      FIXED CODE
                    </h3>

                  </div>

                  <button
                    className="copy-button"
                    onClick={copyFixedCode}
                  >
                    {copied
                      ? "✓ COPIED"
                      : "COPY CODE"}
                  </button>

                </div>

                <pre>
                  <code>
                    {fixedCode ||
                      "No corrected code returned."}
                  </code>
                </pre>

              </div>

            </div>

          ) : (

            <div className="empty-results">

              <div className="brain-icon">
                ✦
              </div>

              <h3>
                AWAITING ANALYSIS
              </h3>

              <p>
                Enter your code and error
                message above, then launch
                the analysis engine.
              </p>

            </div>

          )}

        </section>

        {/* =================================================
            HISTORY
        ================================================= */}

        <section className="history-section">

          <div className="section-header">

            <div>

              <span className="eyebrow">
                LOCAL MEMORY
              </span>

              <h2>
                Recent Debugs
              </h2>

            </div>

            {history.length > 0 && (

              <button
                className="clear-history"
                onClick={clearHistory}
              >
                CLEAR HISTORY
              </button>

            )}

          </div>

          {history.length > 0 ? (

            <div className="history-list">

              {history.map((item) => (

                <button
                  className="history-item"
                  key={item.id}
                  onClick={() =>
                    openHistory(item)
                  }
                >

                  <div className="history-icon">
                    {"</>"}
                  </div>

                  <div className="history-content">

                    <div className="history-title">

                      <strong>
                        {item.errorType}
                      </strong>

                      <span>
                        {item.language}
                      </span>

                    </div>

                    <p>
                      {item.errorPreview}
                    </p>

                  </div>

                  <span className="history-time">
                    {item.timestamp}
                  </span>

                </button>

              ))}

            </div>

          ) : (

            <div className="empty-history">
              No debugging sessions yet.
              Your recent analyses will
              appear here.
            </div>

          )}

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <p>
          DebugSense AI • Intelligent
          Debugging Assistant
        </p>

        <p>
          MVP BUILD <span>v1.0</span>
        </p>

      </footer>

    </div>
  );
}

export default App;