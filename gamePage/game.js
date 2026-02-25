const dialogueBox = document.getElementById("dialogue_box");
const nameBox = document.getElementById("character_name");
const dialogueText = document.getElementById("dialogue_text");
const characterImg = document.getElementById("character_img");
const quizArea = document.getElementById("quiz_area");
const optionsContainer = document.getElementById("options_container");
const answerInput = document.getElementById("answer_input");
const submitButton = document.getElementById("submit_answer");
const feedbackMessage = document.getElementById("feedback_message");
const gameContainer = document.getElementById("game_container");
const quizText = document.getElementById("quiz_text");
const waypointSection = document.getElementById("waypoint_section");
const wayGif = document.getElementById("way_gif");
const arriveButton = document.getElementById("arrive_button");

// 🚩 [추가] 방향키 버튼 요소
const controls = document.getElementById("controls");
const upBtn = document.getElementById("up_btn");
const downBtn = document.getElementById("down_btn");
const leftBtn = document.getElementById("left_btn");
const rightBtn = document.getElementById("right_btn");
// const centerBtn = document.getElementById("center_btn"); // 정지 버튼 (미관용, 기능X)
const gameCanvas = document.getElementById("game_canvas");
const ctx = gameCanvas ? gameCanvas.getContext("2d") : null;

let currentStep = 0;
let isTyping = false;
let currentText = "";
let typingInterval = null;
let isFeedbackMode = false;
let isMovingMode = false; // 미니게임 중 상태

// 플레이타임 변수
let startTime = 0;
let endTime = 0;

// 🚩 [수정] 미니게임 캐릭터 상태 변수: 크기를 40으로 조정
let player = { x: 0, y: 0, size: 40, speed: 10 }; 
let targetArea = { x: 0, y: 0, size: 40 }; // 도착 지점 (충돌 영역)
let currentMapImage = null; // 현재 지도 이미지
let playerImage = new Image(); // 움직이는 캐릭터 이미지 로드용

// 마지막 인덱스
const FINAL_QUIZ_START_STEP = 55;

// 🚩 [수정] 목표 위치 좌표 수정
const WAYPOINTS = {
    "way1": { map: "schoolmap.png", start_x: 450, start_y: 350, end_x: 650, end_y: 500, name: "봉아관" },
    "way2": { map: "schoolmap.png", start_x: 650, start_y: 500, end_x: 250, end_y: 150, name: "20주년기념관" },
    "way3": { map: "schoolmap.png", start_x: 250, start_y: 150, end_x: 220, end_y: 520, name: "스포토피아" },
    "way4": { map: "schoolmap.png", start_x: 220, start_y: 520, end_x: 650, end_y: 610, name: "기념교회" },
    "way5": { map: "schoolmap.png", start_x: 650, start_y: 620, end_x: 450, end_y: 350, name: "본관" }
};


