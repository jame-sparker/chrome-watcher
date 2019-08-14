
button.onclick = (e) => {
  chrome.storage.sync.set({interval: item}, function() {
    console.log('color is ' + item);
  })
};