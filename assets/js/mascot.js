/* Mascot Controller: Dialogue structures, selection states, and click speech animations */

const MASCOT_DIALOGUES = {
  index: {
    rabbit: [
      "Hi there! Welcome to Rainbow Kids Playschool! 🌈",
      "Barnaby the Bunny here! Click me anytime to chat!",
      "Hop along! Check out our fun activities page above! 🐰"
    ],
    panda: [
      "Hello! I am Penny the Panda. We love to play! 🐼",
      "Check out our classrooms! They are filled with toys and books.",
      "Want a star? Click the star counter at the top to see badges!"
    ],
    elephant: [
      "Hello friend! I'm Elly the Elephant. Trumpet! 🐘",
      "We have sports, music, art, and so much more!",
      "Ask your parents to read our parent reviews below. They love us!"
    ]
  },
  about: {
    rabbit: [
      "Our school was founded in 2020! Check out the timeline above! 🧭",
      "I love learning here! We do play-based activities.",
      "Scroll down to see the safety features. We are super safe! 🔒"
    ],
    panda: [
      "Penny here! Have you met our amazing teachers below? 👩‍🏫",
      "We believe in safety first, cozy library rooms, and large parks!",
      "Scroll all the way down to earn some explorer stars!"
    ],
    elephant: [
      "Elly loves the art and music room! 🎨🎵",
      "Read our timeline to see how we grew over the years.",
      "We teach children to be creative, share, and be kind!"
    ]
  },
  programs: {
    rabbit: [
      "We have Nursery, LKG, and UKG programs! 🎒",
      "Nursery is for tiny toddlers who love sensory play!",
      "Click the program tabs to view curriculum details."
    ],
    panda: [
      "Penny suggests checking the UKG class. We read big words! 📚",
      "Our classes have interactive play setups and audio-visual toys.",
      "Each class has a fun, tailored daily schedule!"
    ],
    elephant: [
      "LKG is awesome! We learn letters, numbers, and drawings. 🧩",
      "Elly loves the curriculum timeline. Play, eat, nap, repeat!",
      "Ready to join us? Go to the Admission page!"
    ]
  },
  gallery: {
    rabbit: [
      "Look at all these photos of us playing! 📸",
      "Click on any photo to open the lightbox viewer!",
      "I love the classroom photo, look at the blocks!"
    ],
    panda: [
      "Watch our school video tour! It is super cool. 🎥",
      "We update photos every semester. So many events!",
      "Click the filter buttons to view classroom or playground images."
    ],
    elephant: [
      "Look at our sports day photo! I won a gold medal. 🏅",
      "Can you see the graduation cap on photo 3? So proud!",
      "We have a massive sandbox playground. It's so fun!"
    ]
  },
  activities: {
    rabbit: [
      "Yay! Playtime! Let's pop some bubbles! 🧼",
      "Draw me a picture on the easel! I love carrot drawings. 🥕",
      "Pop 30 bubbles in a game to unlock a secret badge!"
    ],
    panda: [
      "Use different brush sizes and colors on the easel board!",
      "Click 'Save Masterpiece' to download your art and get stars! 🎨",
      "Every 10 pops in the bubble game awards you a star! Go go go!"
    ],
    elephant: [
      "Bubbles fall faster as your score goes higher! ⚡",
      "Click 'Clear Canvas' if you want to start a new drawing.",
      "I love drawing clouds and rainbows! Try it!"
    ]
  },
  admission: {
    rabbit: [
      "Do you want to enroll? Ask mommy or daddy to fill this form! ✍️",
      "Look at the caterpillar progress bar! It grows as you fill it.",
      "Make sure to specify if you have any allergies or requests! 🏥"
    ],
    panda: [
      "Filling the form unlocks a massive 20 star reward! 🌟",
      "Step 1 is for parents, Step 2 is for you, Step 3 is medical info.",
      "Check all green checkmarks to make sure fields are correct."
    ],
    elephant: [
      "Elly says: fill in parent details first!",
      "We will contact you within 48 hours after submitting.",
      "Welcome to our big, happy playschool family! 🐘"
    ]
  },
  contact: {
    rabbit: [
      "We are located at 123 Rainbow Lane. See map above! 🗺️",
      "You can send us a message using the message card.",
      "Call us or email us anytime! We love hearing from you. 📞"
    ],
    panda: [
      "Penny loves visiting! We are open from 8:00 AM to 2:00 PM.",
      "Our map is interactive, you can zoom in and out! 🔍",
      "Write your email and message clearly so we can write back!"
    ],
    elephant: [
      "Give us a call if you have any urgent questions! ☎️",
      "Check out our contact details below.",
      "Looking forward to meeting you! Trumpet! 🐘"
    ]
  }
};

