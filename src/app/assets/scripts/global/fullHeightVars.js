// пересчет значения высоты экрана для мобильных браузеров

export default function addFullHeightVars() {
  function fixWindowHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  function fixWindowHeightFix() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vhFix', `${vh}px`);
  }

  function setWindowScaleVal() {
    let scale = window.innerWidth * 100 / 1920;
    document.documentElement.style.setProperty('--scale', `${scale}%`);
  }

  fixWindowHeight();
  fixWindowHeightFix();
  setWindowScaleVal();
  window.addEventListener('resize', () => {
    fixWindowHeight();
    setWindowScaleVal();
  });
} 