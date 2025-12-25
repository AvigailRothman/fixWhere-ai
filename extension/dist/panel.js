
// const container = document.getElementById("log-container");

// // פונקציית העתקה שעוקפת מגבלות פוקוס ב-DevTools
// function copyToClipboard(text) {
//   const textArea = document.createElement("textarea");
//   textArea.value = text;
//   textArea.style.position = "fixed";
//   textArea.style.left = "-9999px";
//   textArea.style.top = "0";
//   document.body.appendChild(textArea);
//   textArea.focus();
//   textArea.select();
//   try {
//     const success = document.execCommand('copy');
//     document.body.removeChild(textArea);
//     return success;
//   } catch (err) {
//     document.body.removeChild(textArea);
//     return false;
//   }
// }

// async function copyText(text, buttonElement) {
//   if (!text) return;
//   const success = copyToClipboard(text);
//   if (success) {
//     const originalText = buttonElement.textContent;
//     buttonElement.textContent = "✓ Copied!";
//     buttonElement.style.color = "#059669";
//     setTimeout(() => {
//       buttonElement.textContent = originalText;
//       buttonElement.style.color = "";
//     }, 2000);
//   }
// }

// function escapeHtml(s) {
//   return String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
// }

// function renderChangeCard(change) {
//   const card = document.createElement("div");
//   card.className = "card";

//   // עיבוד סוג השינוי לטקסט נקי (Sentence case)
//   const rawKind = change?.type || "Change";
//   const kind = rawKind.charAt(0).toUpperCase() + rawKind.slice(1).toLowerCase();

//   const file = change?.file || "Unknown file";
//   const line = change?.startLine ?? change?.line ?? change?.aroundLine ?? null;

//   card.innerHTML = `
//     <div class="title" style="color:#2563eb; text-transform: none;">${kind}: Proposed modification</div>
//     <div class="meta">Location: ${file}${line ? ` (Line ${line})` : ""}</div>
//     <div class="grid2">
//       <div class="box">
//         <div class="colTitle" style="text-transform: none;">Original code</div>
//         <pre>${escapeHtml(change?.before || "")}</pre>
//       </div>
//       <div class="box">
//         <div class="colTitle" style="text-transform: none;">Proposed fix</div>
//         <pre>${escapeHtml(change?.after || change?.code || "")}</pre>
//       </div>
//     </div>
//   `;

//   const btnCopy = document.createElement("button");
//   btnCopy.className = "solve";
//   btnCopy.style.marginTop = "10px";
//   btnCopy.textContent = "Copy fix code";
//   btnCopy.onclick = () => copyText(change?.after || change?.code || "", btnCopy);

//   card.appendChild(btnCopy);
//   return card;
// }

// function renderResult(result) {
//   const wrap = document.createElement("div");
//   wrap.className = "details";

//   // סיכום הניתוח
//   const summaryDiv = document.createElement("div");
//   summaryDiv.innerHTML = `
//     <div class="title" style="color: #059669; text-transform: none;">AI Analysis</div>
//     <div class="msg" style="background:#f0fdf4; color:#166534; border-left:4px solid #22c55e;">
//       ${escapeHtml(result?.summary || "Analysis complete.")}
//     </div>
//   `;
//   wrap.appendChild(summaryDiv);

//   // שלבי פתרון
//   if (Array.isArray(result?.instructions) && result.instructions.length) {
//     const instCard = document.createElement("div");
//     instCard.className = "card";
//     instCard.innerHTML = `<div class="title" style="text-transform: none;">Steps to resolve:</div>`;
//     const ul = document.createElement("ul");
//     ul.style.fontSize = "13px";
//     result.instructions.forEach(step => {
//       const li = document.createElement("li");
//       li.textContent = step;
//       ul.appendChild(li);
//     });
//     instCard.appendChild(ul);
//     wrap.appendChild(instCard);
//   }

//   // הצגת שינויי קוד ללא כפילויות
//   const changes = Array.isArray(result?.changes) ? result.changes : [];
//   changes.forEach(c => wrap.appendChild(renderChangeCard(c)));

//   return wrap;
// }

// // function addIssue(payload) {
// //   // פונקציית isSolvable המקורית שלך
// //   if (typeof isSolvable === 'function' && !isSolvable(payload)) return;

