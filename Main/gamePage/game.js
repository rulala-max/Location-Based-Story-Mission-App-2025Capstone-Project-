// game.js 파일 (경로 수정 및 플레이타임 측정/전송 로직 포함)

// ----------------------------------------------------
// 1. DOM 요소 및 변수 설정
// ----------------------------------------------------
const dialogueBox = document.getElementById('dialogue_box');
const nameBox = document.getElementById('character_name');
const dialogueText = document.getElementById('dialogue_text');
const characterImg = document.getElementById('character_img');
const quizArea = document.getElementById('quiz_area');
const optionsContainer = document.getElementById('options_container');
const answerInput = document.getElementById('answer_input');
const submitButton = document.getElementById('submit_answer');
const feedbackMessage = document.getElementById('feedback_message'); 
const gameContainer = document.getElementById('game_container');
const quizText = document.getElementById('quiz_text');

let currentStep = 0; 
let isTyping = false; 
let currentText = ''; 
let typingInterval = null; 
let isFeedbackMode = false; 

// 💡 플레이타임 측정 변수
let startTime = 0; 
let endTime = 0; 

// 💡 마지막 퀴즈가 시작되는 인덱스 (본관 진입 대사 직후)
const FINAL_QUIZ_START_STEP = 48; 

// ----------------------------------------------------
// 2. 스토리 데이터 정의
// ----------------------------------------------------
const storyData = [
    // ----------------------------------------------------
    // 장면 1: 게임 시작 및 오프닝 (배경1, kiwu1)
    // ----------------------------------------------------
    { type: 'change_bg', background: 'image/background1.jpg' }, 
    { type: 'change_char', character: 'kiwu1.png' }, 
    { type: 'dialogue', name: '키우', text: '안녕, 나는 이 학교의 마스코트 키우야.' },
    { type: 'dialogue', name: '키우', text: '마침 잘 왔어! 혹시 나 좀 도와줄 수 있어?' },
    { type: 'dialogue', name: '키우', text: '이 학교 곳곳에 별의 조각이 흩어져 버렸어. 조각들을 다 모아서 별을 완성해야 하는데, 나 혼자서는 도저히 못 하겠어.' },
    { type: 'dialogue', name: '키우', text: '혹시 내가 조각들을 찾는 걸 좀 도와줄 수 있을까?' },
    
    // 선택지 타입
    {
        type: 'selection', 
        question: '키우를 도와줄까요?',
        options: [
            { text: '도와줄게.', nextStep: 7 }, 
        ]
    },
    
    // 인덱스 7: 선택지 '그래'를 클릭하면 이 대사부터 진행
    { type: 'dialogue', name: '키우', text: '고마워! 자, 그럼 바로 시작하자. 우리 학교 시설을 구석구석 돌아다니면서 퀴즈를 풀면 조각을 찾을 수 있을 거야.' },
    { type: 'dialogue', name: '키우', text: '첫 번째 목적지는 우리 학교에서 생활에 필요한 모든 걸 해결할 수 있는 봉아관이야. 봉아관으로 가보자!' },

    // ----------------------------------------------------
    // 장소 1: 봉아관 (배경2)
    // ----------------------------------------------------
    { type: 'change_bg', background: 'image/background2.jpg' }, 
    { type: 'dialogue', name: '키우', text: '여기가 바로 봉아관이야. 학생들이 가장 자주 들르는 곳이라고 보면 돼. 말 그대로 \'종합 생활 지원 센터\' 같은 역할을 하거든.' },
    { type: 'dialogue', name: '키우', text: '지하 1층에는 서점이 있어서 전공책이나 문구류를 살 수 있어.' },
    { type: 'dialogue', name: '키우', text: '옆에 학생식당에서는 11:30부터 14:00까지 점심을 먹을 수 있어. 혹시 간단한 간식이나 생필품이 필요하면 편의점도 있으니 걱정 마.' },
    { type: 'dialogue', name: '키우', text: '1층에는 응급 상황을 대비한 건강증진실이 있어. 여기는 응급약이랑 침상도 있고, 인바디 측정도 할 수 있대. 정말 세심하게 학생들을 챙겨주지?' },
    { type: 'dialogue', name: '키우', text: '이제 첫 번째 퀴즈를 풀어보자.' },
    {
        type: 'quiz_multiple', 
        quiz: '학생식당의 점심 운영 시간은 몇 시부터 몇 시까지일까?',
        options: ['11:00~13:30', '11:30~14:00', '11:30~13:00', '12:00~14:30'],
        answer: '11:30~14:00',
        correct_dialogue: '정답이야!',
        incorrect_dialogue: '정답이 아냐!'
    },
    { type: 'dialogue', name: '키우', text: '와, 봉아관에서 첫 번째 별의 조각을 찾았어! 고마워!' },
    { type: 'dialogue', name: '키우', text: '다음은 공부하다 지쳤을 때 꼭 가봐야 할 20주년기념관으로 가자.' },

    // ----------------------------------------------------
    // 장소 2: 20주년기념관 (배경3)
    // ----------------------------------------------------
    { type: 'change_bg', background: 'image/background3.jpg' }, 
    { type: 'dialogue', name: '키우', text: '여기는 20주년기념관으로, \'힐링공간\'이 컨셉이야.' },
    { type: 'dialogue', name: '키우', text: '1층에 카페 \'라 에스뜨레아\'가 있어서 각종 음료와 음식을 사 먹을 수 있어. 2층에는 자료열람실, 멀티미디어자료실, 3층에는 전공열람실이 있어.' },
    { type: 'dialogue', name: '키우', text: '4층은 일반열람실 옆에 온실정원과 그네정원 같은 쉼터가 있고, 시나 꽃 관련 자료가 가득한 독특한 휴식 공간인 아크룸도 있대. 공부하다 힘들면 가보는 걸 추천해!' },
    { type: 'dialogue', name: '키우', text: '이제 두 번째 퀴즈를 풀어보자.' },
    {
        type: 'quiz_short', 
        quiz: '1층에 있는 카페 이름이 뭐지? (띄어쓰기O)',
        answer: '라 에스뜨레아', 
        correct_dialogue: '정답이야!',
        incorrect_dialogue: '정답이 아냐!'
    },
    { type: 'dialogue', name: '키우', text: '야호! 두 번째 별의 조각 획득!' },
    { type: 'dialogue', name: '키우', text: '좋아, 이제 에너지를 충전할 스포토피아로 가보자!' },

    // ----------------------------------------------------
    // 장소 3: 스포토피아 (배경4)
    // ----------------------------------------------------
    { type: 'change_bg', background: 'image/background4.jpg' }, 
    { type: 'dialogue', name: '키우', text: '여기는 스포토피아야. 이름부터 건강해지는 느낌이지? 바로 \'헬스케어공간\'이야.' },
    { type: 'dialogue', name: '키우', text: '지하 1층에는 재밌게 놀 수 있는 볼링장이랑 골프장이 있어.' },
    { type: 'dialogue', name: '키우', text: '그리고 지하 2층에는 본격적인 운동 시설이 다 모여 있어. 수영장, 헬스장, 에어로빅실까지!' },
    { type: 'dialogue', name: '키우', text: '공부도 중요하지만, 여기서 건강도 챙기자.' },
    { type: 'dialogue', name: '키우', text: '이제 세 번째 퀴즈를 풀어보자.' },
    {
        type: 'quiz_multiple', 
        quiz: '다음 중 스포토피아 지하 2층에 없는 시설은 뭘까?',
        options: ['수영장', '헬스장', '에어로빅실', '볼링장'],
        answer: '볼링장',
        correct_dialogue: '정답이야!',
        incorrect_dialogue: '정답이 아냐!'
    },
    { type: 'dialogue', name: '키우', text: '볼링장은 지하 1층에 있지. 정답이야! 세 번째 별의 조각 획득!' },
    { type: 'dialogue', name: '키우', text: '와, 정말 최고야! 이제 세 번째 조각! 다음은 공부할 때 정말 유용한 미래관으로 가보자.' },

    // ----------------------------------------------------
    // 장소 4: 기념교회 (배경5)
    // ----------------------------------------------------
    { type: 'change_bg', background: 'image/background5.jpg' }, 
    { type: 'dialogue', name: '키우', text: '다음은 기념교회야. 여기서 다함께 예배를 드리지.' },
    { type: 'dialogue', name: '키우', text: '우리 학교는 개신교 미션스쿨로, 예배가 필수 교양이야. 시험도 볼 필요 없이 출석만 하면 돼!' },
    { type: 'dialogue', name: '키우', text: '종교를 강요하지는 않지만 이수하지 않으면 졸업할 수 없으니 반드시 기억해둬.' },
    { type: 'dialogue', name: '키우', text: '이제 네 번째 퀴즈를 풀어보자.' },
    {
        type: 'quiz_short', 
        quiz: '경인여자대학교의 종교는?',
        answer: '개신교',
        correct_dialogue: '정답이야!',
        incorrect_dialogue: '정답이 아냐!'
    },
    { type: 'dialogue', name: '키우', text: '벌써 네 번째 조각이네? 이제 하나만 남았어.' },
    { type: 'dialogue', name: '키우', text: '이제 마지막 조각이 있는 본관으로 돌아가자!' },

    // ----------------------------------------------------
    // 최종 장소: 본관 (배경6, 엔딩)
    // ----------------------------------------------------
    { type: 'change_bg', background: 'image/background1.jpg' }, 
    { type: 'dialogue', name: '키우', text: '드디어 마지막인 본관으로 돌아왔어! 이 건물이 바로 우리 학교의 가장 중요한 곳이야.' },
    { type: 'dialogue', name: '키우', text: '본관도 3층, 4층, 5층에 학생들이 쓸 수 있는 \'웰빙공간\'인 인터넷 카페를 갖추고 있어. 이곳 외에도 미래관 2층, 기념관 5층에도 있지.' },
    { type: 'dialogue', name: '키우', text: '이제 다섯 번째 퀴즈를 풀어보자.' },
    {
        type: 'quiz_multiple', 
        quiz: '본관에 인터넷 카페가 설치된 층이 아닌 곳은?',
        options: ['2층', '3층', '4층', '5층'],
        answer: '2층',
        correct_dialogue: '정답이야!',
        incorrect_dialogue: '정답이 아냐!'
    },
    { type: 'dialogue', name: '키우', text: '마지막 다섯 번째 조각까지 찾았어! 고마워!' },
    
    { type: 'change_bg', background: 'image/star_fragment.png' }, 
    { type: 'dialogue', name: '키우', text: '드디어 조각들이 모여 별이 완성되었네. 사실 별의 조각은 바로 내 꿈의 파편이었어.' },
    { type: 'dialogue', name: '키우', text: '네가 도와준 덕분에 내 잃어버린 꿈을 다시 완성할 수 있게 된 거야. 정말 고마워!' },
    { type: 'dialogue', name: '키우', text: '내가 꿈을 다시 찾은 것처럼, 너도 이 멋진 학교에서 너만의 반짝이는 꿈을 꼭 찾고 이룰 수 있기를 바라.' },
    { type: 'dialogue', name: '키우', text: '다시 한번 고마워. 네 학교 생활을 응원할게!' }
];


