function togglePassword(id) {
  const input = document.getElementById(id);
  if (input.type === "password") {
      input.type = "text";
  } else {
      input.type = "password";
  }
}

function showRegisterOptions() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerOptions").classList.remove("hidden");
  document.getElementById("registerStationForm").classList.add("hidden");
  document.getElementById("registerOwnerForm").classList.add("hidden");
}

function showRegisterForm(type) {
  document.getElementById("registerOptions").classList.add("hidden");
  if (type === 'station') {
      document.getElementById("registerStationForm").classList.remove("hidden");
      document.getElementById("registerOwnerForm").classList.add("hidden");
  } else {
      document.getElementById("registerStationForm").classList.add("hidden");
      document.getElementById("registerOwnerForm").classList.remove("hidden");
  }
}

function showLoginForm() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerOptions").classList.add("hidden");
  document.getElementById("registerStationForm").classList.add("hidden");
  document.getElementById("registerOwnerForm").classList.add("hidden");
}

function validateLogin() {
  // Implement login validation if needed
  return true;
}

function validateRegister(type) {
  let password, confirmPassword, errorMessage;
  if (type === 'station') {
      password = document.getElementById("stationPassword").value;
      confirmPassword = document.getElementById("stationConfirmPassword").value;
      errorMessage = document.getElementById("stationErrorMessage");
  } else {
      password = document.getElementById("ownerPassword").value;
      confirmPassword = document.getElementById("ownerConfirmPassword").value;
      errorMessage = document.getElementById("ownerErrorMessage");
  }

  if (password !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match. Please try again.";
      return false;
  }

  if (!isStrongPassword(password)) {
      errorMessage.textContent = "Password must be at least 8 characters long, include at least one uppercase letter, one special character (#@$), and one number.";
      return false;
  }

  errorMessage.textContent = "";
  return true;
}

function isStrongPassword(password) {
  const strongPasswordPattern = /^(?=.*[A-Z])(?=.*[#@$])(?=.*\d)[A-Za-z\d#@$]{8,}$/;
  return strongPasswordPattern.test(password);
}

function checkPasswordStrength(passwordId, strengthId) {
  const password = document.getElementById(passwordId).value;
  const strength = document.getElementById(strengthId);

  if (password.length >= 8 && /[A-Z]/.test(password) && /[#@$]/.test(password) && /\d/.test(password)) {
      strength.textContent = "Strong Password";
      strength.style.color = "green";
  } else {
      strength.textContent = "Weak Password";
      strength.style.color = "red";
  }
}