// //   const ts = payload.timestamp || Date.now();
// //   const card = document.createElement("div");
// //   card.className = "card";
// //   card.innerHTML = `
// //     <div class="title" style="text-transform: none;">Issue detected <span class="pill">${payload.source}</span></div>
// //     <div class="meta">${payload.file ? payload.file + (payload.line ? ':' + payload.line : '') : 'Runtime location'}</div>
// //     <div class="msg">${escapeHtml(payload.message)}</div>
// //     <div id="actions-${ts}"></div>
// //     <div id="result-${ts}" class="details"></div>
// //   `;

// //   container.prepend(card);

// //   const btnSolve = document.createElement("button");
// //   btnSolve.className = "solve";
// //   btnSolve.textContent = "Solve with AI";
  
// //   const resultHost = card.querySelector(`#result-${ts}`);
// //   card.querySelector(`#actions-${ts}`).appendChild(btnSolve);

// //   btnSolve.onclick = async () => {
// //     if (btnSolve.disabled) return;
    
// //     btnSolve.disabled = true;
// //     btnSolve.textContent = "Analyzing...";
// //     resultHost.innerHTML = ""; // ניקוי תוצאות קודמות למניעת כפילות

// //     try {
// //       const res = await fetch("http://127.0.0.1:4000/ingest-error", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(payload)
// //       });

// //       if (!res.ok) throw new Error(`Server error: ${res.status}`);

// //       const data = await res.json();
// //       if (data.analysis) {
// //         resultHost.innerHTML = ""; // ניקוי נוסף לפני הזרקת התוצאה הסופית
// //         resultHost.appendChild(renderResult(data.analysis));
// //         btnSolve.textContent = "Analysis complete";
// //       }
// //     } catch (e) {
// //       resultHost.innerHTML = `<div class="msg" style="color:#b91c1c; background:#fef2f2;">Error: ${e.message}</div>`;
// //       btnSolve.disabled = false;
// //       btnSolve.textContent = "Try again";
// //     }
// //   };
// // }
// let chatHistories = {}; // אובייקט שיחזיק היסטוריה לכל שגיאה לפי ID

// function addIssue(payload) {

//   if (typeof isSolvable === 'function' && !isSolvable(payload)) return;
// document.body.classList.add('has-content');
//   const ts = payload.timestamp || Date.now();
//   const card = document.createElement("div");
//   card.className = "card";
//   card.innerHTML = `
//     <div class="title" style="text-transform: none;">Issue detected <span class="pill">${payload.source}</span></div>
//     <div class="meta">${payload.file ? payload.file + (payload.line ? ':' + payload.line : '') : 'Runtime location'}</div>
//     <div class="msg">${escapeHtml(payload.message)}</div>
//     <div id="actions-${ts}"></div>
//     <div id="result-${ts}" class="details"></div>
//   `;

//   container.prepend(card);

//   const btnSolve = document.createElement("button");
//   btnSolve.className = "solve";
//   btnSolve.textContent = "Solve with AI";
  
//   const resultHost = card.querySelector(`#result-${ts}`);
//   card.querySelector(`#actions-${ts}`).appendChild(btnSolve);

//   btnSolve.onclick = async () => {
//     if (btnSolve.disabled) return;
    
//     btnSolve.disabled = true;
//     btnSolve.textContent = "Analyzing...";
//     resultHost.innerHTML = ""; 

//     try {
//       const res = await fetch("http://127.0.0.1:4000/ingest-error", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       if (!res.ok) throw new Error(`Server error: ${res.status}`);

//       const data = await res.json();
      
//       if (data.analysis) {
//         resultHost.innerHTML = ""; 
//         resultHost.appendChild(renderResult(data.analysis));
//         btnSolve.textContent = "Analysis complete";

//         // --- כאן נכנס הצאט! ---
//         if (data.id) {
//             // מאתחלים היסטוריה ריקה לשגיאה הזו
//             chatHistories[data.id] = []; 
//             createChatInterface(card, data.id);
//         }
//       }
//     } catch (e) {
//       resultHost.innerHTML = `<div class="msg" style="color:#b91c1c; background:#fef2f2;">Error: ${e.message}</div>`;
//       btnSolve.disabled = false;
//       btnSolve.textContent = "Try again";
//     }
//   };
// }

// // מאזין לאירועים מה-bridge
// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.action === "NEW_EVENT") addIssue(msg.payload);
//   if (msg.action === "CLEAR") container.innerHTML = "";
// });

// // פונקציות עזר שהיו חסרות או שונו
// function isSolvable(p) {
//   if (!p || !p.message) return false;
//   return true;
// }

