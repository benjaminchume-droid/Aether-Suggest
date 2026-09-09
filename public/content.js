const CONTAINER_ID = 'aether-suggest-root';

function inject() {
  if (document.getElementById(CONTAINER_ID)) return;

  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    z-index: 2147483647;
    border: none;
    pointer-events: none;
  `;

  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('index.html');
  iframe.style.cssText = 'width:100%;height:100%;border:none;pointer-events:auto;';
  iframe.allow = 'clipboard-read; clipboard-write';

  container.appendChild(iframe);
  document.documentElement.appendChild(container);
}

function remove() {
  const el = document.getElementById(CONTAINER_ID);
  if (el) el.remove();
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'toggleSidebar') {
    const el = document.getElementById(CONTAINER_ID);
    if (el) remove();
    else inject();
  }
});

// Floating trigger
const trigger = document.createElement('button');
trigger.innerHTML = '✧';
trigger.title = 'Aether Suggest';
trigger.style.cssText = `
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(10,10,10,0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.85);
  font-size: 18px;
  cursor: pointer;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  transition: transform 0.2s ease;
`;
trigger.onmouseenter = () => (trigger.style.transform = 'scale(1.06)');
trigger.onmouseleave = () => (trigger.style.transform = 'scale(1)');
trigger.onclick = inject;
document.documentElement.appendChild(trigger);