// ----------------------------------------------------
// 3. 핵심 로직 함수
// ----------------------------------------------------

/** 텍스트를 한 글자씩 출력하는 효과를 줍니다. */
function typeWriter(text) { 
    if (typingInterval) clearInterval(typingInterval);
    isTyping = true;
    currentText = text;
    dialogueText.textContent = ''; 
    dialogueText.style.color = '#fff'; 
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


/** 다음 스토리 단계로 진행합니다. */
function nextStep() {
    if (isFeedbackMode) return; 

    // 🚨 게임 완료 시점: 시간 측정 종료 및 DB에 시간 전송
    if (currentStep >= storyData.length) {
        stopGameTimerAndSendRecord(); // ⭐ 시간 측정 종료 및 전송
        
        alert('게임을 완료했습니다! 시작 화면으로 돌아갑니다.');
        // ⭐ 경로 최종 수정: 절대 경로로 /main.html을 요청하여 Cannot GET 오류 해결
        window.location.href = '/main.html';
        return;
    }

    // 💡 게임의 첫 단계일 때 타이머 시작
    if (currentStep === 0 && startTime === 0) {
        startGameTimer();
    }
    
    quizArea.classList.add('hidden');
    optionsContainer.innerHTML = ''; 
    answerInput.classList.add('hidden');
    submitButton.classList.add('hidden');
    feedbackMessage.classList.add('hidden');
    dialogueBox.classList.remove('hidden'); 
    characterImg.classList.remove('hidden'); 
    dialogueText.style.color = '#fff'; 

    const step = storyData[currentStep];

    if (step.type === 'dialogue') {
        nameBox.textContent = step.name;
        typeWriter(step.text);
        currentStep++;
    } else if (step.type === 'change_bg') {
        gameContainer.style.backgroundImage = `url('${step.background}')`;
        
        if (step.delay) {
            characterImg.classList.add('hidden'); 
            dialogueBox.classList.add('hidden');
            setTimeout(() => {
                currentStep++;
                nextStep();
            }, step.delay);
        } else {
            currentStep++;
            nextStep(); 
        }
    } else if (step.type === 'change_char') { 
        characterImg.src = `image/${step.character}`;
        currentStep++;
        nextStep(); 
    } else if (step.type === 'selection') { 
        handleSelection(step);
    } else if (step.type.startsWith('quiz')) {
        handleQuiz(step);
    }
}


/** 선택지(Selection) 유형을 처리합니다. */
function handleSelection(step) {
    characterImg.classList.add('hidden'); 
    quizArea.classList.remove('hidden'); 
    optionsContainer.innerHTML = ''; 
    quizText.textContent = step.question;
    optionsContainer.classList.remove('hidden'); 

    answerInput.classList.add('hidden');
    submitButton.classList.add('hidden');

    step.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        
        button.onclick = () => {
            currentStep = option.nextStep; 
            nextStep(); 
        };
        optionsContainer.appendChild(button);
    });
}