// // פונקציית עזר לציור בועות
// function renderBubble(role, text, containerId) {
//     const container = document.getElementById(containerId);
//     const bubble = document.createElement('div');
//     bubble.className = `chat-bubble ${role}`;
//     bubble.textContent = text;
//     container.appendChild(bubble);
//     container.scrollTop = container.scrollHeight;
// }

// // הפונקציה המרכזית לשליחת הודעה - מעודכנת עם לוגיקת קבצים

// async function requestFileContentFromPage(fileName) {
//     return new Promise((resolve, reject) => {
//         chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//             chrome.tabs.sendMessage(tabs[0].id, {action: "READ_FILE", fileName}, (response) => {
//                 if (response && response.content) resolve(response.content);
//                 else reject("File not found");
//             });
//         });
//     });
// }
// function openFloatingChat(errorId, initialMessage) {
//     // יצירת ה-HTML של ה-Modal אם הוא לא קיים
//     let modal = document.getElementById('chat-modal');
//     if (!modal) {
//         modal = document.createElement('div');
//         modal.id = 'chat-modal';
//         modal.className = 'chat-overlay'; // ה-CSS שכתבנו קודם
//         document.body.appendChild(modal);
//     }

//     modal.style.display = 'flex';
//     modal.innerHTML = `
//         <div class="chat-header">
//             <span>Gemini Debugger</span>
//             <span class="close-chat" onclick="this.parentElement.parentElement.style.display='none'">×</span>
//         </div>
//         <div class="chat-messages" id="modal-msgs"></div>
//         <div class="chat-input-area">
//             <input type="text" id="modal-input" class="chat-input" placeholder="Ask follow up...">
//             <button class="btn-send" id="modal-send">➔</button>
//         </div>
//     `;

//     // קישור כפתור השליחה בתוך המודל
//     const input = modal.querySelector('#modal-input');
//     const sendBtn = modal.querySelector('#modal-send');
    
//     const handleSend = () => {
//         const text = input.value.trim();
//         if (text) {
//             renderBubble('user', text, 'modal-msgs');
//             sendChatMessage(errorId, text, 'modal-msgs');
//             input.value = '';
//         }
//     };

//     sendBtn.onclick = handleSend;
//     input.onkeypress = (e) => { if(e.key === 'Enter') handleSend(); };
// }
// function createChatInterface(card, errorId) {
//     // מונע יצירה כפולה של הצאט
//     if (card.querySelector('.chat-container')) return;

//     const chatContainer = document.createElement('div');
//     chatContainer.className = 'chat-container';
//     chatContainer.style.display = 'block';

//     chatContainer.innerHTML = `
//         <div class="chat-messages" id="chat-msgs-${errorId}">
//             <div class="chat-bubble ai">היי! אני מכיר את השגיאה הזו עכשיו. יש לך שאלות נוספות עליה?</div>
//         </div>
//         <div class="chat-input-area">
//             <input type="text" class="chat-input" placeholder="Ask Gemini something..." id="input-${errorId}">
//             <button class="btn-send" id="send-${errorId}">➔</button>
//         </div>
//     `;

//     card.appendChild(chatContainer);

//     const input = chatContainer.querySelector('.chat-input');
//     const sendBtn = chatContainer.querySelector('.btn-send');

//     const handleSend = () => {
//         const text = input.value.trim();
//         if (text) {
//             sendChatMessage(errorId, text, card);
//             input.value = '';
//         }
//     };

//     sendBtn.onclick = handleSend;
//     input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
// }
// // async function sendChatMessage(errorId, message, card) {
// //     const msgsContainer = card.querySelector(`#chat-msgs-${errorId}`);
// //     if (!chatHistories[errorId]) chatHistories[errorId] = [];

// //     // 1. הודעת משתמש
// //     const userBubble = document.createElement('div');
// //     userBubble.className = 'chat-bubble user';
// //     userBubble.textContent = message;
// //     msgsContainer.appendChild(userBubble);
// //     msgsContainer.scrollTop = msgsContainer.scrollHeight;

// //     chatHistories[errorId].push({ role: "user", content: message });

// //     try {
// //         const response = await fetch("http://127.0.0.1:4000/chat", {
// //             method: "POST",
// //             headers: { "Content-Type": "application/json" },
// //             body: JSON.stringify({
// //                 error_id: errorId,
// //                 history: chatHistories[errorId]
// //             })
// //         });

// //         const data = await response.json();

// //         // 2. תגובת AI
// //         const aiBubble = document.createElement('div');
// //         aiBubble.className = 'chat-bubble ai';
// //         aiBubble.textContent = data.text;
// //         msgsContainer.appendChild(aiBubble);
// //         msgsContainer.scrollTop = msgsContainer.scrollHeight;

