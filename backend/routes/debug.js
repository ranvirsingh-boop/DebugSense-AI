const express = require("express");
const router = express.Router();

const { debugCode } = require("../services/aiDebugger");

// POST /api/debug
router.post("/", async (req, res) => {
  try {
    const { code, error, language } = req.body;

    // Validate input
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Code is required.",
      });
    }

    if (!error || !error.trim()) {
      return res.status(400).json({
        success: false,
        message: "Error message is required.",
      });
    }

    if (!language || !language.trim()) {
      return res.status(400).json({
        success: false,
        message: "Programming language is required.",
      });
    }

    console.log(
      `Debug request received: ${language}`
    );

    // Run AI / fallback debugger
    const result = await debugCode(
      code,
      error,
      language
    );

    return res.status(200).json({
      success: true,
      result: result,
    });
  } catch (err) {
    console.error(
      "Debug API error:",
      err
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to analyze the code. Please try again.",
    });
  }
});

module.exports = router;