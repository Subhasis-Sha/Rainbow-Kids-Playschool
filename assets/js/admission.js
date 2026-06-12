/* Admission Wizard: Step-by-step validations, child age calculations, and confetti animations */

let currentStep = 1;
const totalSteps = 3;

function initAdmissionForm() {
  const form = document.getElementById("admission-form");
  if (!form) return;
  
  
  const nextBtns = document.querySelectorAll(".form-next-btn");
  const prevBtns = document.querySelectorAll(".form-prev-btn");
  
  nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (validateCurrentStep()) {
        goToStep(currentStep + 1);
        if (typeof playSynthSound === "function") playSynthSound('click');
      } else {
        if (typeof playSynthSound === "function") playSynthSound('cow'); 
      }
    });
  });
  
  prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      goToStep(currentStep - 1);
      if (typeof playSynthSound === "function") playSynthSound('click');
    });
  });
  
  
  const dobInput = document.getElementById("child-dob");
  if (dobInput) {
    dobInput.addEventListener("change", () => {
      calculateChildAge(dobInput.value);
    });
  }
  
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      submitAdmissionForm();
    }
  });
  
  
  updateProgressUI();
}

function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > totalSteps) return;
  
  
  const currentFieldset = document.getElementById(`step-fieldset-${currentStep}`);
  if (currentFieldset) currentFieldset.style.display = "none";
  
  
  const nextFieldset = document.getElementById(`step-fieldset-${stepNumber}`);
  if (nextFieldset) nextFieldset.style.display = "block";
  
  currentStep = stepNumber;
  updateProgressUI();
}

function updateProgressUI() {
  
  for (let i = 1; i <= totalSteps; i++) {
    const dot = document.getElementById(`step-dot-${i}`);
    if (dot) {
      if (i < currentStep) {
        dot.className = "step-dot completed";
        dot.innerHTML = "✓";
      } else if (i === currentStep) {
        dot.className = "step-dot active";
        dot.innerHTML = i;
      } else {
        dot.className = "step-dot";
        dot.innerHTML = i;
      }
    }
  }
  
  
  const progressLine = document.getElementById("step-progress-line");
  if (progressLine) {
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressLine.style.width = percent + "%";
  }
}

function validateCurrentStep() {
  let isValid = true;
  clearAllErrors();
  
  if (currentStep === 1) {
    
    const name = document.getElementById("parent-name");
    if (!name || name.value.trim().length < 3) {
      showFieldError("parent-name", "Please enter parent full name (at least 3 characters).");
      isValid = false;
    }
    
    
    const email = document.getElementById("parent-email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.value.trim())) {
      showFieldError("parent-email", "Please enter a valid email address.");
      isValid = false;
    }
    
    
    const phone = document.getElementById("parent-phone");
    const phoneRegex = /^\+?[\d\s-]{10,14}$/;
    if (!phone || !phoneRegex.test(phone.value.trim())) {
      showFieldError("parent-phone", "Please enter a valid phone number (10+ digits).");
      isValid = false;
    }
  }
  
  if (currentStep === 2) {
    
    const childName = document.getElementById("child-name");
    if (!childName || childName.value.trim().length < 2) {
      showFieldError("child-name", "Please enter child's name (at least 2 characters).");
      isValid = false;
    }
    
    
    const childDob = document.getElementById("child-dob");
    if (!childDob || !childDob.value) {
      showFieldError("child-dob", "Please enter child's date of birth.");
      isValid = false;
    }
  }
  
  return isValid;
}

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  input.classList.add("input-error");
  
  const errSpan = document.createElement("span");
  errSpan.className = "error-message pop-in";
  errSpan.textContent = message;
  
  
  input.parentNode.appendChild(errSpan);
}

function clearAllErrors() {
  const errorInputs = document.querySelectorAll(".input-error");
  errorInputs.forEach(input => input.classList.remove("input-error"));
  
  const errorMsgs = document.querySelectorAll(".error-message");
  errorMsgs.forEach(msg => msg.remove());
}

function calculateChildAge(dobString) {
  if (!dobString) return;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  const ageYears = Math.abs(ageDate.getUTCFullYear() - 1970);
  
  const ageDisplay = document.getElementById("child-age-display");
  const ageInput = document.getElementById("child-age");
  
  if (ageDisplay) {
    ageDisplay.textContent = `Age: ${ageYears} Years Old`;
    ageDisplay.style.display = "inline-block";
  }
  
  if (ageInput) {
    ageInput.value = ageYears;
  }
}

function submitAdmissionForm() {
  const form = document.getElementById("admission-form");
  const successCard = document.getElementById("admission-success-card");
  
  if (!form || !successCard) return;
  
  
  const parentName = document.getElementById("parent-name").value;
  const childName = document.getElementById("child-name").value;
  
  const submission = {
    parentName,
    childName,
    date: new Date().toISOString()
  };
  
  localStorage.setItem("latest_admission", JSON.stringify(submission));
  
  
  form.style.display = "none";
  successCard.style.display = "block";
  
  
  if (typeof addStars === "function") {
    addStars(20, 'applicant');
  }
  
  
  launchConfettiSplash();
}

function launchConfettiSplash() {
  const container = document.body;
  const colors = ["#FF6B8B", "#4EA8DE", "#FFD166", "#06D6A0", "#9D4EDD", "#F4A261"];
  
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");
    confetti.className = "star-particle";
    
    
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.backgroundColor = randColor;
    
    
    confetti.style.left = (Math.random() * 100) + "vw";
    confetti.style.top = "100vh";
    
    
    const tx = -100 + (Math.random() * 200);
    const ty = -600 - (Math.random() * 300);
    confetti.style.setProperty("--tx", tx + "px");
    confetti.style.setProperty("--ty", ty + "px");
    
    const size = 10 + Math.random() * 20;
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";
    confetti.style.animation = "star-particle-fly 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards";
    
    container.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 1500);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (document.getElementById("admission-form")) {
      initAdmissionForm();
    }
  }, 800); 
});