// //         chatHistories[errorId].push({ role: "assistant", content: data.text });

// //     } catch (e) {
// //         console.error("Chat Error:", e);
// //         const errBubble = document.createElement('div');
// //         errBubble.className = 'chat-bubble ai';
// //         errBubble.style.color = 'red';
// //         errBubble.textContent = "Connection lost. Is the server running?";
// //         msgsContainer.appendChild(errBubble);
// //     }
// // }
// async function sendChatMessage(errorId, message, containerId, filesData = null) {
//     if (!chatHistories[errorId]) chatHistories[errorId] = [];
    
//     chatHistories[errorId].push({ role: "user", content: message });

//     try {
//         const response = await fetch("http://127.0.0.1:4000/chat", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 error_id: errorId,
//                 history: chatHistories[errorId],
//                 files: filesData // שליחת הקבצים אם קיימים
//             })
//         });

//         const data = await response.json();

//         // אם ה-AI מבקש קבצים
//         if (data.type === "file_request") {
//             renderBubble('ai', "I'm analyzing your source code...", containerId);
//             const collectedFiles = {};
//             for (const f of data.files) {
//                 try {
//                     collectedFiles[f] = await requestFileContentFromPage(f);
//                 } catch(e) { collectedFiles[f] = "Error reading file"; }
//             }
//             // שליחה חוזרת אוטומטית עם הקבצים
//             return sendChatMessage(errorId, "[System: Files Provided]", containerId, collectedFiles);
//         }

//         renderBubble('ai', data.text, containerId);
//         chatHistories[errorId].push({ role: "assistant", content: data.text });

//     } catch (e) {
//         renderBubble('ai', "Error connecting to server.", containerId);
//     }
// }
const container = document.getElementById("log-container");
let chatHistories = {}; 

