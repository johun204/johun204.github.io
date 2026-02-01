let cvReady = false;
let videoStream = null;
let isStreaming = false;
let detectedQuad = null; // 감지된 4개 좌표 (원본 해상도 기준)

// DOM Elements
const video = document.getElementById('videoInput');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');
const outputCanvas = document.getElementById('outputCanvas');
const statusMsg = document.getElementById('status');
const captureBtn = document.getElementById('captureBtn');

// OpenCV 로드 완료 콜백
function onOpenCvReady() {
    cvReady = true;
    statusMsg.innerText = '✅ 고성능 인식 엔진 준비 완료';
    startCamera();
}

// --- 1. 카메라 시작 설정 ---
async function startCamera() {
    if (!cvReady) return;

    const constraints = {
        video: {
            facingMode: { exact: "environment" }, // 후면 카메라 강제
            width: { ideal: 1920 }, // 고해상도 요청 (인식은 축소해서 하므로 상관없음)
            height: { ideal: 1080 }
        }
    };

    try {
        try {
            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e) {
            // 후면 카메라 실패 시 전면/일반 카메라 시도
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        video.srcObject = videoStream;
        video.onloadedmetadata = () => {
            video.play();
            isStreaming = true;
            captureBtn.disabled = false;
            
            // 캔버스 크기 동기화
            overlayCanvas.width = video.videoWidth;
            overlayCanvas.height = video.videoHeight;
            
            requestAnimationFrame(processVideoFrame);
        };
    } catch (err) {
        console.error("Camera Error:", err);
        statusMsg.innerText = "❌ 카메라 권한이 없거나 지원하지 않는 기기입니다.";
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    isStreaming = false;
}

// --- 2. 비디오 프레임 처리 루프 ---
function processVideoFrame() {
    if (!isStreaming) return;

    try {
        let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
        let cap = new cv.VideoCapture(video);
        cap.read(src);

        // 문서 감지 (좌표 반환)
        let resultCoords = detectDocumentHighPerformance(src);

        // 오버레이 초기화
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        if (resultCoords) {
            detectedQuad = resultCoords; // 캡처용으로 저장
            drawOverlay(resultCoords);
        } else {
            detectedQuad = null;
        }

        src.delete();
        requestAnimationFrame(processVideoFrame);
    } catch (err) {
        console.error(err);
        isStreaming = false;
    }
}

// --- 3. [핵심] 고성능 문서 감지 알고리즘 ---
function detectDocumentHighPerformance(src) {
    // 메모리 누수 방지를 위해 Mat 생성 최소화
    let dst = new cv.Mat();
    let gray = new cv.Mat();
    let blur = new cv.Mat();
    let edges = new cv.Mat();
    let kernel = cv.Mat.ones(5, 5, cv.CV_8U); // 모폴로지용 커널

    // 1. 다운샘플링 (속도 및 노이즈 제거 핵심)
    // 가로 500px로 줄여서 연산함
    let scale = 500 / src.cols;
    let downWidth = 500;
    let downHeight = Math.round(src.rows * scale);
    let dsize = new cv.Size(downWidth, downHeight);
    
    cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);

    // 2. 전처리
    cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    
    // Canny Edge Detection
    cv.Canny(blur, edges, 75, 200);

    // 3. [강력함] Morphology Close (끊어진 선 잇기)
    // 엣지를 팽창시켰다가 다시 침식시켜서 끊어진 종이 테두리를 연결함
    cv.morphologyEx(edges, edges, cv.MORPH_CLOSE, kernel);

    // 4. 컨투어 찾기
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // RETR_EXTERNAL: 표 안에 있는 선들은 무시하고 가장 바깥 테두리만 찾음
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // 5. 최적의 사각형 찾기
    let maxArea = 0;
    let foundCnt = null; // 찾은 컨투어 (approxPolyDP 적용 전)

    const minArea = (downWidth * downHeight) * 0.10; // 전체 화면의 10% 이상이어야 함

    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt);

        if (area < minArea) continue;

        // 도형 둘레 길이
        let peri = cv.arcLength(cnt, true);
        let approx = new cv.Mat();
        
        // 0.02는 오차 허용 범위. 값이 클수록 뭉툭하게, 작을수록 디테일하게
        // 종이가 구겨지거나 둥글 수 있으므로 약간 유연하게 0.02~0.03 권장
        cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

        // 꼭짓점이 4개이고 볼록한(convex) 도형인지 확인
        if (approx.rows === 4 && cv.isContourConvex(approx)) {
            if (area > maxArea) {
                maxArea = area;
                // 이전 후보 삭제
                if (foundCnt) foundCnt.delete();
                foundCnt = approx; // 현재 후보 저장 (메모리 관리 주의)
            } else {
                approx.delete();
            }
        } else {
            approx.delete();
        }
    }

    // 결과 좌표 계산 (다운샘플링된 좌표 -> 원본 좌표로 변환)
    let finalCorners = null;
    if (foundCnt) {
        finalCorners = [];
        for (let i = 0; i < 4; i++) {
            finalCorners.push({
                x: foundCnt.data32S[i * 2] / scale, // 원본 크기로 복구
                y: foundCnt.data32S[i * 2 + 1] / scale
            });
        }
        foundCnt.delete();
    }

    // 메모리 정리 (OpenCV.js 필수)
    dst.delete(); gray.delete(); blur.delete(); 
    edges.delete(); kernel.delete(); contours.delete(); hierarchy.delete();

    return finalCorners;
}