const storyData = [
    // 장면 1: 게임 시작 및 오프닝
    { type: "change_bg", background: "image/background1.jpg" },
    { type: "change_char", character: "kiwu1.png" },
    { type: "dialogue", name: "키우", text: "안녕, 나는 이 학교의 마스코트 키우야." },
    { type: "dialogue", name: "키우", text: "마침 잘 왔어! 혹시 나 좀 도와줄 수 있어?" },
    { type: "dialogue", name: "키우", text: "이 학교 곳곳에 별의 조각이 흩어져 버렸어. 조각들을 다 모아서 별을 완성해야 하는데, 나 혼자서는 도저히 못 하겠어." },
    { type: "dialogue", name: "키우", text: "혹시 내가 조각들을 찾는 걸 좀 도와줄 수 있을까?" },

    // 선택지 타입
    {
        type: "selection",
        question: "키우를 도와줄까요?",
        options: [
            { text: "도와줄게.", nextStep: 7 },
        ]
    },

    { type: "dialogue", name: "키우", text: "고마워! 자, 그럼 바로 시작하자. 우리 학교 시설을 구석구석 돌아다니면서 퀴즈를 풀면 조각을 찾을 수 있을 거야." },
    { type: "dialogue", name: "키우", text: "첫 번째 목적지는 우리 학교에서 생활에 필요한 모든 걸 해결할 수 있는 봉아관이야. 봉아관으로 가보자!" },
    { type: "waypoint", gif: "way1.gif", message: "방향키로 지도 위를 이동해서 봉아관까지 도착해야 해!" },

    // 장소 1: 봉아관 (배경2)
    { type: "change_bg", background: "image/background2.jpg" },
    { type: "dialogue", name: "키우", text: "여기가 바로 봉아관이야. 학생들이 가장 자주 들르는 곳이라고 보면 돼. 말 그대로 '종합 생활 지원 센터' 같은 역할을 하거든." },
    { type: "dialogue", name: "키우", text: "지하 1층에는 서점이 있어서 전공책이나 문구류를 살 수 있어." },
    { type: "dialogue", name: "키우", text: "옆에 학생식당에서는 11:30부터 14:00까지 점심을 먹을 수 있어. 혹시 간단한 간식이나 생필품이 필요하면 편의점도 있으니 걱정 마." },
    { type: "dialogue", name: "키우", text: "1층에는 응급 상황을 대비한 건강증진실이 있어. 여기는 응급약이랑 침상도 있고, 인바디 측정도 할 수 있대. 정말 세심하게 학생들을 챙겨주지?" },
    { type: "dialogue", name: "키우", text: "이제 첫 번째 퀴즈를 풀어보자." },
    {
        type: "quiz_multiple",
        quiz: "학생식당의 점심 운영 시간은 몇 시부터 몇 시까지일까?",
        options: ["11:00~13:30", "11:30~14:00", "11:30~13:00", "12:00~14:30"],
        answer: "11:30~14:00",
        correct_dialogue: "정답이야!",
        incorrect_dialogue: "정답이 아냐!"
    },
    { type: "dialogue", name: "키우", text: "와, 봉아관에서 첫 번째 별의 조각을 찾았어! 고마워!" },
    { type: "dialogue", name: "키우", text: "다음은 공부하다 지쳤을 때 꼭 가봐야 할 20주년기념관으로 가자." },
    { type: "waypoint", gif: "way2.gif", message: "방향키로 지도 위를 이동해서 20주년기념관까지 도착해야 해!" },

    // 장소 2: 20주년기념관 (배경3)
    { type: "change_bg", background: "image/background3.jpg" },
    { type: "dialogue", name: "키우", text: "여기는 20주년기념관으로, '힐링공간'이 컨셉이야." },
    { type: "dialogue", name: "키우", text: "1층에 카페 '라 에스뜨레아'가 있어서 각종 음료와 음식을 사 먹을 수 있어. 2층에는 자료열람실, 멀티미디어자료실, 3층에는 전공열람실이 있어." },
    { type: "dialogue", name: "키우", text: "4층은 일반열람실 옆에 온실정원과 그네정원 같은 쉼터가 있고, 시나 꽃 관련 자료가 가득한 독특한 휴식 공간인 아크룸도 있대. 공부하다 힘들면 가보는 걸 추천해!" },
    { type: "dialogue", name: "키우", text: "이제 두 번째 퀴즈를 풀어보자." },
    {
        type: "quiz_short",
        quiz: "1층에 있는 카페 이름이 뭐지? (띄어쓰기O)",
        answer: "라 에스뜨레아",
        correct_dialogue: "정답이야!",
        incorrect_dialogue: "정답이 아냐!"
    },
    { type: "dialogue", name: "키우", text: "야호! 두 번째 별의 조각 획득!" },
    { type: "dialogue", name: "키우", text: "좋아, 이제 에너지를 충전할 스포토피아로 가보자!" },
    { type: "waypoint", gif: "way3.gif", message: "방향키로 지도 위를 이동해서 스포토피아까지 도착해야 해!" },

    // 장소 3: 스포토피아 (배경4)
    { type: "change_bg", background: "image/background4.jpg" },
    { type: "dialogue", name: "키우", text: "여기는 스포토피아야. 이름부터 건강해지는 느낌이지? 바로 '헬스케어공간'이야." },
    { type: "dialogue", name: "키우", text: "지하 1층에는 재밌게 놀 수 있는 볼링장이랑 골프장이 있어." },
    { type: "dialogue", name: "키우", text: "그리고 지하 2층에는 본격적인 운동 시설이 다 모여 있어. 수영장, 헬스장, 에어로빅실까지!" },
    { type: "dialogue", name: "키우", text: "공부도 중요하지만, 여기서 건강도 챙기자." },
    { type: "dialogue", name: "키우", text: "이제 세 번째 퀴즈를 풀어보자." },
    {
        type: "quiz_multiple",
        quiz: "다음 중 스포토피아 지하 2층에 없는 시설은 뭘까?",
        options: ["수영장", "헬스장", "에어로빅실", "볼링장"],
        answer: "볼링장",
        correct_dialogue: "정답이야!",
        incorrect_dialogue: "정답이 아냐!"
    },
    { type: "dialogue", name: "키우", text: "볼링장은 지하 1층에 있지. 정답이야! 세 번째 별의 조각 획득!" },
    { type: "dialogue", name: "키우", text: "와, 정말 최고야! 이제 세 번째 조각! 다음은 기념교회로 가보자." },
    { type: "waypoint", gif: "way4.gif", message: "방향키로 지도 위를 이동해서 기념교회까지 도착해야 해!" },

    // 장소 4: 기념교회 (배경5)
    { type: "change_bg", background: "image/background5.jpg" },
    { type: "dialogue", name: "키우", text: "다음은 기념교회야. 여기서 다함께 예배를 드리지." },
    { type: "dialogue", name: "키우", text: "우리 학교는 개신교 미션스쿨로, 예배가 필수 교양이야. 시험도 볼 필요 없이 출석만 하면 돼!" },
    { type: "dialogue", name: "키우", text: "종교를 강요하지는 않지만 이수하지 않으면 졸업할 수 없으니 반드시 기억해둬." },
    { type: "dialogue", name: "키우", text: "이제 네 번째 퀴즈를 풀어보자." },
    {
        type: "quiz_short",
        quiz: "경인여자대학교의 종교는?",
        answer: "개신교",
        correct_dialogue: "정답이야!",
        incorrect_dialogue: "정답이 아냐!"
    },
    { type: "dialogue", name: "키우", text: "벌써 네 번째 조각이네? 이제 하나만 남았어." },
    { type: "dialogue", name: "키우", text: "이제 마지막 조각이 있는 본관으로 돌아가자!" },

    // 이동 5: 본관
    { type: "waypoint", gif: "way5.gif", message: "방향키로 지도 위를 이동해서 본관까지 도착해야 해!" },

    // 최종 장소: 본관 (배경6, 엔딩)
    { type: "change_bg", background: "image/background1.jpg" },
    { type: "dialogue", name: "키우", text: "드디어 마지막인 본관으로 돌아왔어! 이 건물이 바로 우리 학교의 가장 중요한 곳이야." },
    { type: "dialogue", name: "키우", text: "다양한 과에서 이용하는 강의실 및 실습실이 존재하지." },
    { type: "dialogue", name: "키우", text: "그리고 본관도 3층, 4층, 5층에 학생들이 쓸 수 있는 '웰빙공간'인 인터넷 카페를 갖추고 있어. 이곳 외에도 미래관 2층, 기념관 5층에도 있지." },
    { type: "dialogue", name: "키우", text: "이제 다섯 번째 퀴즈를 풀어보자." },
    {
        type: "quiz_multiple",
        quiz: "본관에 인터넷 카페가 설치된 층이 아닌 곳은?",
        options: ["2층", "3층", "4층", "5층"],
        answer: "2층",
        correct_dialogue: "정답이야!",
        incorrect_dialogue: "정답이 아냐!"
    },
    { type: "dialogue", name: "키우", text: "마지막 다섯 번째 조각까지 찾았어! 고마워!" },

    { type: "change_bg", background: "image/star_fragment.png" },
    { type: "dialogue", name: "키우", text: "드디어 조각들이 모여 별이 완성되었네. 사실 별의 조각은 바로 내 꿈의 파편이었어." },
    { type: "dialogue", name: "키우", text: "네가 도와준 덕분에 내 잃어버린 꿈을 다시 완성할 수 있게 된 거야. 정말 고마워!" },
    { type: "dialogue", name: "키우", text: "내가 꿈을 다시 찾은 것처럼, 너도 이 멋진 학교에서 너만의 반짝이는 꿈을 꼭 찾고 이룰 수 있기를 바라." },
    { type: "dialogue", name: "키우", text: "다시 한번 고마워. 네 학교 생활을 응원할게!" }
];

