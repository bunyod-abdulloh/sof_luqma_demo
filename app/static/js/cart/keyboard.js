// cart/keyboard.js
import { $ } from './helpers.js';

export function bindKeyboardReposition() {
  const bar = $('cart-bottom-bar');
  const vv = window.visualViewport;
  if (!bar || !vv) return;

  const repositionBar = () => {
    const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
    if (keyboardHeight > 80) {
      bar.style.bottom = (keyboardHeight + 12) + 'px';
    } else {
      bar.style.bottom = '';
    }
  };

  vv.addEventListener('resize', repositionBar);
  vv.addEventListener('scroll', repositionBar);
}