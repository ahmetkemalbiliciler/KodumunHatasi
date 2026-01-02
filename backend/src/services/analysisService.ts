import prisma from "../utils/prisma.js";
import type { AIAnalysisResponse, AIIssue } from "../types/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const analysisService = {
  /**
   * Analyze code using AI and store structured results
   * sourceCode is passed to AI but NOT stored in database
   */
  async analyzeCode(codeVersionId: string, sourceCode: string) {
    // Call AI to analyze the code
    const aiResponse = await callGeminiForAnalysis(sourceCode);

    // Store structured analysis results
    const analysisResult = await prisma.analysisResult.create({
      data: {
        codeVersionId,
        summary: aiResponse.summary,
        issues: {
          create: aiResponse.issues.map((issue: AIIssue) => ({
            issueCode: issue.issueCode,
            severity: issue.severity,
            complexity: issue.complexity,
            functionName: issue.functionName,
            startLine: issue.startLine,
            endLine: issue.endLine,
            snippet: issue.beforeSnippet || issue.afterSnippet
              ? {
                  create: {
                    beforeSnippet: issue.beforeSnippet,
                    afterSnippet: issue.afterSnippet,
                  },
                }
              : undefined,
          })),
        },
      },
      include: {
        issues: {
          include: {
            snippet: true,
          },
        },
      },
    });

    return analysisResult;
  },

  /**
   * Get analysis for a code version
   */
  async getByCodeVersionId(codeVersionId: string) {
    return prisma.analysisResult.findUnique({
      where: { codeVersionId },
      include: {
        issues: {
          include: {
            snippet: true,
          },
        },
      },
    });
  },
};

/**
 * Call Gemini API to analyze source code
 * Returns structured JSON analysis
 */
async function callGeminiForAnalysis(sourceCode: string): Promise<AIAnalysisResponse> {
  console.log("🤖 Analyzing code with Gemini...");
  console.log("📝 Source code length:", sourceCode.length, "characters");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a code analyzer. Analyze the following code and return a JSON object with this EXACT structure:

{
  "summary": "Brief summary of the analysis (max 2 sentences)",
  "issues": [
    {
      "issueCode": "ONE_OF_THE_VALID_CODES",
      "severity": "low" | "medium" | "high",
      "complexity": "O_1" | "O_n" | "O_n2",
      "functionName": "optional function name where issue is found",
      "startLine": optional line number (integer),
      "endLine": optional line number (integer),
      "beforeSnippet": "optional code snippet showing the issue (max 5 lines)",
      "afterSnippet": "optional suggested fix snippet (max 5 lines)"
    }
  ]
}

VALID ISSUE CODES (use ONLY these):

Performance Issues:
- NESTED_LOOP: Nested loops that may cause O(n²) complexity
- INEFFICIENT_ALGORITHM: Suboptimal algorithm choice
- MEMORY_LEAK: Potential memory leak
- N_PLUS_ONE_QUERY: Database N+1 query problem
- BLOCKING_OPERATION: Blocking operation in async context

Code Quality Issues:
- UNUSED_VARIABLE: Declared but never used variable
- MAGIC_NUMBER: Hardcoded number without explanation
- LONG_FUNCTION: Function exceeds reasonable length (>50 lines)
- DUPLICATE_CODE: Repeated code blocks
- DEAD_CODE: Unreachable or never executed code
- COMPLEX_CONDITION: Overly complex conditional logic
- DEEP_NESTING: Excessive nesting levels (>4)

Security Issues:
- HARDCODED_SECRET: Hardcoded API keys, passwords, secrets
- SQL_INJECTION: Potential SQL injection vulnerability
- XSS_VULNERABILITY: Cross-site scripting risk
- INSECURE_RANDOM: Using insecure random generation

Error Handling:
- EMPTY_CATCH: Empty catch block that swallows errors
- MISSING_ERROR_HANDLING: No error handling for risky operations
- SWALLOWED_EXCEPTION: Exception caught but not properly handled

Best Practices:
- MISSING_NULL_CHECK: No null/undefined check before use
- MISSING_TYPE_ANNOTATION: Missing TypeScript type annotations
- INCONSISTENT_NAMING: Variable/function naming inconsistent
- GOD_FUNCTION: Function doing too many things
- MISSING_RETURN_TYPE: Function missing return type annotation

RULES:
- issueCode MUST be one of the codes listed above
- severity MUST be one of: low, medium, high
- complexity MUST be one of: O_1, O_n, O_n2
- Return ONLY valid JSON, no markdown, no explanation
- If no issues found, return empty issues array
- Be thorough and identify multiple issues if present

CODE TO ANALYZE:
\`\`\`
${sourceCode}
\`\`\``;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean the response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    }
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    console.log("✅ Gemini response received");

    const parsed = JSON.parse(cleanedText) as AIAnalysisResponse;
    return parsed;
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    
    // Return fallback response on error
    return {
      summary: "Analysis failed - unable to parse code at this time.",
      issues: [],
    };
  }
}