// 텍스트를 한 글자씩 출력하는 효과
function typeWriter(text) {
    if (typingInterval) clearInterval(typingInterval);
    isTyping = true;
    currentText = text;
    dialogueText.textContent = "";
    dialogueText.style.color = "#fff";
    let i = 0;

    typingInterval = setInterval(() => {
        if (i < currentText.length) {
            dialogueText.textContent += currentText.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            isTyping = false;
        }
    }, 50);
}


// 다음 스토리 단계로 진행
function nextStep() {
    if (isFeedbackMode || isMovingMode) return; // 이동/피드백 중에는 클릭 무시

    // 게임 완료 시점: 시간 측정 종료 및 DB에 시간 전송
    if (currentStep >= storyData.length) {
        stopGameTimerAndSendRecord();
        alert("게임을 완료했습니다! 시작 화면으로 돌아갑니다.");
        window.location.href = "/main.html";
        return;
    }

    // 게임 시작 시 타이머 시작
    if (currentStep === 0 && startTime === 0) {
        startGameTimer();
    }

    // UI 초기화
    quizArea.classList.add("hidden");
    waypointSection.classList.add("hidden");
    controls.classList.add("hidden"); // 🚩 [추가] 버튼 숨기기
    optionsContainer.innerHTML = "";
    answerInput.classList.add("hidden");
    submitButton.classList.add("hidden");
    feedbackMessage.classList.add("hidden");
    dialogueBox.classList.remove("hidden");
    characterImg.classList.remove("hidden");
    dialogueText.style.color = "#fff";

    const step = storyData[currentStep];

    if (step.type === "dialogue") {
        nameBox.textContent = step.name;
        typeWriter(step.text);
        currentStep++;
    } else if (step.type === "change_bg") {
        gameContainer.style.backgroundImage = `url("${step.background}")`;
        if (step.delay) {
            characterImg.classList.add("hidden");
            dialogueBox.classList.add("hidden");
            setTimeout(() => {
                currentStep++;
                nextStep();
            }, step.delay);
        } else {
            currentStep++;
            nextStep();
        }
    } else if (step.type === "change_char") {
        characterImg.src = `image/${step.character}`;
        currentStep++;
        nextStep();
    } else if (step.type === "selection") {
        handleSelection(step);
    } else if (step.type.startsWith("quiz")) {
        handleQuiz(step);
    } else if (step.type === "waypoint") {
        handleWaypoint(step);
    }
}