// --- 4. 오버레이 그리기 ---
function drawOverlay(corners) {
    if (!corners) return;

    overlayCtx.beginPath();
    overlayCtx.moveTo(corners[0].x, corners[0].y);
    overlayCtx.lineTo(corners[1].x, corners[1].y);
    overlayCtx.lineTo(corners[2].x, corners[2].y);
    overlayCtx.lineTo(corners[3].x, corners[3].y);
    overlayCtx.closePath();

    // 채우기 색상
    overlayCtx.fillStyle = "rgba(66, 133, 244, 0.3)"; // 구글 블루, 투명도
    overlayCtx.fill();
    
    // 테두리 색상
    overlayCtx.strokeStyle = "#4285F4";
    overlayCtx.lineWidth = 5;
    overlayCtx.stroke();
    
    // 각 코너에 점 찍기 (시각적 피드백 강화)
    overlayCtx.fillStyle = "#fff";
    corners.forEach(p => {
        overlayCtx.beginPath();
        overlayCtx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
        overlayCtx.fill();
    });
}

// --- 5. 캡처 및 변환 (Crop & Scan) ---
captureBtn.addEventListener('click', () => {
    if (!isStreaming) return;

    let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
    let cap = new cv.VideoCapture(video);
    cap.read(src);
    
    // 캡처 순간 다시 한 번 정밀 감지 시도 (실패 시 마지막 감지된 좌표 사용)
    let corners = detectDocumentHighPerformance(src);
    if (!corners && detectedQuad) {
        corners = detectedQuad;
    }

    if (!corners) {
        alert("문서를 찾을 수 없습니다. 배경과 문서의 경계가 명확한지 확인하세요.");
        src.delete();
        return;
    }

    processCropAndScan(src, corners);
    src.delete();
    
    stopCamera();
    document.getElementById('cameraSection').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
});

// --- 6. 투시 변환 및 필터링 ---
function processCropAndScan(srcMat, corners) {
    // 1. 좌표 정렬 (좌상, 우상, 우하, 좌하)
    let sorted = sortCorners(corners);

    // 2. 변환 후 크기 계산 (최대 너비/높이 사용)
    let widthTop = Math.hypot(sorted[1].x - sorted[0].x, sorted[1].y - sorted[0].y);
    let widthBottom = Math.hypot(sorted[2].x - sorted[3].x, sorted[2].y - sorted[3].y);
    let maxWidth = Math.max(widthTop, widthBottom);

    let heightLeft = Math.hypot(sorted[3].x - sorted[0].x, sorted[3].y - sorted[0].y);
    let heightRight = Math.hypot(sorted[2].x - sorted[1].x, sorted[2].y - sorted[1].y);
    let maxHeight = Math.max(heightLeft, heightRight);

    // 3. 변환 행렬 생성
    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        sorted[0].x, sorted[0].y,
        sorted[1].x, sorted[1].y,
        sorted[2].x, sorted[2].y,
        sorted[3].x, sorted[3].y
    ]);
    
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        maxWidth, 0,
        maxWidth, maxHeight,
        0, maxHeight
    ]);

    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    let dst = new cv.Mat();
    
    // 4. Warp (이미지 펴기)
    cv.warpPerspective(srcMat, dst, M, new cv.Size(maxWidth, maxHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

    // 5. 스캔 필터 (Adaptive Threshold)
    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0);
    // 15, 10 파라미터 튜닝: 조명을 좀 더 부드럽게 처리하여 글자 보존
    cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, 10);

    // 결과 출력
    cv.imshow('outputCanvas', dst);

    srcTri.delete(); dstTri.delete(); M.delete(); dst.delete();
}

// 좌표 정렬 함수
function sortCorners(points) {
    // Y좌표로 정렬 (상단 2개, 하단 2개)
    points.sort((a, b) => a.y - b.y);
    
    // 상단 2개 X좌표 정렬 (좌, 우)
    let top = points.slice(0, 2).sort((a, b) => a.x - b.x);
    // 하단 2개 X좌표 정렬 (좌, 우)
    let bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);
    
    // 순서: TL, TR, BR, BL
    return [top[0], top[1], bottom[1], bottom[0]];
}

// 파일 업로드 처리
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
    let file = e.target.files[0];
    if(!file) return;
    let reader = new FileReader();
    reader.onload = (ev) => {
        let img = new Image();
        img.onload = () => {
            let src = cv.imread(img);
            let corners = detectDocumentHighPerformance(src);
            if(corners) {
                processCropAndScan(src, corners);
                document.getElementById('fileSection').style.display = 'none';
                document.getElementById('resultContainer').style.display = 'block';
            } else {
                alert("문서를 찾지 못했습니다.");
                cv.imshow('outputCanvas', src);
            }
            src.delete();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
});

// UI 이벤트
document.getElementById('tabCamera').addEventListener('click', () => {
    document.getElementById('tabCamera').classList.add('active');
    document.getElementById('tabFile').classList.remove('active');
    document.getElementById('cameraSection').style.display = 'block';
    document.getElementById('fileSection').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'none';
    startCamera();
});

document.getElementById('tabFile').addEventListener('click', () => {
    document.getElementById('tabFile').classList.add('active');
    document.getElementById('tabCamera').classList.remove('active');
    document.getElementById('cameraSection').style.display = 'none';
    document.getElementById('fileSection').style.display = 'block';
    document.getElementById('resultContainer').style.display = 'none';
    stopCamera();
});

document.getElementById('retryBtn').addEventListener('click', () => {
    location.reload();
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    let link = document.createElement('a');
    link.download = 'scan_result.png';
    link.href = outputCanvas.toDataURL();
    link.click();
});
