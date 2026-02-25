// member.js (최종 버전)

// ==========================================================
// 💡 쿠키 관련 유틸리티 함수
// ==========================================================
function getCookie(name) {
    const searchName = name + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(searchName) === 0) {
            return cookie.substring(searchName.length, cookie.length);
        }
    }
    return null;
}

function setLoginCookie(value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = "loggedIn=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

// ==========================================================
// 💡 랭킹 관련 유틸리티 함수
// ==========================================================

/**
 * 초 단위의 시간(예: 83.4567)을 "MM:SS.ms" 형식의 문자열로 포맷팅합니다.
 * 소수점 이하는 백분의 1초(두 자리)로 반올림하여 표시합니다.
 * @param {number|string} timeInSeconds - 총 초(Seconds) 값
 * @returns {string} 변환된 시간 문자열 (예: "01:23.46") 또는 "기록 없음"
 */
function formatTime(timeInSeconds) {
    let timeToFormat;
    if (typeof timeInSeconds === 'string') {
        timeToFormat = parseFloat(timeInSeconds);
    } else {
        timeToFormat = timeInSeconds;
    }

    if (typeof timeToFormat !== 'number' || isNaN(timeToFormat) || timeToFormat <= 0) {
        return '기록 없음';
    }

    // 1. 소수점 셋째 자리(천분의 1초)에서 반올림하여 백분의 1초(두 자리)까지 유지
    // 예: 83.4567 -> 83.46
    const roundedTime = Math.round(timeToFormat * 100) / 100;

    // 2. 분 계산 (정수)
    const minutes = Math.floor(roundedTime / 60);

    // 3. 초 계산 (분 제외한 나머지 초)
    const remainingSeconds = roundedTime % 60;

    // 4. 포맷팅
    const formattedMinutes = String(minutes).padStart(2, '0'); // 1 -> '01'

    // 초의 정수 부분 (00~59)
    const secondsInteger = Math.floor(remainingSeconds); // 23
    const formattedSecondsInteger = String(secondsInteger).padStart(2, '0'); // '23'

    // 초의 소수 부분 (백분의 1초, 두 자리)
    // 23.46 -> 0.46 * 100 = 46.00 -> 46
    const fractionalPart = Math.round((remainingSeconds - secondsInteger) * 100);
    const formattedFractionalPart = String(fractionalPart).padStart(2, '0'); // 46 -> '46'

    return `${formattedMinutes}:${formattedSecondsInteger}.${formattedFractionalPart}`; // "MM:SS.ms" 형식
}


// ==========================================================
// 💡 랭킹 데이터 표시 함수 (rank.html 전용 - 주석 처리)
// 이전 코드와의 중복을 피하기 위해 주석 처리합니다.
// ==========================================================

/*
async function fetchAndDisplayRanks() {
    // ... (기존 fetchAndDisplayRanks 함수 내용)
}
*/


// ==========================================================
// 💡 DOMContentLoaded 이벤트 리스너 (Main Page Logic)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start_btn");
    const loginBtn = document.getElementById("login_btn");
    const rankBtn = document.getElementById("rank_btn");

    // 💡 [추가] 랭킹 버튼 클릭 시 로그인 상태 확인
    if (rankBtn) {
        rankBtn.addEventListener("click", () => {
            const isLoggedIn = getCookie('loggedIn') === 'true';

            if (isLoggedIn) {
                window.location.href = "rank.html";
            } else {
                alert("로그인 후 랭킹을 확인하실 수 있습니다.");
                window.location.href = "login.html";
            }
        });
    }

    if (startBtn) {
        startBtn.addEventListener("click", async () => {
            const isLoggedIn = getCookie('loggedIn') === 'true';

            if (!isLoggedIn) {
                alert("로그인이 필요한 서비스입니다.");
                window.location.href = "login.html";
                return;
            }

            try {
                const res = await fetch("/session");
                const data = await res.json();

                if (data.loggedIn) {
                    window.location.href = "../gamePage/game.html";
                } else {
                    alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                    setLoginCookie('', -1);
                    window.location.href = "login.html";
                }
            } catch (error) {
                console.error("세션 확인 오류:", error);
                alert("서버 통신 오류로 게임을 시작할 수 없습니다.");
            }
        });
    }

    if (loginBtn) {
        const isLoggedIn = getCookie('loggedIn') === 'true';

        if (isLoggedIn) {
            loginBtn.textContent = "로그아웃";
            loginBtn.onclick = logout_click;
        } else {
            loginBtn.textContent = "로그인";
            loginBtn.onclick = () => window.location.href = "login.html";
        }
        loginBtn.style.visibility = "visible";
    }

    // 기존의 fetchAndDisplayRanks 호출이 있었으나,
    // 아래의 랭킹 페이지 전용 코드 블록으로 인해 이 부분은 필요 없어 보입니다.
    // if (document.getElementById('rank_list_container')) {
    //     fetchAndDisplayRanks();
    // }
});