// 선택지 유형 처리
function handleSelection(step) {
    characterImg.classList.add("hidden");
    quizArea.classList.remove("hidden");
    optionsContainer.innerHTML = "";
    quizText.textContent = step.question;
    optionsContainer.classList.remove("hidden");

    answerInput.classList.add("hidden");
    submitButton.classList.add("hidden");

    step.options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option.text;

        button.onclick = () => {
            currentStep = option.nextStep;
            nextStep();
        };
        optionsContainer.appendChild(button);
    });
}


// 이동 단계 처리 (미니게임 시작)
function handleWaypoint(step) {
    if (!ctx) {
        alert("오류: 캔버스 환경이 설정되지 않았습니다. 개발자 모드(F9)로 건너킵니다.");
        isMovingMode = false;
        currentStep++;
        nextStep();
        return;
    }
    
    isMovingMode = true;

    // 1. 대화창에 이동 메시지 표시
    nameBox.textContent = "키우";
    typeWriter(step.message);

    // 2. 캐릭터 이미지 숨기기 및 이동 섹션/캔버스 표시
    characterImg.classList.add("hidden");
    waypointSection.classList.remove("hidden");
    
    // GIF 숨기고 캔버스 표시
    wayGif.classList.add("hidden");
    gameCanvas.classList.remove("hidden");
    controls.classList.remove("hidden"); // 🚩 [추가] 버튼 표시
    
    // 도착 확인 버튼은 미니게임에서는 필요 없으므로 숨김
    arriveButton.classList.add("hidden");

    // 3. 미니게임 시작
    startGameMini(step.gif.replace(".gif", ""));
}

