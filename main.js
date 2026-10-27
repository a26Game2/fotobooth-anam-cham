const input = document.querySelector('#photo-input');
const preview = document.querySelector('#photo-preview');
const magnet = document.querySelector('#magnet-3d');
const viewer = document.querySelector('#viewer');
const note = document.querySelector('#viewer-note-text');
const orbitValue = document.querySelector('#orbit-value');
const zoom = document.querySelector('#zoom');
const cropX = document.querySelector('#crop-x');
const cropY = document.querySelector('#crop-y');
let currentStep = 1;
let yaw = 0;
let pitch = 3;

function renderRotation() {
  magnet.style.setProperty('--ry', `${yaw}deg`);
  magnet.style.setProperty('--rx', `${pitch}deg`);
  orbitValue.value = `3D · ${Math.round(yaw)}°`;
  orbitValue.textContent = `3D · ${Math.round(yaw)}°`;
}

function updateCrop() {
  preview.style.setProperty('--zoom', `${zoom.value}%`);
  preview.style.setProperty('--crop-x', `${cropX.value}%`);
  preview.style.setProperty('--crop-y', `${cropY.value}%`);
  document.querySelector('#zoom-value').value = `${zoom.value}%`;
  document.querySelector('#crop-x-value').value = cropX.value;
  document.querySelector('#crop-y-value').value = cropY.value;
}

input.addEventListener('change', () => {
  const [file] = input.files;
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { alert('Vui lòng chọn ảnh nhỏ hơn 10 MB.'); input.value = ''; return; }
  const url = URL.createObjectURL(file);
  preview.style.backgroundImage = `url("${url}")`;
  preview.classList.add('has-photo');
  preview.innerHTML = '';
});

function goToStep(step) {
  currentStep = Number(step);
  document.querySelectorAll('.step-panel').forEach((panel) => panel.classList.toggle('active', Number(panel.dataset.step) === currentStep));
  document.querySelectorAll('.progress li').forEach((item, index) => item.classList.toggle('active', index < currentStep));
  viewer.dataset.scene = currentStep;
  note.textContent = 'Kéo để xoay mô hình 3D';
  if (currentStep !== 2) { magnet.style.left = ''; magnet.style.top = ''; }
  if (currentStep !== 1) { yaw = 0; pitch = 3; renderRotation(); }
}
document.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => goToStep(button.dataset.next)));
document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => goToStep(button.dataset.back)));

document.querySelectorAll('[data-orbit]').forEach((button) => button.addEventListener('click', () => {
  const action = button.dataset.orbit;
  if (action === 'left') yaw -= 30;
  if (action === 'right') yaw += 30;
  if (action === 'flip') yaw += 180;
  renderRotation();
}));
zoom.addEventListener('input', updateCrop);
cropX.addEventListener('input', updateCrop);
cropY.addEventListener('input', updateCrop);
let active = false, startX = 0, startY = 0, startYaw = 0, startPitch = 0;
viewer.dataset.scene = '1';
renderRotation();
viewer.addEventListener('pointerdown', (event) => { active = true; startX = event.clientX; startY = event.clientY; startYaw = yaw; startPitch = pitch; viewer.setPointerCapture(event.pointerId); });
viewer.addEventListener('pointermove', (event) => { if (!active || currentStep > 2) return; yaw = startYaw + (event.clientX - startX) / 2.7; pitch = Math.max(-25, Math.min(25, startPitch - (event.clientY - startY) / 5)); renderRotation(); });
viewer.addEventListener('pointerup', () => { active = false; });
viewer.addEventListener('keydown', (event) => { if (currentStep > 2 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); if (event.key === 'ArrowLeft') yaw -= 8; if (event.key === 'ArrowRight') yaw += 8; if (event.key === 'ArrowUp') pitch = Math.min(25, pitch + 5); if (event.key === 'ArrowDown') pitch = Math.max(-25, pitch - 5); renderRotation(); });