// --- עזרי תצוגה והעתקה ---
function escapeHtml(s) {
    return String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function copyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

// --- רינדור תוצאות הניתוח המקורי ---
// function renderResult(result) {
//     const wrap = document.createElement("div");
//     wrap.className = "details";
    
//     wrap.innerHTML = `
//         <div class="title" style="color: #059669; text-transform: none;">AI Analysis</div>
//         <div class="msg" style="background:#f0fdf4; color:#166534; border-left:4px solid #22c55e; padding: 10px;">
//             ${escapeHtml(result?.summary || "Analysis complete.")}
//         </div>
//     `;

//     if (result.changes) {
//         result.changes.forEach(change => {
//             const card = document.createElement("div");
//             card.className = "card";
//             card.style.marginTop = "10px";
//             card.innerHTML = `
//                 <div class="meta">File: ${change.file}</div>
//                 <div class="grid2">
//                     <div class="box"><div class="colTitle">Original</div><pre>${escapeHtml(change.before)}</pre></div>
//                     <div class="box"><div class="colTitle">Proposed</div><pre>${escapeHtml(change.after || change.code)}</pre></div>
//                 </div>
//             `;
//             wrap.appendChild(card);
//         });
//     }
//     return wrap;
// }

// --- לוגיקת הצ'אט הצף (Floating Chat) ---
function renderResult(result) {
    const wrap = document.createElement("div");
    wrap.className = "details";
    
    wrap.innerHTML = `
        <div class="title" style="color: #059669; text-transform: none;">AI Analysis</div>
        <div class="msg" style="background:#f0fdf4; color:#166534; border-left:4px solid #22c55e; padding: 10px;">
            ${escapeHtml(result?.summary || "Analysis complete.")}
        </div>
    `;

    if (result.changes) {
        result.changes.forEach(change => {
            const card = document.createElement("div");
            card.className = "card";
            card.style.marginTop = "10px";
            
            const fixCode = change.after || change.code;
            
            card.innerHTML = `
                <div class="meta">File: ${change.file}</div>
                <div class="grid2">
                    <div class="box"><div class="colTitle">Original</div><pre>${escapeHtml(change.before)}</pre></div>
                    <div class="box"><div class="colTitle">Proposed</div><pre>${escapeHtml(fixCode)}</pre></div>
                </div>
            `;

            // הוספת כפתור העתקה לכל שינוי קוד
            const btnCopyFix = document.createElement("button");
            btnCopyFix.className = "btn-copy"; // או solve אם את רוצה כחול
            btnCopyFix.style.marginTop = "10px";
            btnCopyFix.textContent = "📋 Copy Fix";
            btnCopyFix.onclick = () => {
                copyToClipboard(fixCode);
                btnCopyFix.textContent = "✅ Copied!";
                setTimeout(() => btnCopyFix.textContent = "📋 Copy Fix", 2000);
            };

            card.appendChild(btnCopyFix);
            wrap.appendChild(card);
        });
    }
    return wrap;
}

function renderBubble(role, text, containerId) {
    const msgsContainer = document.getElementById(containerId);
    if (!msgsContainer) {
        console.error("Could not find chat container:", containerId);
        return;
    }
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = text;
    msgsContainer.appendChild(bubble);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
}

// async function requestFileContentFromPage(fileName) {
//     return new Promise((resolve) => {
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//             if (!tabs[0]) return resolve("Error: No active tab");
//             chrome.tabs.sendMessage(tabs[0].id, { action: "READ_FILE", fileName }, (response) => {
//                 resolve(response?.content || "File not found");
//             });
//         });
//     });
// }

// --- לוגיקת הצ'אט הצף (Floating Chat) מעודכנת ---
function openFloatingChat(errorId, originalPayload, filesToAutoSend = null) {
    let modal = document.getElementById('chat-modal');
    if (!modal) return;

    // 1. עדכון כותרת
    const chatTitle = modal.querySelector('.chat-header span:first-child');
    if (chatTitle && originalPayload) {
        const msg = originalPayload.message || "Issue";
        chatTitle.textContent = `Fixing: ${msg.substring(0, 30)}...`;
    }

    modal.style.display = 'flex';
    const msgsArea = document.getElementById('modal-msgs');
    msgsArea.innerHTML = ''; 
    
    renderBubble('ai', "I have analyzed the error. How can I help?", 'modal-msgs');

    // --- החלק החשוב: שליחה אוטומטית אם יש קבצים ---
    if (filesToAutoSend) {
        console.log("[JS LOG] Auto-sending files to chat...", filesToAutoSend);
        renderBubble('ai', "Sending full source code to Gemini for deep analysis...", 'modal-msgs');
        sendChatMessage(errorId, "[System: Source code provided]", 'modal-msgs', filesToAutoSend);
    }

    const input = document.getElementById('modal-input');
    const sendBtn = document.getElementById('modal-send');
    
    const newSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

    const handleSend = () => {
        const text = input.value.trim();
        if (text) {
            renderBubble('user', text, 'modal-msgs');
            sendChatMessage(errorId, text, 'modal-msgs');
            input.value = '';
        }
    };

    newSendBtn.onclick = handleSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
}

// async function sendChatMessage(errorId, message, containerId, filesData = null) {
//     if (!chatHistories[errorId]) chatHistories[errorId] = [];
    
//     // מוסיפים להיסטוריה רק אם זה לא הודעת מערכת אוטומטית
//     if (message !== "[System: Source code provided]") {
//         chatHistories[errorId].push({ role: "user", content: message });
//     }

//     try {
//         console.log(`[JS LOG] Sending message to /chat. Files included: ${!!filesData}`);
      
//         const response = await fetch("http://127.0.0.1:4000/chat", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 error_id: errorId,
//                 history: chatHistories[errorId],
//                 files: filesData // כאן עובר הקוד של App.jsx וכו'
//             })
//         });

//         const data = await response.json();
//         console.log("[DEBUG FRONTEND] Response from AI:", JSON.stringify(data, null, 2));

//         // אם בתוך הצ'אט ה-AI שוב מבקש קבצים
//         if (data.type === "file_request") {
//             renderBubble('ai', `אני זקוק לקבצים: ${data.files.join(', ')}`, containerId);
//             const collectedFiles = {};
//             for (const f of data.files) {
//                 try { collectedFiles[f] = await requestFileContent(f); } catch(e) { collectedFiles[f] = "Error reading"; }
//             }
//             return sendChatMessage(errorId, "[System: Source code provided]", containerId, collectedFiles);
//         }

//         renderBubble('ai', data.text, containerId);
//         chatHistories[errorId].push({ role: "assistant", content: data.text });

//     } catch (e) {
//         console.error("[JS LOG] Chat Error:", e);
//         renderBubble('ai', "שגיאת חיבור לשרת.", containerId);
//     }
// }
// function openFloatingChat(errorId) {
//     let modal = document.getElementById('chat-modal');
//     if (!modal) return; // לוודא שה-HTML קיים

//     modal.style.display = 'flex';
//     const msgsArea = document.getElementById('modal-msgs');
//     msgsArea.innerHTML = ''; // ניקוי צ'אט קודם
    
//     renderBubble('ai', "I've analyzed this error. Any questions about the fix?", 'modal-msgs');

//     const input = document.getElementById('modal-input');
//     const sendBtn = document.getElementById('modal-send');
    
//     // ניקוי מאזינים קודמים למניעת כפילויות שליחה
//     const newSendBtn = sendBtn.cloneNode(true);
//     sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

//     const handleSend = () => {
//         const text = input.value.trim();
//         if (text) {
//             renderBubble('user', text, 'modal-msgs');
//             sendChatMessage(errorId, text, 'modal-msgs');
//             input.value = '';
//         }
//     };

//     newSendBtn.onclick = handleSend;
//     input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
// }

// // --- הוספת שגיאה חדשה לרשימה ---
// function addIssue(payload) {
//     document.body.classList.add('has-content');
//     const ts = payload.timestamp || Date.now();
//     const card = document.createElement("div");
//     card.className = "card";
//     card.innerHTML = `
//         <div class="title">Issue detected <span class="pill">${payload.source}</span></div>
//         <div class="meta">${payload.file || 'Runtime'}:${payload.line || ''}</div>
//         <div class="msg">${escapeHtml(payload.message)}</div>
//         <div id="actions-${ts}"></div>
//         <div id="result-${ts}"></div>
//     `;

//     container.prepend(card);

//     const btnSolve = document.createElement("button");
//     btnSolve.className = "solve";
//     btnSolve.textContent = "Solve with AI";
//     card.querySelector(`#actions-${ts}`).appendChild(btnSolve);

//     btnSolve.onclick = async () => {
//         btnSolve.disabled = true;
//         btnSolve.textContent = "Analyzing...";
        
//         try {
//             const res = await fetch("http://127.0.0.1:4000/ingest-error", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload)
//             });
//             const data = await res.json();
            
//             if (data.analysis) {
//                 const resultHost = card.querySelector(`#result-${ts}`);
//                 resultHost.appendChild(renderResult(data.analysis));
                
//                 // כפתור פתיחת הצ'אט הצף
//                 const chatBtn = document.createElement("button");
//                 chatBtn.className = "btn-open-chat";
//                 chatBtn.innerHTML = "💬 Consult Gemini Expert";
//                 // chatBtn.onclick = () => openFloatingChat(data.id);
//                 chatBtn.onclick = () => openFloatingChat(data.id, payload);
//                 resultHost.appendChild(chatBtn);
//             }
//             btnSolve.textContent = "Analysis Complete";
//         } catch (e) {
//             btnSolve.disabled = false;
//             btnSolve.textContent = "Try again";
//         }
//     };
// }
async function sendChatMessage(errorId, message, containerId, filesData = null) {
    if (!chatHistories[errorId]) chatHistories[errorId] = [];
    
    // מוסיפים להיסטוריה רק הודעות אמיתיות של המשתמש
    if (message !== "[System: Providing requested files]") {
        chatHistories[errorId].push({ role: "user", content: message });
    }

    try {
    console.log("[DEBUG] Full frontend filesData:",filesData );

        const response = await fetch("http://127.0.0.1:4000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error_id: errorId,
                history: chatHistories[errorId],
                files: filesData 
            })
        });

        const data = await response.json();
