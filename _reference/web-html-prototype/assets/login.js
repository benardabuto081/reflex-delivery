// apps/web/assets/login.js

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("login-error");
  errorBox.textContent = "";

  try {
    await login(email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    errorBox.textContent = err.message;
  }
});