/** 퀴즈 유형 (객관식/단답형)을 처리합니다. */
function handleQuiz(step) {
    characterImg.classList.add('hidden'); 
    quizArea.classList.remove('hidden'); 
    optionsContainer.innerHTML = ''; 

    quizText.textContent = step.quiz;
    optionsContainer.classList.remove('hidden');
    
    answerInput.value = ''; // 단답형 퀴즈가 나올 때마다 입력 필드 값을 초기화

    if (step.type === 'quiz_multiple') {
        step.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => checkMultipleChoice(option, step);
            optionsContainer.appendChild(button);
        });
    } else if (step.type === 'quiz_short') {
        answerInput.classList.remove('hidden');
        submitButton.classList.remove('hidden');
        
        submitButton.onclick = () => checkShortAnswer(answerInput.value, step);
    }
}


/** 객관식 정답 확인 */
function checkMultipleChoice(selectedAnswer, step) {
    if (selectedAnswer === step.answer) {
        displayFeedback(step.correct_dialogue, true);
    } else {
        displayFeedback(step.incorrect_dialogue, false);
    }
}

/** 단답형 정답 확인 */
function checkShortAnswer(input, step) {
    const normalizedInput = input.trim().toUpperCase();
    const normalizedAnswer = step.answer.trim().toUpperCase();

    if (normalizedInput === normalizedAnswer) {
        displayFeedback(step.correct_dialogue, true);
    } else {
        displayFeedback(step.incorrect_dialogue, false);
    }
}