// ==========================================================
// 💡 회원가입 / 로그인 / 로그아웃 함수
// ==========================================================

async function signup_submit() {
    const id = document.getElementById("signup_id").value.trim();
    const pw = document.getElementById("signup_pw").value.trim();
    const pw2 = document.getElementById("signup_pw2").value.trim();

    if (id.length < 4 || id.length > 10) return alert("아이디는 4~10자 사이여야 합니다.");
    if (pw.length < 4 || pw.length > 10) return alert("비밀번호는 4~10자 사이여야 합니다.");
    if (pw !== pw2) return alert("비밀번호가 일치하지 않습니다.");

    const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw })
    });

    const data = await res.json();
    alert(data.message);
    if (data.success) window.location.href = "login.html";
}

async function login_submit() {
    const id = document.getElementById("login_id").value.trim();
    const pw = document.getElementById("login_pw").value.trim();

    if (id.length < 4 || id.length > 10) return alert("아이디는 4~10자 사이여야 합니다.");
    if (pw.length < 4 || pw.length > 10) return alert("비밀번호는 4~10자 사이여야 합니다.");

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw })
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
        setLoginCookie('true', 1);
        window.location.href = "main.html";
    }
}

async function logout_click() {
    const ok = confirm("로그아웃하시겠습니까?");
    if (!ok) return;

    const res = await fetch("/logout", { method: "POST" });
    const data = await res.json();

    setLoginCookie('', -1);

    alert(data.message);
    window.location.href = "main.html";
}

// ==============================
// ✅ 랭킹 페이지용 코드 (수정됨)
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
    const rankContainer = document.getElementById("rank_list_container");
    if (!rankContainer) return; // rank.html 아닐 때 실행 안 함

    // 현재 로그인된 사용자의 ID를 가져오는 방식이 서버 API 호출로 변경되었을 수 있으나,
    // 기존 코드에 맞춰 localStorage에서 가져오는 코드를 유지합니다.
    const currentUser = localStorage.getItem("username"); 

    try {
        const res = await fetch("http://localhost:3000/api/rank");
        const data = await res.json();

        rankContainer.innerHTML = ""; // 기존 '불러오는 중' 제거

        if (data.length === 0) {
            rankContainer.innerHTML = `<div class="rank-item">아직 기록이 없습니다.</div>`;
            return;
        }

        data.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "rank-item";
            
            // 💡 수정된 부분: formatTime 함수를 사용하고 밀리초를 초로 변환 (/ 1000)
            const formattedTime = formatTime(item.best_time / 1000); 
            
            div.innerHTML = `
                <div class="rank-num">${index + 1}</div>
                <div class="rank-profile">
                    <img src="profile.webp" alt="Profile" class="profile-icon">
                </div>
                <div class="rank-info">
                    <span class="rank-id">${item.user_id}</span>
                    <span class="rank-time">${formattedTime}</span>
                </div>
            `;
            rankContainer.appendChild(div);
        });

        // ✅ 내 랭킹 고정 표시
        const myRank = data.findIndex(item => item.user_id === currentUser);
        const myRankItem = document.getElementById("my_rank_item");
        
        if (myRankItem) {
            if (myRank !== -1) {
                const me = data[myRank];
                const formattedMyTime = formatTime(me.best_time / 1000); // 💡 수정된 부분
                
                myRankItem.querySelector(".rank-num").textContent = myRank + 1;
                myRankItem.querySelector(".rank-id").textContent = me.user_id;
                myRankItem.querySelector(".rank-time").textContent = formattedMyTime;
            } else {
                myRankItem.querySelector(".rank-id").textContent = currentUser || "Guest";
                myRankItem.querySelector(".rank-time").textContent = "기록 없음";
            }
        }

    } catch (err) {
        console.error("❌ 랭킹 불러오기 오류:", err);
        rankContainer.innerHTML = `<div class="rank-item">랭킹 데이터를 불러올 수 없습니다.</div>`;
    }
});