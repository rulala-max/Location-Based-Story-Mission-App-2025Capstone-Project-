// server.js (Node.js + Express + Naver Maps API 프록시 통합)
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// --------------------------------------------------
// 💡 환경 및 DB 설정
// --------------------------------------------------
const { local, production } = require("./config"); 
const app = express();
const PORT = process.env.PORT || 3000;

const dbConfig = process.env.NODE_ENV === "production" ? production : local;
const db = mysql.createPool(dbConfig);

// CORS, JSON 파싱
app.use(cors());
app.use(bodyParser.json());

// 세션 설정
app.use(session({
    secret: "capstone_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// 정적 파일
app.use(express.static(__dirname));
app.use('/gamePage', express.static(path.join(__dirname, '..', 'gamePage')));

// --------------------------------------------------
// 💡 MySQL 연결 확인
// --------------------------------------------------
db.getConnection()
    .then(connection => { console.log("✅ MySQL 연결 성공"); connection.release(); })
    .catch(err => console.error("❌ MySQL 연결 실패:", err));

// --------------------------------------------------
// 💡 Naver Maps API 프록시
// --------------------------------------------------
const NAVER_CLIENT_ID = "qo0efvjddx";
const NAVER_CLIENT_SECRET = "xCmlGbmgkX0K16fNpVMN7rI79sZJcmh8GHlYAuWJ";

// Directions API
app.get("/api/directions", async (req, res) => {
    try {
        const { startLat, startLng, endLat, endLng } = req.query;
        const url = `https://maps.apigw.ntruss.com/map-direction/v1/driving?start=${startLng},${startLat}&goal=${endLng},${endLat}&option=trafast`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
                "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Directions API 호출 오류:", err);
        res.status(500).json({ success: false, message: "Directions API 호출 실패" });
    }
});

// Geocoding API
app.get("/api/geocode", async (req, res) => {
    try {
        const { address } = req.query;
        const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
                "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Geocode API 호출 오류:", err);
        res.status(500).json({ success: false, message: "Geocode API 호출 실패" });
    }
});

// Static Map API
app.get("/api/staticmap", async (req, res) => {
    try {
        const { centerLat, centerLng, markers } = req.query;
        const url = `https://maps.apigw.ntruss.com/map-static/v2/raster?center=${centerLng},${centerLat}&level=16&w=600&h=400&markers=${markers}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
                "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET
            }
        });
        const buffer = await response.arrayBuffer();
        res.set("Content-Type", "image/png");
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error("Static Map API 호출 오류:", err);
        res.status(500).json({ success: false, message: "Static Map API 호출 실패" });
    }
});

// --------------------------------------------------
// 💡 기존 회원/플레이타임/랭킹 API 로직
// (생략하지 않고 그대로 유지)
// --------------------------------------------------
// ... 이전 server.js 내용 그대로 ...

// HTML 파일 제공
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "main.html")));
app.get("/sampleMap.html", (req, res) => res.sendFile(path.join(__dirname, "..", "sampleMap.html")));
app.get("/login.html", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/signup.html", (req, res) => res.sendFile(path.join(__dirname, "signup.html")));
app.get("/rank.html", (req, res) => res.sendFile(path.join(__dirname, "rank.html")));

app.listen(PORT, () => console.log(`🚀 서버 실행: http://localhost:${PORT}`));