/** 정답/오답 피드백을 대화창에 표시하고, 다음 스텝 준비를 처리합니다. */
function displayFeedback(message, isCorrect) {
    isFeedbackMode = true; 
    quizArea.classList.add('hidden'); 
    
    nameBox.textContent = '키우'; 
    typeWriter(message); 

    if (isCorrect) {
        characterImg.src = `image/kiwu1.png`; 
        currentStep++; 
    } else {
        characterImg.src = `image/kiwu2.png`; 
    }

    const nextClickHandler = () => {
        dialogueBox.removeEventListener('click', nextClickHandler);
        isFeedbackMode = false;

        if (isCorrect) {
            nextStep(); 
        } else {
            // 오답인 경우, 재시도를 위해 퀴즈 이전 상태로 복귀 및 기본 표정 설정
            characterImg.src = `image/kiwu1.png`;
            dialogueText.textContent = ''; 
            nameBox.textContent = '키우';
            typeWriter('다시 한번 퀴즈를 풀어보자.');
            
            // 다음 클릭 시 퀴즈 창이 다시 뜨도록 설정
            dialogueBox.addEventListener('click', () => {
                // currentStep은 유지된 상태이므로 해당 퀴즈가 다시 뜸
                handleQuiz(storyData[currentStep]); 
            }, { once: true });
        }
    };

    const interval = setInterval(() => {
        if (!isTyping) {
            clearInterval(interval);
            dialogueBox.addEventListener('click', nextClickHandler, { once: true });
        }
    }, 50);
}


