chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' }).catch(() => {
    // content script may not be injected yet
  });
});
