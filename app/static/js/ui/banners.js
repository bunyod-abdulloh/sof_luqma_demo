export function initBannerCarousel() {
  const slides = document.querySelectorAll("#banner-carousel img");
  if (slides.length <= 1) return;

  let current = 0;
  setInterval(() => {
    slides[current].classList.replace("opacity-100", "opacity-0");
    current = (current + 1) % slides.length;
    slides[current].classList.replace("opacity-0", "opacity-100");
  }, 4000);
}