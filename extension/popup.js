document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const codeInput = document.getElementById("codeInput");
  const loading = document.getElementById("loading");
  const results = document.getElementById("results");

  // Ensure all elements exist before adding event listener
  if (analyzeButton && codeInput && loading && results) {
    analyzeButton.addEventListener("click", () => {
      const code = codeInput.value;

      // Show the loading spinner and hide results
      loading.style.display = "flex";
      results.style.display = "none";

      chrome.runtime.sendMessage(
        { type: "analyzeCode", code },
        (response) => {
          // Hide the loading spinner
          loading.style.display = "none";

          if (response && response.result) {
            results.style.display = "block";
            document.getElementById("timeComplexity").innerText = response.result.timeComplexity;
            document.getElementById("spaceComplexity").innerText = response.result.spaceComplexity;
            document.getElementById("suggestedCode").innerText = response.result.suggestedCode || "No suggestions available.";
          } else {
            results.style.display = "block";
            document.getElementById("timeComplexity").innerText = "Error";
            document.getElementById("spaceComplexity").innerText = "Error";
            document.getElementById("suggestedCode").innerText = "Error analyzing code.";
          }
        }
      );
    });
  } else {
    console.error("Some elements are missing in the DOM.");
  }
});