let dialogueTimer = null;

function initializeMascot() {
  const area = document.getElementById("mascot-interactive-area");
  const closeBubble = document.getElementById("mascot-bubble-close");
  const selBtn = document.getElementById("mascot-sel-btn");
  
  
  const savedMascot = localStorage.getItem("rainbow_mascot");
  if (savedMascot) {
    window.rainbowState.mascot = savedMascot;
    updateMascotVisuals();
  }
  
  if (area) {
    area.addEventListener("click", () => {
      triggerMascotSpeech();
    });
    area.addEventListener("mouseenter", () => {
      triggerMascotHover();
    });
  }
  
  if (closeBubble) {
    closeBubble.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMascotBubble();
    });
  }
  
  if (selBtn) {
    selBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMascotSelector();
    });
  }
  
  
  const options = document.querySelectorAll(".mascot-opt");
  options.forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const name = opt.getAttribute("data-mascot");
      changeMascot(name);
    });
  });
  
  
  document.addEventListener("click", () => {
    const sel = document.getElementById("mascot-selector");
    if (sel) sel.style.display = "none";
  });
  
  
  setTimeout(() => {
    triggerMascotSpeech(true); 
  }, 1000);
}

function updateMascotVisuals() {
  const img = document.getElementById("mascot-img");
  const opts = document.querySelectorAll(".mascot-opt");
  
  if (img) {
    img.src = `assets/images/mascots/${window.rainbowState.mascot}.png`;
  }
  
  opts.forEach(opt => {
    if (opt.getAttribute("data-mascot") === window.rainbowState.mascot) {
      opt.classList.add("active");
    } else {
      opt.classList.remove("active");
    }
  });
}

function changeMascot(name) {
  window.rainbowState.mascot = name;
  localStorage.setItem("rainbow_mascot", name);
  updateMascotVisuals();
  
  if (typeof playSynthSound === "function") playSynthSound('click');
  
  
  const sel = document.getElementById("mascot-selector");
  if (sel) sel.style.display = "none";
  
  triggerMascotSpeech();
}

function toggleMascotSelector() {
  const sel = document.getElementById("mascot-selector");
  if (!sel) return;
  
  if (typeof playSynthSound === "function") playSynthSound('click');
  
  if (sel.style.display === "none" || sel.style.display === "") {
    sel.style.display = "block";
  } else {
    sel.style.display = "none";
  }
}

function triggerMascotHover() {
  const img = document.getElementById("mascot-img");
  if (img) {
    img.style.transform = "scale(1.1) rotate(5deg)";
    setTimeout(() => {
      img.style.transform = "";
    }, 300);
  }
}

function triggerMascotSpeech(isAutoLoad = false) {
  const bubble = document.getElementById("mascot-bubble");
  const textElem = document.getElementById("mascot-text");
  const img = document.getElementById("mascot-img");
  if (!bubble || !textElem) return;
  
  
  const path = window.location.pathname;
  let page = path.split("/").pop().replace(".html", "");
  if (page === "" || page === "index") page = "index";
  if (!MASCOT_DIALOGUES[page]) page = "index";
  
  const dialogues = MASCOT_DIALOGUES[page][window.rainbowState.mascot];
  const randDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
  
  textElem.textContent = randDialogue;
  bubble.style.display = "block";
  
  
  if (!isAutoLoad && typeof playSynthSound === "function") {
    
    if (window.rainbowState.mascot === 'rabbit') playSynthSound('click');
    else if (window.rainbowState.mascot === 'panda') playSynthSound('success');
    else if (window.rainbowState.mascot === 'elephant') playSynthSound('cow'); 
  }
  
  
  if (img) {
    img.classList.remove("mascot-bounce-idle");
    img.classList.add("mascot-wiggle-talk");
    setTimeout(() => {
      img.classList.remove("mascot-wiggle-talk");
      img.classList.add("mascot-bounce-idle");
    }, 1200);
  }
  
  
  clearTimeout(dialogueTimer);
  dialogueTimer = setTimeout(() => {
    closeMascotBubble();
  }, 7000);
}

function closeMascotBubble() {
  const bubble = document.getElementById("mascot-bubble");
  if (bubble) {
    bubble.style.display = "none";
  }
  clearTimeout(dialogueTimer);
}
