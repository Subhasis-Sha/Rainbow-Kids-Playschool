

let currentItemIndex = 0;
let visibleItems = [];

function initGallery() {
  const filterBtns = document.querySelectorAll(".gallery-filter-btn");
  const items = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("gallery-lightbox");
  
  if (!items.length) return;
  
  
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const filterVal = btn.getAttribute("data-filter");
      filterGalleryItems(filterVal);
      
      if (typeof playSynthSound === "function") playSynthSound('click');
    });
  });
  
  
  items.forEach(item => {
    
    item.addEventListener("click", () => {
      openLightbox(item);
    });
  });
  
  
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (prevBtn) prevBtn.addEventListener("click", showPrevItem);
  if (nextBtn) nextBtn.addEventListener("click", showNextItem);
  
  
  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.style.display !== "flex") return;
    
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrevItem();
    if (e.key === "ArrowRight") showNextItem();
  });
  
  
  updateVisibleItemsList();
}

function filterGalleryItems(category) {
  const items = document.querySelectorAll(".gallery-item");
  
  items.forEach(item => {
    const itemCats = item.getAttribute("data-category").split(" ");
    
    if (category === "all" || itemCats.includes(category)) {
      item.style.display = "block";
      
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "scale(1)";
      }, 50);
    } else {
      item.style.opacity = "0";
      item.style.transform = "scale(0.8)";
      setTimeout(() => {
        item.style.display = "none";
      }, 300);
    }
  });
  
  setTimeout(updateVisibleItemsList, 320);
}

function updateVisibleItemsList() {
  const items = document.querySelectorAll(".gallery-item");
  visibleItems = Array.from(items).filter(item => item.style.display !== "none");
}

function openLightbox(itemElement) {
  const lightbox = document.getElementById("gallery-lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbVid = document.getElementById("lightbox-video");
  const lbCap = document.getElementById("lightbox-caption");
  
  if (!lightbox) return;
  
  updateVisibleItemsList();
  currentItemIndex = visibleItems.indexOf(itemElement);
  if (currentItemIndex === -1) currentItemIndex = 0;
  
  
  const isVideo = itemElement.classList.contains("video-item");
  const caption = itemElement.querySelector(".gallery-caption")?.textContent || "Rainbow Kids Scene";
  
  if (isVideo) {
    const vidSrc = itemElement.getAttribute("data-src");
    if (lbImg) lbImg.style.display = "none";
    if (lbVid) {
      lbVid.src = vidSrc;
      lbVid.style.display = "block";
      lbVid.load();
      lbVid.play();
    }
  } else {
    const imgSrc = itemElement.querySelector("img")?.src;
    if (lbVid) {
      lbVid.style.display = "none";
      lbVid.pause();
    }
    if (lbImg) {
      lbImg.src = imgSrc;
      lbImg.style.display = "block";
    }
  }
  
  if (lbCap) lbCap.textContent = caption;
  lightbox.style.display = "flex";
  
  if (typeof playSynthSound === "function") playSynthSound('click');
}

function closeLightbox() {
  const lightbox = document.getElementById("gallery-lightbox");
  const lbVid = document.getElementById("lightbox-video");
  
  if (lightbox) lightbox.style.display = "none";
  if (lbVid) {
    lbVid.pause();
    lbVid.src = "";
  }
  
  if (typeof playSynthSound === "function") playSynthSound('click');
}

function showNextItem() {
  if (!visibleItems.length) return;
  
  currentItemIndex = (currentItemIndex + 1) % visibleItems.length;
  loadLightboxItem(visibleItems[currentItemIndex]);
}

function showPrevItem() {
  if (!visibleItems.length) return;
  
  currentItemIndex = (currentItemIndex - 1 + visibleItems.length) % visibleItems.length;
  loadLightboxItem(visibleItems[currentItemIndex]);
}

function loadLightboxItem(itemElement) {
  const lbImg = document.getElementById("lightbox-img");
  const lbVid = document.getElementById("lightbox-video");
  const lbCap = document.getElementById("lightbox-caption");
  
  const isVideo = itemElement.classList.contains("video-item");
  const caption = itemElement.querySelector(".gallery-caption")?.textContent || "Rainbow Kids Scene";
  
  if (isVideo) {
    const vidSrc = itemElement.getAttribute("data-src");
    if (lbImg) lbImg.style.display = "none";
    if (lbVid) {
      lbVid.src = vidSrc;
      lbVid.style.display = "block";
      lbVid.load();
      lbVid.play();
    }
  } else {
    const imgSrc = itemElement.querySelector("img")?.src;
    if (lbVid) {
      lbVid.style.display = "none";
      lbVid.pause();
      lbVid.src = "";
    }
    if (lbImg) {
      lbImg.src = imgSrc;
      lbImg.style.display = "block";
    }
  }
  
  if (lbCap) lbCap.textContent = caption;
  
  if (typeof playSynthSound === "function") playSynthSound('bubble');
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (document.querySelector(".gallery-filter-btn")) {
      initGallery();
    }
  }, 800); 
});