// ----------------------------------------------------
// 4. 타이머 및 기록 전송 함수
// ----------------------------------------------------

/** 게임 타이머를 시작합니다. */
function startGameTimer() {
    startTime = Date.now(); // 밀리초 단위로 현재 시간 저장
    console.log("게임 타이머 시작:", startTime);
}

/** 게임 타이머를 멈추고 기록을 서버에 전송합니다. */
function stopGameTimerAndSendRecord() {
    endTime = Date.now();
    const duration = endTime - startTime; // 밀리초 단위의 총 플레이 시간
    const durationInSeconds = Math.floor(duration / 1000); // 초 단위로 변환 (정수)

    console.log("게임 타이머 종료:", endTime);
    console.log("총 플레이 시간 (초):", durationInSeconds);

    // ⭐ 서버에 플레이 시간 전송 (AJAX/Fetch 사용)
    sendPlayTimeToServer(durationInSeconds);
}

/** Fetch API를 사용하여 서버에 플레이 시간을 전송합니다. */
function sendPlayTimeToServer(timeInSeconds) {
    // 🚨 서버의 기록 업데이트 API 엔드포인트입니다. (server.js에 구현 필요)
    fetch('/api/update-record', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // ⭐ 인증 토큰이 있다면 여기에 추가해야 합니다.
            // 'Authorization': 'Bearer ' + localStorage.getItem('token') 
        },
        body: JSON.stringify({
            playTime: timeInSeconds 
            // 💡 서버에서 사용자를 식별할 수 있는 정보(예: 세션, 토큰)가 필요합니다. 
            // 클라이언트에서 userId를 직접 보내는 것은 보안상 취약할 수 있습니다.
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
    .catch(error => console.error('기록 전송 중 오류 발생:', error));
}


// ----------------------------------------------------
// 5. 이벤트 리스너 설정 및 단축키 기능
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', nextStep); 

// 대화창 클릭 시 다음 대사 진행 또는 타이핑 완료 처리
dialogueBox.addEventListener('click', () => {
    if (isFeedbackMode) return; 

    if (quizArea.classList.contains('hidden')) { 
        if (isTyping) {
            clearInterval(typingInterval);
            dialogueText.textContent = currentText;
            isTyping = false;
        } else {
            nextStep();
        }
    }
});

// 💡 [추가] 마지막 스테이지(퀴즈)로 바로 이동하는 단축키 기능 (Ctrl + E)
document.addEventListener('keydown', (e) => {
    // Windows/Linux: Ctrl + E, Mac: Command + E
    if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'E') {
        e.preventDefault(); 

        if (confirm("엔딩으로 바로 이동하시겠습니까?")) {
            // 현재 타이핑 중인 모든 동작 중지
            if (typingInterval) clearInterval(typingInterval);
            isTyping = false;
            isFeedbackMode = false;
            
            // 🚨 타이머를 시작하고 마지막 단계로 이동 (기록 테스트 시 유용)
            startGameTimer();
            currentStep = FINAL_QUIZ_START_STEP;
            nextStep();
        }
    }
});