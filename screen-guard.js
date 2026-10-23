// --- KidsWorld Universal Screen Lock Guard ---
(function () {
    const DEFAULT_PIN = "123";

    // 1. Initial State Sync
    if (!localStorage.getItem("screenTimeRemaining")) {
        const savedLimitMinutes = localStorage.getItem("screenTimeLimit") || 15;
        localStorage.setItem("screenTimeRemaining", parseInt(savedLimitMinutes) * 60);
    }

    // 2. Inject Parental Lock Modal in HTML dynamically
    function injectLockModal() {
        if (document.getElementById("universalLockOverlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "universalLockOverlay";
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(10px);
            z-index: 999999;
            align-items: center;
            justify-content: center;
            font-family: 'Fredoka', 'Quicksand', cursive, sans-serif;
            user-select: none;
        `;

        overlay.innerHTML = `
            <div style="background: #ffffff; border-radius: 32px; padding: 32px 24px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 5px solid #f59e0b;">
                <div style="font-size: 4rem; line-height: 1;">🔒</div>
                <h2 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 12px 0 6px 0;">Play Time Over!</h2>
                <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 20px;">Daily screen limit reached. Parents must enter the PIN to unlock.</p>
                
                <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 20px; padding: 16px; margin-bottom: 20px;">
                    <label style="display: block; font-size: 0.75rem; font-weight: 800; color: #475569; margin-bottom: 8px;">ENTER PARENT PIN</label>
                    <input type="password" id="universalPinInput" maxlength="8" placeholder="••••" style="width: 100%; text-align: center; letter-spacing: 8px; font-size: 1.8rem; font-weight: 800; padding: 8px 12px; border: 2px solid #cbd5e1; border-radius: 14px; outline: none; background: white;">
                    <div id="universalPinError" style="color: #ef4444; font-size: 0.8rem; font-weight: 700; margin-top: 8px; display: none;">❌ Incorrect PIN! Try again.</div>
                </div>

                <button id="btnUnlockSite" style="width: 100%; background: #0284c7; color: white; border: none; border-radius: 18px; padding: 14px; font-size: 1.1rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 0 #0369a1;">
                    🔓 Unlock Website
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("btnUnlockSite").addEventListener("click", verifyPin);
        document.getElementById("universalPinInput").addEventListener("keyup", function (e) {
            if (e.key === "Enter") verifyPin();
        });
    }

    function showLock() {
        injectLockModal();
        const overlay = document.getElementById("universalLockOverlay");
        if (overlay) {
            overlay.style.display = "flex";
            const pinInp = document.getElementById("universalPinInput");
            if (pinInp && document.activeElement !== pinInp) {
                pinInp.focus();
            }
            const err = document.getElementById("universalPinError");
            if (err) err.style.display = "none";
        }
    }

    function hideLock() {
        const overlay = document.getElementById("universalLockOverlay");
        if (overlay) overlay.style.display = "none";
    }

    function verifyPin() {
        const pinInput = document.getElementById("universalPinInput");
        const entered = pinInput ? pinInput.value.trim() : "";
        const saved = localStorage.getItem("parentPin") || DEFAULT_PIN;
        const err = document.getElementById("universalPinError");

        if (entered === saved) {
            hideLock();
            const limitMinutes = localStorage.getItem("screenTimeLimit") || 15;
            localStorage.setItem("screenTimeRemaining", parseInt(limitMinutes) * 60);
        } else {
            if (err) err.style.display = "block";
            if (pinInput) {
                pinInput.value = "";
                pinInput.focus();
            }
        }
    }

    // Guard against multiple interval instances on the same page
    if (window.__kidsWorldTimerInitialized) return;
    window.__kidsWorldTimerInitialized = true;

    // 3. Single Robust Countdown Loop
    setInterval(() => {
        const overlay = document.getElementById("universalLockOverlay");
        const isLockedOpen = overlay && overlay.style.display === "flex";

        if (isLockedOpen) return; // Modal open hone par background timer pause rahega

        let remaining = parseInt(localStorage.getItem("screenTimeRemaining"));
        
        if (isNaN(remaining)) {
            const limitMinutes = localStorage.getItem("screenTimeLimit") || 15;
            remaining = parseInt(limitMinutes) * 60;
        }

        if (remaining > 0) {
            remaining--;
            localStorage.setItem("screenTimeRemaining", remaining);
        }

        // Timer display update on UI
        const timerDisplays = document.querySelectorAll("#sessionTimer, #timer-display");
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        timerDisplays.forEach(el => el.textContent = formatted);

        if (remaining <= 0) {
            showLock();
        }
    }, 1000);

    window.addEventListener("storage", (e) => {
        if (e.key === "screenTimeRemaining") {
            const val = parseInt(e.newValue);
            if (val <= 0) showLock();
            else hideLock();
        }
    });

    window.addEventListener("DOMContentLoaded", () => {
        const remaining = parseInt(localStorage.getItem("screenTimeRemaining"));
        if (!isNaN(remaining) && remaining <= 0) {
            showLock();
        }
    });
})();