console.log("[DEBUG] Full Server Response:", data);
        // בדיקה: האם ה-AI ביקש קבצים בתוך הצ'אט?
        if (data.type === "file_request") {
            // אנחנו לא מרנדרים בועה של ה-AI כאן! עושים זאת "שקוף"
            const collectedFiles = {};
            for (const f of data.files) {
                try { 
                    collectedFiles[f] = await requestFileContent(f); 
                } catch(e) { 
                    collectedFiles[f] = "Error reading file"; 
                }
            }
            // קריאה חוזרת לעצמנו עם הקבצים
            return sendChatMessage(errorId, "[System: Providing requested files]", containerId, collectedFiles);
        }

        // הגענו לכאן? זה אומר שיש לנו תשובה סופית (data.text)
        renderBubble('ai', data.text, containerId);
        chatHistories[errorId].push({ role: "assistant", content: data.text });

        // אם התשובה כוללת גם שינויי קוד (Changes), אפשר לרנדר אותם מתחת לבועה
        if (data.changes && data.changes.length > 0) {
            const msgsContainer = document.getElementById(containerId);
            msgsContainer.appendChild(renderResult({ summary: "Proposed Changes:", changes: data.changes }));
        }

    } catch (e) {
        console.error("[JS LOG] Chat Error:", e);
        renderBubble('ai', "שגיאת חיבור לשרת.", containerId);
    }
}
async function addIssue(payload) {
    document.body.classList.add('has-content');
    const ts = payload.timestamp || Date.now();
    const container = document.getElementById("log-container"); // וודאי שהקונטיינר מוגדר
    
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <div class="title">Issue detected <span class="pill">${payload.source}</span></div>
        <div class="meta">${payload.file || 'Runtime'}:${payload.line || ''}</div>
        <div class="msg">${payload.message}</div>
        <div id="actions-${ts}"></div>
        <div id="result-${ts}"></div>
    `;

    container.prepend(card);

    const btnSolve = document.createElement("button");
    btnSolve.className = "solve";
    btnSolve.textContent = "Solve with AI";
    card.querySelector(`#actions-${ts}`).appendChild(btnSolve);

    // btnSolve.onclick = async () => {
    //     btnSolve.disabled = true;
    //     btnSolve.textContent = "Analyzing...";
    //     console.log("[JS LOG] Starting analysis for:", payload.message);
        
    //     try {
    //         const res = await fetch("http://127.0.0.1:4000/ingest-error", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(payload)
    //         });
    //         const data = await res.json();
    //         const analysis = data.analysis;

    //         console.log("[JS LOG] Analysis result:", analysis);

    //         const resultHost = card.querySelector(`#result-${ts}`);
    //         resultHost.innerHTML = ""; // ניקוי תוצאות קודמות

    //         // בדיקה: האם ה-AI ביקש קובץ כי ה-Snippet לא הספיק?
    //         if (analysis.type === "file_request") {
    //             console.log("[JS LOG] AI requested a file. Fetching automatically...");
    //             const fileName = analysis.files[0];
                
    //             try {
    //                 const content = await requestFileContent(fileName);
    //                 console.log("[JS LOG] File content retrieved. Opening chat with full context.");
                    
    //                 // פתיחת הצ'אט אוטומטית עם הקוד שנשלף
    //                 openFloatingChat(data.id, payload, { [fileName]: content });
    //                 resultHost.innerHTML = `<div class="status-msg">📂 File ${fileName} retrieved. Chat opened for full analysis.</div>`;
    //             } catch (err) {
    //                 console.error("[JS LOG] Failed to get file:", err);
    //                 resultHost.innerHTML = `<div class="error-msg">Could not find file: ${fileName}</div>`;
    //             }
    //         } else {
    //             // הצגת תוצאה רגילה
    //             resultHost.appendChild(renderResult(analysis));
                
    //             const chatBtn = document.createElement("button");
    //             chatBtn.className = "btn-open-chat";
    //             chatBtn.innerHTML = "💬 Consult Gemini Expert";
    //             chatBtn.onclick = () => openFloatingChat(data.id, payload);
    //             resultHost.appendChild(chatBtn);
    //         }
            
    //         btnSolve.textContent = "Analysis Complete";
    //     } catch (e) {
    //         console.error("[JS LOG] Error:", e);
    //         btnSolve.disabled = false;
    //         btnSolve.textContent = "Try again";
    //     }
    // };
btnSolve.onclick = async () => {
    btnSolve.disabled = true;
    btnSolve.textContent = "Analyzing...";
    console.log("[DEBUG] Full frontend Req:", payload);
    try {
        const res = await fetch("http://127.0.0.1:4000/ingest-error", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        const analysis = data.analysis;
console.log("[DEBUG] Full Server Response:", data);
        const resultHost = card.querySelector(`#result-${ts}`);
        resultHost.innerHTML = "";

        // אם הניתוח הראשוני אומר שהוא חייב קבצים - נפתח את הצ'אט מיד
        if (analysis.type === "file_request") {
            resultHost.innerHTML = `<div class="status-msg">📂 Additional context needed. Opening expert chat...</div>`;
            // פתיחת הצ'אט עם רשימת הקבצים שה-AI ביקש
            openFloatingChat(data.id, payload, analysis.files); 
        } else {
            // הצגת תוצאה רגילה
            resultHost.appendChild(renderResult(analysis));
            const chatBtn = document.createElement("button");
            chatBtn.className = "btn-open-chat";
            chatBtn.innerHTML = "💬 Consult Gemini Expert";
            chatBtn.onclick = () => openFloatingChat(data.id, payload);
            resultHost.appendChild(chatBtn);
        }
        
        btnSolve.textContent = "Analysis Complete";
    } catch (e) {
        btnSolve.disabled = false;
        btnSolve.textContent = "Try again";
    }
};
    }
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "NEW_EVENT") addIssue(msg.payload);
});
// function requestFileContent(fileName) {

