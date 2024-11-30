chrome.runtime.onInstalled.addListener(() => {
  console.log("Code Review Assistant extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "analyzeCode") {
    analyzeCodeComplexity(message.code)
      .then((result) => {
        sendResponse({ result });
      })
      .catch((error) => {
        console.error("Error analyzing code:", error);
        sendResponse({
          result: {
            timeComplexity: "Error",
            spaceComplexity: "Error",
            suggestedCode: "Error analyzing code.",
            explanation: "Error analyzing code due to an unexpected issue.",
          },
        });
      });
    return true; // Keeps the message channel open for async response
  } else if (message.type === "fetchCode") {
    fetchCodeFromEditorOrPage()
      .then((code) => {
        sendResponse({ code });
      })
      .catch((error) => {
        console.error("Error fetching code:", error);
        sendResponse({ code: "Error fetching code." });
      });
    return true; // Keeps the message channel open for async response
  }
});

async function analyzeCodeComplexity(code) {
  const apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAcpIwnNm3-zvg6DefHUesGBTaiw02SvJA"; // Replace with your API key

  try {
    console.log("Sending request to API...");
    const response = await fetchWithTimeout(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Please analyze the following code and provide the following information:
1. Time Complexity (e.g., O(n), O(n^2)).
2. Space Complexity (e.g., O(1), O(n)).
3. Refactored code suggestions (labeled as "Suggested Code") with explanations:\n\n${code}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error:", errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();
    console.log("Full API Response for Suggested Code:", responseData);

    const generatedContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedContent) {
      throw new Error("Failed to extract content from API response.");
    }

    console.log("Generated Content:", generatedContent);

    const complexities = parseComplexity(generatedContent);
    const suggestedCode = parseSuggestedCode(generatedContent);

    return {
      timeComplexity: complexities.timeComplexity || "Unable to determine",
      spaceComplexity: complexities.spaceComplexity || "Unable to determine",
      suggestedCode: suggestedCode || "The AI could not generate code suggestions for this snippet.",
      explanation: generatedContent || "No explanation provided.",
    };
  } catch (error) {
    console.error("Error analyzing code:", error);
    return {
      timeComplexity: "Error",
      spaceComplexity: "Error",
      suggestedCode: "Error analyzing code.",
      explanation: error.message || "An unexpected error occurred.",
    };
  }
}

async function fetchCodeFromEditorOrPage() {
  // Fetch code from the active content script (e.g., GitHub or VS Code web editor)
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) {
        return reject("No active tabs found.");
      }

      chrome.tabs.sendMessage(tabs[0].id, { type: "fetchCode" }, (response) => {
        if (response?.code) {
          resolve(response.code);
        } else {
          reject("Failed to fetch code from the content script.");
        }
      });
    });
  });
}

// Helper: Fetch with timeout
async function fetchWithTimeout(url, options, timeout = 20000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
}

// Helper: Parse time and space complexity
function parseComplexity(analysisText) {
  console.log("Parsing complexities from text:", analysisText);

  const timeMatch = analysisText.match(/time complexity.*?O\((.*?)\)/i);
  const spaceMatch = analysisText.match(/space complexity.*?O\((.*?)\)/i);

  return {
    timeComplexity: timeMatch ? `O(${timeMatch[1]})` : "Unable to determine",
    spaceComplexity: spaceMatch ? `O(${spaceMatch[1]})` : "Unable to determine",
  };
}

// Helper: Parse suggested code improvements
function parseSuggestedCode(analysisText) {
  console.log("Parsing suggested code from text:", analysisText);

  // Look for a labeled section for suggested code
  const matches = analysisText.match(/(suggested code|refactored code|optimized code):?\n([\s\S]+)/i);

  if (matches && matches[2]) {
    const suggestedCode = matches[2].split("\n\n")[0]; // Stop at first double newline
    return suggestedCode.trim();
  }

  // Fallback: Extract any code block within backticks
  const codeBlockMatch = analysisText.match(/```([\s\S]+?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  return "No suggested code available.";
}
