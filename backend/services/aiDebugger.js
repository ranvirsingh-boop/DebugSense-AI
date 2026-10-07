const OpenAI = require("openai");

// Create OpenAI client only when an API key exists
const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey
  ? new OpenAI({
      apiKey: apiKey,
    })
  : null;

// ---------------------------------------------------------
// DEMO FALLBACK RESPONSES
// ---------------------------------------------------------

function getDemoResponse(code, error, language) {
  const errorText = error.toLowerCase();
  const codeText = code.toLowerCase();

  // Python IndexError
  if (
    language === "Python" &&
    errorText.includes("indexerror")
  ) {
    return {
      errorType: "IndexError",
      severity: "High",

      rootCause:
        "The program tries to access an index that does not exist in the list.",

      explanation:
        "The list contains three elements, so the valid indexes are 0, 1, and 2. The range(4) loop also generates index 3. When the program tries to access numbers[3], Python raises an IndexError.",

      suggestedFix:
        "Use the length of the list when generating indexes.",

      fixedCode: `numbers = [10, 20, 30]

for i in range(len(numbers)):
    print(numbers[i])`,

      preventionTip:
        "Use len() when iterating through list indexes to avoid accessing indexes outside the valid range.",

      demoMode: true,
    };
  }

  // Python NameError
  if (
    language === "Python" &&
    errorText.includes("nameerror")
  ) {
    return {
      errorType: "NameError",
      severity: "Medium",

      rootCause:
        "The variable 'username' is being used before it has been defined.",

      explanation:
        "Python cannot find a variable named username in the current scope. A variable must be assigned a value before it can be used.",

      suggestedFix:
        "Define the username variable before using it.",

      fixedCode: `username = "student"

print(username)`,

      preventionTip:
        "Always initialize variables before using them and check variable names carefully for spelling mistakes.",

      demoMode: true,
    };
  }

  // JavaScript TypeError
  if (
    language === "JavaScript" &&
    errorText.includes("typeerror")
  ) {
    return {
      errorType: "TypeError",
      severity: "High",

      rootCause:
        "The program attempts to access the 'name' property of an undefined value.",

      explanation:
        "The user variable contains undefined. JavaScript cannot access properties such as user.name from an undefined value, so a TypeError is generated.",

      suggestedFix:
        "Check whether user exists before accessing its properties.",

      fixedCode: `const user = undefined;

if (user) {
  console.log(user.name);
} else {
  console.log("User is not available");
}`,

      preventionTip:
        "Validate objects before accessing their properties. Optional chaining (?.) can also help prevent this type of error.",

      demoMode: true,
    };
  }

  return null;
}

// ---------------------------------------------------------
// AI PROMPT
// ---------------------------------------------------------

function buildPrompt(code, error, language) {
  return `
You are DebugSense AI, an intelligent programming debugging assistant.

Analyze the following programming error.

Programming Language:
${language}

Source Code:
${code}

Error Message:
${error}

Return ONLY valid JSON.

The JSON must contain exactly these fields:

{
  "errorType": "string",
  "severity": "Low | Medium | High | Critical",
  "rootCause": "string",
  "explanation": "string",
  "suggestedFix": "string",
  "fixedCode": "string",
  "preventionTip": "string"
}

Requirements:

1. Identify the actual error type.
2. Determine an appropriate severity.
3. Explain the root cause clearly.
4. Explain the error in beginner-friendly language.
5. Provide a practical suggested fix.
6. Return corrected working code.
7. Provide one useful prevention tip.
8. Do not add Markdown around the JSON.
9. Do not add any extra text outside the JSON.
`;
}

// ---------------------------------------------------------
// REAL AI DEBUGGER
// ---------------------------------------------------------

async function analyzeWithAI(code, error, language) {
  if (!openai) {
    return null;
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",

      input: buildPrompt(
        code,
        error,
        language
      ),

      temperature: 0.2,
    });

    const text = response.output_text;

    if (!text) {
      throw new Error(
        "AI returned an empty response."
      );
    }

    // Remove accidental markdown code fences
    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = JSON.parse(
      cleanedText
    );

    // Validate required fields
    const requiredFields = [
      "errorType",
      "severity",
      "rootCause",
      "explanation",
      "suggestedFix",
      "fixedCode",
      "preventionTip",
    ];

    for (const field of requiredFields) {
      if (
        !result[field] ||
        typeof result[field] !== "string"
      ) {
        throw new Error(
          `AI response is missing field: ${field}`
        );
      }
    }

    return {
      ...result,
      demoMode: false,
    };
  } catch (error) {
    console.error(
      "AI analysis failed:",
      error.message
    );

    return null;
  }
}

// ---------------------------------------------------------
// MAIN DEBUG FUNCTION
// ---------------------------------------------------------

async function debugCode(
  code,
  error,
  language
) {
  // First try real AI if API key exists
  if (openai) {
    const aiResult =
      await analyzeWithAI(
        code,
        error,
        language
      );

    if (aiResult) {
      return aiResult;
    }

    console.log(
      "AI unavailable. Checking demo fallback..."
    );
  }

  // Fallback mode
  const demoResult =
    getDemoResponse(
      code,
      error,
      language
    );

  if (demoResult) {
    return demoResult;
  }

  // Generic fallback
  return {
    errorType: "Unknown Error",
    severity: "Medium",

    rootCause:
      "The provided error could not be matched with one of the available demonstration scenarios.",

    explanation:
      "DebugSense AI is currently running in Demo Mode. The three predefined demonstration errors are supported.",

    suggestedFix:
      "Try one of the built-in demonstration examples.",

    fixedCode:
      code,

    preventionTip:
      "Provide the complete error message and source code for more accurate debugging.",

    demoMode: true,
  };
}

module.exports = {
  debugCode,
};