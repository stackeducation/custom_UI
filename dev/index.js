// Get Login button
const signInButton = document.getElementById('next');
console.log("login content:", signInButton.textContent);
document.querySelector('.buttons #next').textContent = "Login";
console.log("login after:", signInButton.textContent);

function getQueryParams() {
  const params = {};
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  for (const [key, value] of urlParams) {
      params[key] = value;
  }
  return params;
}

// Populate hidden fields with Azure AD B2C parameters
function populateHiddenFields() {
  const params = getQueryParams();
  document.querySelector('input[name="csrf_token"]').value = params.csrf_token || '';
  document.querySelector('input[name="tx"]').value = params.tx || '';
}

// Prefill the tenantName and roles fields
function prefillFields() {
  const params = getQueryParams();
  const tenantName = params.tenantName || '';
  const roles = params.roles || '';

  document.getElementById('tenantName').value = tenantName;
  document.getElementById('userRoles').value = roles;
}

// Handle form submission (basic validation)
document.getElementById("signupForm").addEventListener("submit", function (event) {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  let hasError = false;

  if (!email) {
      document.getElementById("emailError").textContent = "Email is required.";
      hasError = true;
  } else {
      document.getElementById("emailError").textContent = "";
  }

  if (!password) {
      document.getElementById("passwordError").textContent = "Password is required.";
      hasError = true;
  } else if (password.length < 6) {
      document.getElementById("passwordError").textContent = "Password must be at least 6 characters.";
      hasError = true;
  } else {
      document.getElementById("passwordError").textContent = "";
  }

  if (hasError) {
      event.preventDefault(); // Prevent submission if validation fails
  }
});

debugger;
populateHiddenFields();
prefillFields();
