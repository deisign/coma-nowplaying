let ambienceCtx;
let ambienceAudio;
let ambienceGain;
let ambienceSource;

const selector = document.getElementById("atmosphereSelector");
const slider = document.getElementById("ambienceVolumeSlider");

function fadeOut(audio, callback) {
  let vol = audio.volume;
  const step = 0.05;
  const fade = setInterval(() => {
    vol -= step;
    if (vol <= 0) {
      clearInterval(fade);
      audio.pause();
      callback && callback();
    } else {
      audio.volume = vol;
    }
  }, 50);
}

function fadeIn(audio) {
  let vol = 0;
  audio.volume = 0;
  audio.play();
  const step = 0.05;
  const fade = setInterval(() => {
    vol += step;
    if (vol >= 1) {
      clearInterval(fade);
      audio.volume = 1;
    } else {
      audio.volume = vol;
    }
  }, 50);
}

async function changeAmbience(file) {
  if (!ambienceCtx) {
    ambienceCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Прибираємо попередній звук
  if (ambienceAudio) {
    fadeOut(ambienceAudio, () => {
      try {
        ambienceSource.disconnect();
      } catch (e) {}
      ambienceAudio = null;
      ambienceSource = null;
    });
  }

  if (file === "none") {
    localStorage.setItem("ambienceFile", "none");
    return;
  }

  ambienceAudio = new Audio("ambience/" + file);
  ambienceAudio.loop = true;
  ambienceAudio.crossOrigin = "anonymous";

  await ambienceAudio.play().catch(err => {
    console.warn("Autoplay failed. Waiting for user gesture.", err);
    return;
  });

  ambienceSource = ambienceCtx.createMediaElementSource(ambienceAudio);
  ambienceGain = ambienceCtx.createGain();

  const savedVolume = parseFloat(localStorage.getItem("ambienceVolume") || "0.2");
  ambienceGain.gain.value = savedVolume;
  slider.value = savedVolume;

  ambienceSource.connect(ambienceGain).connect(ambienceCtx.destination);
  fadeIn(ambienceAudio);
  localStorage.setItem("ambienceFile", file);
}

selector?.addEventListener("change", () => {
  changeAmbience(selector.value);
});

slider?.addEventListener("input", () => {
  if (ambienceGain) {
    ambienceGain.gain.value = slider.value;
  }
  localStorage.setItem("ambienceVolume", slider.value);
});

// Автовідновлення
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("ambienceFile");
  if (saved && saved !== "none") {
    selector.value = saved;
    changeAmbience(saved);
  }
});