//     return new Promise((resolve, reject) => {
//         // ה-API של כרום שמאפשר לקבל את כל המשאבים של הדף
//         chrome.devtools.inspectedWindow.getResources((resources) => {
//             const target = resources.find(r => r.url.includes(fileName));
//             if (target) {
//                 target.getContent((content) => {
//                     resolve(content);
//                 });
//             } else {
//                 reject("File not found");
//             }
//         });
//     });
// }
//מביא קוד מקומפל-עובד
// function requestFileContent(fileName) {
//     return new Promise((resolve, reject) => {
//         chrome.devtools.inspectedWindow.getResources((resources) => {
//             // 1. ניקוי שם הקובץ שקיבלנו מה-AI (למקרה שהוא בכל זאת שלח נתיב)
//             const cleanName = fileName.split('/').pop().split('?')[0]; 
            
//             // 2. חיפוש גמיש - האם ה-URL של המשאב מסתיים בשם הקובץ שחיפשנו?
//             const target = resources.find(r => {
//                 const urlPath = r.url.split('?')[0]; // התעלמות מפרמטרים של Cache
//                 return urlPath.endsWith(cleanName);
//             });

//             if (target) {
//                 target.getContent((content) => resolve(content));
//             } else {
//                 console.error("[JS LOG] Could not find file among resources:", cleanName);
//                 reject(`File not found: ${cleanName}`);
//             }
//         });
//     });
// }
/**
 * פונקציית עזר לניקוי רעשי פיתוח של Vite מהקוד
 */