/** 🚩 [추가] 캐릭터 이동 함수 */
function movePlayer(direction) {
    if (!isMovingMode) return;

    if (direction === "ArrowUp") { player.y -= player.speed; }
    else if (direction === "ArrowDown") { player.y += player.speed; }
    else if (direction === "ArrowLeft") { player.x -= player.speed; }
    else if (direction === "ArrowRight") { player.x += player.speed; }
    
    // 캔버스 경계 처리
    player.x = Math.max(0, Math.min(gameCanvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(gameCanvas.height - player.size, player.y));
    
    // 충돌 확인
    if (checkCollision()) {
        endGameMini();
    }
}


/** 미니게임 시작 로직 */
function startGameMini(waypointKey) {
    const data = WAYPOINTS[waypointKey];
    // 🚩 [수정] 캔버스 높이를 지도 이미지 비율에 맞게 780으로 설정
    gameCanvas.width = 800; 
    gameCanvas.height = 780;
    
    // 1. 캐릭터 초기 위치 설정
    player.x = data.start_x;
    player.y = data.start_y;
    
    // 2. 도착 목표 위치 설정
    targetArea.x = data.end_x;
    targetArea.y = data.end_y;
    
    // 3. 지도 이미지 로드
    currentMapImage = new Image();
    currentMapImage.onload = () => {
        // 이미지 로드 후 게임 루프 시작
        requestAnimationFrame(gameLoop); 
    };
    currentMapImage.src = `image/${data.map}`;

    // 🚩 [추가] 움직이는 캐릭터 이미지 로드
    playerImage.onload = () => {
        // 로드 완료
    };
    playerImage.src = `image/kiwu1.png`;
    
    // 4. 키보드 이벤트 리스너 추가 (이동 처리는 아래 통합된 keydown에서 담당)
    // 🚩 [삭제] window.addEventListener("keydown", handleKeyDown);

    // 🚩 [추가] 버튼 클릭 이벤트 리스너
    upBtn.ontouchstart = upBtn.onclick = (e) => { e.preventDefault(); movePlayer("ArrowUp"); };
    downBtn.ontouchstart = downBtn.onclick = (e) => { e.preventDefault(); movePlayer("ArrowDown"); };
    leftBtn.ontouchstart = leftBtn.onclick = (e) => { e.preventDefault(); movePlayer("ArrowLeft"); };
    rightBtn.ontouchstart = rightBtn.onclick = (e) => { e.preventDefault(); movePlayer("ArrowRight"); };
}

/** 🚩 [삭제] handleKeyDown 함수는 아래 통합된 keydown 리스너로 대체됩니다. */
// function handleKeyDown(e) { ... }

/** 충돌 확인 (도착 여부) */
function checkCollision() {
    // AABB 충돌 검사 (간단한 사각형 충돌)
    return player.x < targetArea.x + targetArea.size &&
           player.x + player.size > targetArea.x &&
           player.y < targetArea.y + targetArea.size &&
           player.y + player.size > targetArea.y;
}

/** 게임 루프 (그리기) */
function gameLoop() {
    if (!isMovingMode) return;
    
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // 1. 배경 (지도) 그리기
    if (currentMapImage) {
        ctx.drawImage(currentMapImage, 0, 0, gameCanvas.width, gameCanvas.height);
    }
    
    // 2. 도착 지점 (빨간색 사각형) 그리기
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; 
    ctx.fillRect(targetArea.x, targetArea.y, targetArea.size, targetArea.size);
    
    // 3. 🚩 [수정] 캐릭터 그리기 (kiwu1.png)
    if (playerImage.complete) {
        ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);
    } else {
        // 이미지가 로드되지 않았다면 파란색 원으로 대체 (fallback)
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(player.x + player.size / 2, player.y + player.size / 2, player.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    requestAnimationFrame(gameLoop);
}


/** 미니게임 종료 (도착 성공) */
function endGameMini() {
    // 🚩 [삭제] window.removeEventListener("keydown", handleKeyDown); // 키보드 이벤트 제거 (통합 리스너 사용)
    isMovingMode = false;
    
    // UI 정리: 캔버스/버튼 숨기고 GIF/버튼은 다음 단계를 위해 복구
    gameCanvas.classList.add("hidden");
    controls.classList.add("hidden"); // 🚩 [추가] 버튼 숨기기
    waypointSection.classList.add("hidden");
    wayGif.classList.remove("hidden");
    arriveButton.classList.remove("hidden");
    
    alert("✅ 도착! 목표 지점에 성공적으로 도착했습니다!");

    currentStep++; // 다음 스토리로 이동
    nextStep();
}

// 퀴즈 유형 (객관식/단답형)을 처리
function handleQuiz(step) {
    characterImg.classList.add("hidden");
    quizArea.classList.remove("hidden");
    optionsContainer.innerHTML = "";

    quizText.textContent = step.quiz;
    optionsContainer.classList.remove("hidden");

    answerInput.value = "";

    if (step.type === "quiz_multiple") {
        answerInput.classList.add("hidden");
        submitButton.classList.add("hidden");
        step.options.forEach(option => {
            const button = document.createElement("button");
            button.textContent = option;
            button.onclick = () => checkMultipleChoice(option, step);
            optionsContainer.appendChild(button);
        });
    } else if (step.type === "quiz_short") {
        optionsContainer.classList.add("hidden");
        answerInput.classList.remove("hidden");
        submitButton.classList.remove("hidden");

        submitButton.onclick = () => checkShortAnswer(answerInput.value, step);
    }
}


// 객관식 정답 확인
function checkMultipleChoice(selectedAnswer, step) {
    if (selectedAnswer === step.answer) {
        displayFeedback(step.correct_dialogue, true);
    } else {
        displayFeedback(step.incorrect_dialogue, false);
    }
}

// 단답형 정답 확인
function checkShortAnswer(input, step) {
    const normalizedInput = input.trim().toUpperCase();
    const normalizedAnswer = step.answer.trim().toUpperCase();

    if (normalizedInput === normalizedAnswer) {
        displayFeedback(step.correct_dialogue, true);
    } else {
        displayFeedback(step.incorrect_dialogue, false);
    }
}


// 정답/오답 피드백 표시 및 다음 스텝 준비
function displayFeedback(message, isCorrect) {
    isFeedbackMode = true;
    quizArea.classList.add("hidden");

    nameBox.textContent = "키우";
    typeWriter(message);

    if (isCorrect) {
        // 정답 시 kiwu1.png
        characterImg.src = `image/kiwu1.png`;
        currentStep++;
    } else {
        // 오답 시 kiwu2.png
        characterImg.src = `image/kiwu2.png`;
    }

    const nextClickHandler = () => {
        dialogueBox.removeEventListener("click", nextClickHandler);
        isFeedbackMode = false;

        if (isCorrect) {
            nextStep();
        } else {
            // 오답: 재시도를 위해 퀴즈 이전 상태로 복귀 및 기본 표정 설정
            characterImg.src = `image/kiwu1.png`;
            dialogueText.textContent = "";
            nameBox.textContent = "키우";
            typeWriter("다시 한번 퀴즈를 풀어보자.");

            // 다음 클릭 시 퀴즈 창이 다시 뜨도록 설정
            dialogueBox.addEventListener("click", () => {
                // currentStep은 유지되어 해당 퀴즈가 다시 뜸
                handleQuiz(storyData[currentStep]);
            }, { once: true });
        }
    };

    const interval = setInterval(() => {
        if (!isTyping) {
            clearInterval(interval);
            dialogueBox.addEventListener("click", nextClickHandler, { once: true });
        }
    }, 50);
}


// 타이머 및 기록 전송 함수

/** 게임 타이머 시작 */
function startGameTimer() {
    startTime = Date.now();
    console.log("게임 타이머 시작:", startTime);
}

/** 게임 타이머를 멈추고 기록을 서버에 전송 */
function stopGameTimerAndSendRecord() {
    endTime = Date.now();
    const duration = endTime - startTime;
    const durationInSeconds = Math.floor(duration / 1000);

    console.log("총 플레이 시간 (초):", durationInSeconds);
    sendPlayTimeToServer(durationInSeconds);
}

/** Fetch API로 서버에 플레이 시간 전송 */
function sendPlayTimeToServer(timeInSeconds) {
    fetch("/api/update-record", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            playTime: timeInSeconds
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("기록 저장 성공:", data.message);
        } else {
            console.error("기록 저장 실패:", data.message);
        }
    })
    .catch(error => console.error("기록 전송 중 오류 발생:", error));
}


