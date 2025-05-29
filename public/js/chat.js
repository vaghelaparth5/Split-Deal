// chat.js

const sendBtn  = document.getElementById('sendBtn');
const input    = document.getElementById('chatInput');
const chatBody = document.querySelector('.chat-body');

// Send on click
sendBtn.addEventListener('click', sendMessage);

// Also send on Enter key
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { 
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // Create outgoing message bubble
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', 'outgoing');
  const p = document.createElement('p');
  p.textContent = text;
  msgDiv.appendChild(p);

  // Append and scroll
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Reset input
  input.value = '';
  input.focus();
}
