// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "fetchCode") {
    // Fetch code based on the current context (GitHub or code editor)
    const code = fetchCodeFromPage();
    
    if (code) {
      sendResponse({ code });
    } else {
      sendResponse({ code: "No code found on the page." });
    }
  }
});

// Function to fetch code from GitHub (e.g., code in a pull request or file)
function fetchCodeFromGitHub() {
  let code = '';
  
  // Look for code blocks in GitHub (files or pull requests)
  const codeBlocks = document.querySelectorAll('pre > code');
  
  codeBlocks.forEach(block => {
    code += block.innerText + '\n';
  });

  return code.trim();
}

// Function to fetch code from a VS Code Web (or similar editor)
function fetchCodeFromVSCode() {
  let code = '';
  
  // Assuming the VS Code Web editor uses 'pre' tags for code blocks
  const codeBlocks = document.querySelectorAll('pre');
  
  codeBlocks.forEach(block => {
    code += block.innerText + '\n';
  });

  return code.trim();
}

// Function to determine the context and fetch code
function fetchCodeFromPage() {
  let code = '';
  
  // Determine if the page is a GitHub page (by URL)
  if (window.location.hostname.includes('github.com')) {
    code = fetchCodeFromGitHub();
  }
  // Otherwise, assume it's a code editor like VS Code
  else if (window.location.hostname.includes('vscode.dev') || window.location.hostname.includes('github.dev')) {
    code = fetchCodeFromVSCode();
  }

  return code;
}