// 이벤트 리스너 설정 및 단축키 기능
document.addEventListener("DOMContentLoaded", nextStep);

// 🚩 [수정] 대화창 클릭 리스너 (클릭 시에도 Enter와 동일하게 타이핑 효과 적용)
dialogueBox.addEventListener("click", () => {
    // 피드백/이동 모드 중에는 클릭 무시
    if (isFeedbackMode || isMovingMode) return; 

    if (quizArea.classList.contains("hidden") && waypointSection.classList.contains("hidden")) {
        if (isTyping) {
            // 1. 타이핑 중이면 즉시 완료
            if (typingInterval) clearInterval(typingInterval);
            dialogueText.textContent = currentText;
            isTyping = false;
        } else {
            // 2. 타이핑이 완료되었으면 다음 단계로 진행 (nextStep 호출)
            nextStep();
        }
    }
});

// 🚩 [통합] 모든 키보드 이벤트 (대화 진행, 이동, 단축키)를 하나의 리스너로 처리
document.addEventListener("keydown", (e) => {
    const key = e.key;
    const isControlKey = e.ctrlKey || e.metaKey; // Ctrl 또는 Cmd 키

    // 0. 퀴즈 입력 중 Enter키는 퀴즈 제출을 위해 막지 않음
    if (answerInput.classList.contains('hidden') === false && key === 'Enter') {
        return;
    }
    
    // 1. 미니게임 이동 (방향키)
    if (isMovingMode && key.startsWith("Arrow")) {
        e.preventDefault(); // 화면 스크롤 방지
        movePlayer(key);
        return;
    }

    // 2. 단축키 처리 (F9, M, E)
    if (isControlKey || key.toUpperCase() === 'F9' || key.toUpperCase() === 'M' || key.toUpperCase() === 'E') {
        
        // F9: 개발자용 - Waypoint 강제 통과 (이동 모드일 때만 작동)
        if (key === "F9" && isMovingMode) {
            e.preventDefault();
            console.log("🛠️ 개발자 단축키(F9)로 Waypoint 강제 통과");
            if (storyData[currentStep] && storyData[currentStep].type === "waypoint") {
                 endGameMini(); // 미니게임 종료 로직 호출 (nextStep 포함)
            }
            return;
        } 
        
        // Ctrl/Cmd + E: 엔딩 직행
        else if (isControlKey && key.toUpperCase() === "E") {
            e.preventDefault();
            if (confirm("엔딩으로 바로 이동하시겠습니까?")) {
                if (typingInterval) clearInterval(typingInterval);
                isTyping = false;
                isFeedbackMode = false;
                isMovingMode = false;
                waypointSection.classList.add("hidden");
                gameCanvas.classList.add("hidden");

                startGameTimer();
                currentStep = FINAL_QUIZ_START_STEP; // 최종 퀴즈 시작 단계로 이동
                nextStep();
            }
            return;
        } 
        
        // Ctrl/Cmd + M: 다음 Waypoint 단계로 이동
        else if (isControlKey && key.toUpperCase() === "M") {
            e.preventDefault();
            
            if (isMovingMode || isFeedbackMode) {
                alert("현재 미니게임 중이거나 피드백 처리 중입니다.");
                return;
            }
            
            let nextWaypointStep = -1;
            // 현재 스텝 다음부터 찾기 시작
            for (let i = currentStep; i < storyData.length; i++) {
                if (storyData[i].type === "waypoint") {
                    nextWaypointStep = i;
                    break;
                }
            }

            if (nextWaypointStep !== -1) {
                if (confirm(`다음 Waypoint(${storyData[nextWaypointStep].gif.replace(".gif", "")}) 단계로 이동하시겠습니까?`)) {
                    if (typingInterval) clearInterval(typingInterval);
                    isTyping = false;
                    
                    currentStep = nextWaypointStep;
                    nextStep();
                }
            } else {
                alert("더 이상 이동할 Waypoint 단계가 없습니다. (엔딩으로 이동: Ctrl+E)");
            }
            return;
        }
    }
    
    // 3. 대화 진행 (Enter 키)
    if (key === 'Enter' && !isMovingMode && !isFeedbackMode) {
        if (isTyping) {
            // 타이핑 중이면 즉시 완료
            if (typingInterval) clearInterval(typingInterval);
            dialogueText.textContent = currentText;
            isTyping = false;
        } else {
            // 타이핑이 완료되었으면 다음 단계로
            nextStep();
        }
        return;
    }
});