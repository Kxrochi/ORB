import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Gooey Cursor Logic
window.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById("cursor");
  if (!cursor) return;
  const amount = 20;
  const sineDots = Math.floor(amount * 0.3);
  const width = 26;
  const idleTimeout = 150;
  let lastFrame = 0;
  let mousePosition = {x: 0, y: 0};
  let dots = [];
  let timeoutID;
  let idle = false;

  class Dot {
    constructor(index = 0) {
      this.index = index;
      this.anglespeed = 0.05;
      this.x = 0;
      this.y = 0;
      this.scale = 1 - 0.05 * index;
      this.range = width / 2 - width / 2 * this.scale + 2;
      this.limit = width * 0.75 * this.scale;
      this.element = document.createElement("span");
      window.TweenMax && window.TweenMax.set(this.element, {scale: this.scale});
      cursor.appendChild(this.element);
    }
    lock() {
      this.lockX = this.x;
      this.lockY = this.y;
      this.angleX = Math.PI * 2 * Math.random();
      this.angleY = Math.PI * 2 * Math.random();
    }
    draw(delta) {
      if (!idle || this.index <= sineDots) {
        window.TweenMax && window.TweenMax.set(this.element, {x: this.x, y: this.y});
      } else {
        this.angleX += this.anglespeed;
        this.angleY += this.anglespeed;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        window.TweenMax && window.TweenMax.set(this.element, {x: this.x, y: this.y});
      }
    }
  }

  function startIdleTimer() {
    timeoutID = setTimeout(goInactive, idleTimeout);
    idle = false;
  }
  function resetIdleTimer() {
    clearTimeout(timeoutID);
    startIdleTimer();
  }
  function goInactive() {
    idle = true;
    for (let dot of dots) {
      dot.lock();
    }
  }
  function buildDots() {
    for (let i = 0; i < amount; i++) {
      let dot = new Dot(i);
      dots.push(dot);
    }
  }
  const onMouseMove = event => {
    mousePosition.x = event.clientX - width / 2;
    mousePosition.y = event.clientY - width / 2;
    resetIdleTimer();
  };
  const onTouchMove = event => {
    mousePosition.x = event.touches[0].clientX - width / 2;
    mousePosition.y = event.touches[0].clientY - width / 2;
    resetIdleTimer();
  };
  const render = timestamp => {
    const delta = timestamp - lastFrame;
    positionCursor(delta);
    lastFrame = timestamp;
    requestAnimationFrame(render);
  };
  const positionCursor = delta => {
    let x = mousePosition.x;
    let y = mousePosition.y;
    dots.forEach((dot, index, dots) => {
      let nextDot = dots[index + 1] || dots[0];
      dot.x = x;
      dot.y = y;
      dot.draw(delta);
      if (!idle || index <= sineDots) {
        const dx = (nextDot.x - dot.x) * 0.35;
        const dy = (nextDot.y - dot.y) * 0.35;
        x += dx;
        y += dy;
      }
    });
  };
  // Only run if TweenMax is available
  if (window.TweenMax) {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    lastFrame += new Date();
    buildDots();
    render();
  }
}); 