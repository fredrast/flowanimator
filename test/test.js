window.addEventListener('mousemove', e => {
  const token = document.getElementById('OFI-12345');
  token.style.left = e.clientX + 'px';
  token.style.top = e.clientY + 'px';
});