function stripViteNoise(code) {
    if (!code) return "";
    return code
        // הסרת בלוק ה-HMR (Hot Module Replacement) שויט מזריק בסוף הקובץ
        .replace(/if\s*\(import\.meta\.hot\)\s*\{[\s\S]*?\}/g, '')
        // ניקוי ייבואים פנימיים של Vite אם קיימים
        .replace(/import\s+.*?\s+from\s+["']\/@vite\/client["'];?/g, '')
        .trim();
}

function requestFileContent(fileName) {
    return new Promise((resolve, reject) => {
        chrome.devtools.inspectedWindow.getResources((resources) => {
            // 1. ניקוי שם הקובץ (הסרת נתיבים אבסולוטיים ופרמטרים)
            const cleanName = fileName.split('/').pop().split('?')[0]; 
            
            console.log(`[DEBUG] Searching for source file: ${cleanName}`);

            // 2. דירוג משאבים לפי סבירות שהם קוד מקור
            let bestMatch = null;
            let priority = -1;

            for (const resource of resources) {
                const url = resource.url.split('?')[0];
                
                if (url.endsWith(cleanName)) {
                    // עדיפות גבוהה ביותר: נתיב שכולל /src/ (קוד מקור אמיתי)
                    if (url.includes('/src/') && priority < 2) {
                        bestMatch = resource;
                        priority = 2;
                    } 
                    // עדיפות בינונית: קובץ JSX/TSX (סביר להניח שזה מקור)
                    else if ((url.endsWith('.jsx') || url.endsWith('.tsx')) && priority < 1) {
                        bestMatch = resource;
                        priority = 1;
                    }
                    // עדיפות נמוכה: כל קובץ אחר שמתאים לשם (אולי מקומפל)
                    else if (priority < 0) {
                        bestMatch = resource;
                        priority = 0;
                    }
                }
            }

            if (bestMatch) {
                console.log(`[DEBUG] Selected resource for ${cleanName}:`, bestMatch.url);
                bestMatch.getContent((content, encoding) => {
                    // ניקוי הקוד לפני החזרה כדי שה-AI יקבל JSX נקי
                    const cleanCode = stripViteNoise(content);
                    resolve(cleanCode);
                });
            } else {
                console.error("[JS LOG] Could not find file among resources:", cleanName);
                reject(`File not found: ${cleanName}`);
            }
        });
    });
}
// פונקציה לסגירת הצ'אט
function closeChat() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        modal.style.display = 'none';
        // אופציונלי: לנקות את ההודעות כשסוגרים כדי להתחיל נקי בפעם הבאה
        // document.getElementById('modal-msgs').innerHTML = '';
    }
}

// ודואים שה-X ב-HTML קשור לפונקציה (למרות שיש onclick, זה נותן לנו שליטה ב-JS)
document.querySelector('.close-chat').onclick = closeChat;