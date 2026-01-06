const form = document.getElementById("requestForm");
const rightPanel = document.querySelector(".right-panel");

let scrollTimeout;

/* Show scrollbar only while scrolling */
rightPanel.addEventListener("scroll", () => {
  if (rightPanel.scrollHeight <= rightPanel.clientHeight) return;

  rightPanel.classList.add("show-scrollbar");

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    rightPanel.classList.remove("show-scrollbar");
  }, 1500);
});

/* Form submit */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Request submitted. Now it waits for approval.");
  form.reset();
});