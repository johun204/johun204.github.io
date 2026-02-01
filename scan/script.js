let cvReady = false;
let videoStream = null;
let isStreaming = false;
let detectedQuad = null; // 감지된 4개 좌표 저장용

// DOM Elements
const video = document.getElementById('videoInput');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');
const outputCanvas = document.getElementById('outputCanvas');
const statusMsg = document.getElementById('status');
const captureBtn = document.getElementById('captureBtn');

// OpenCV 로드 완료
function onOpenCvReady() {
    cvReady = true;
    statusMsg.innerText = '✅ 시스템 준비 완료';
    startCamera(); // 로드되자마자 카메라 시작
}

// --- 1. 카메라 제어 ---
async function startCamera() {
    if (!cvReady) return;
    
    // 후면 카메라 우선 요청
    const constraints = {
        video: {
            facingMode: { exact: "environment" }, // 후면 카메라 강제 시도
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    try {
        // facingMode: environment 실패 시 일반 video 요청 (PC 등)
        try {
            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e) {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        video.srcObject = videoStream;
        video.onloadedmetadata = () => {
            video.play();
            isStreaming = true;
            captureBtn.disabled = false;
            
            // 캔버스 크기를 비디오 실제 크기에 맞춤
            overlayCanvas.width = video.videoWidth;
            overlayCanvas.height = video.videoHeight;
            
            requestAnimationFrame(processVideoFrame);
        };
    } catch (err) {
        console.error("카메라 접근 실패:", err);
        statusMsg.innerText = "❌ 카메라 권한이 필요합니다.";
        // 카메라 실패 시 파일 모드로 유도할 수도 있음
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    isStreaming = false;
}

// --- 2. 실시간 감지 루프 (비디오 프레임 처리) ---
function processVideoFrame() {
    if (!isStreaming) return;

    try {
        // 비디오 프레임을 캡처하여 OpenCV Mat으로 변환
        // 성능을 위해 작은 사이즈로 리사이징하지 않고 바로 처리하되,
        // 너무 느리면 cap을 줄여야 함. 최신 폰은 720p도 충분히 처리 가능.
        let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
        let cap = new cv.VideoCapture(video);
        cap.read(src);

        // 문서 감지 수행
        let result = detectDocument(src);

        // 오버레이 캔버스 초기화
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        if (result.corners) {
            detectedQuad = result.corners; // 캡처를 위해 좌표 저장

            // 인식된 영역 파란색으로 칠하기
            drawOverlay(result.corners);
        } else {
            detectedQuad = null;
        }

        // 메모리 해제
        src.delete();
        if (result.debugMat) result.debugMat.delete();

        // 다음 프레임 요청
        requestAnimationFrame(processVideoFrame);
    } catch (err) {
        console.error(err);
        isStreaming = false; // 에러 발생 시 중단
    }
}

// --- 3. 핵심 알고리즘: 문서 감지 (개선됨) ---
function detectDocument(src) {
    let dst = new cv.Mat();
    let gray = new cv.Mat();
    let blur = new cv.Mat();
    let edges = new cv.Mat();
    
    // 1. 전처리
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    cv.Canny(blur, edges, 75, 200);

    // [중요] 형태학적 연산 (Morphology): 끊어진 선 잇기 & 표 내부 무시
    // Dilate를 통해 선을 두껍게 만들어 작은 구멍을 메움
    let kernel = cv.Mat.ones(5, 5, cv.CV_8U);
    cv.dilate(edges, edges, kernel); // 엣지 팽창

    // 2. 컨투어 찾기
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE); 
    // RETR_EXTERNAL: 가장 바깥쪽 라인만 찾음 (표가 종이 안에 있으면 무시됨)

    // 3. 가장 큰 사각형 찾기
    let maxArea = 0;
    let maxContour = null;
    
    // 화면 전체 면적의 10% 이상이어야 인정 (노이즈 제거)
    const minArea = src.cols * src.rows * 0.1; 

    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt);

        if (area < minArea) continue;

        let peri = cv.arcLength(cnt, true);
        let approx = new cv.Mat();
        cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

        // 꼭짓점이 4개이고, 현재까지 찾은 것 중 가장 크면 선택
        if (approx.rows === 4 && area > maxArea) {
            // 볼록한 도형인지 확인 (꼬인 사각형 제외)
            if (cv.isContourConvex(approx)) {
                maxArea = area;
                if (maxContour) maxContour.delete();
                maxContour = approx; // approx 소유권 이전
            } else {
                approx.delete();
            }
        } else {
            approx.delete();
        }
    }

    // 결과 반환 객체
    let corners = null;
    if (maxContour) {
        corners = [];
        for (let i = 0; i < 4; i++) {
            corners.push({
                x: maxContour.data32S[i * 2],
                y: maxContour.data32S[i * 2 + 1]
            });
        }
        maxContour.delete();
    }

    // 메모리 정리
    dst.delete(); gray.delete(); blur.delete(); edges.delete(); kernel.delete();
    contours.delete(); hierarchy.delete();

    return { corners: corners };
}

// --- 4. 오버레이 그리기 ---
function drawOverlay(corners) {
    if (!corners) return;

    // 좌표 순서 정렬이 필요할 수 있으나 시각화에는 그냥 그려도 됨.
    // 하지만 폴리곤을 예쁘게 칠하려면 순서대로 잇는 게 좋음.
    // (여기서는 단순히 path 연결)
    
    overlayCtx.beginPath();
    overlayCtx.moveTo(corners[0].x, corners[0].y);
    overlayCtx.lineTo(corners[1].x, corners[1].y);
    overlayCtx.lineTo(corners[2].x, corners[2].y);
    overlayCtx.lineTo(corners[3].x, corners[3].y);
    overlayCtx.closePath();

    // 반투명 파란색 채우기
    overlayCtx.fillStyle = "rgba(0, 123, 255, 0.4)";
    overlayCtx.fill();
    
    // 테두리
    overlayCtx.strokeStyle = "#00ff00";
    overlayCtx.lineWidth = 4;
    overlayCtx.stroke();
}


// --- 5. 캡처 및 스캔 변환 수행 ---
captureBtn.addEventListener('click', () => {
    if (!isStreaming) return;

    // 현재 비디오 프레임을 캡처
    let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
    let cap = new cv.VideoCapture(video);
    cap.read(src);
    
    // 만약 실시간 감지된 좌표(detectedQuad)가 있으면 그걸 쓰고,
    // 없으면 현재 프레임에서 다시 한 번 정밀 감지 시도
    let corners = detectedQuad;
    if (!corners) {
        let result = detectDocument(src);
        corners = result.corners;
    }

    if (!corners) {
        alert("문서를 찾지 못했습니다. 배경과 대비되게 놓아주세요.");
        src.delete();
        return;
    }

    processCropAndScan(src, corners);
    src.delete();
    
    // UI 전환
    stopCamera();
    document.getElementById('cameraSection').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
});

// --- 6. 투시 변환 및 스캔 효과 (공통 로직) ---
function processCropAndScan(srcMat, corners) {
    // 좌표 정렬 (TL, TR, BR, BL)
    let sortedCorners = sortCorners(corners);

    // 너비/높이 계산
    let widthTop = Math.hypot(sortedCorners[1].x - sortedCorners[0].x, sortedCorners[1].y - sortedCorners[0].y);
    let widthBottom = Math.hypot(sortedCorners[2].x - sortedCorners[3].x, sortedCorners[2].y - sortedCorners[3].y);
    let maxWidth = Math.max(widthTop, widthBottom);

    let heightLeft = Math.hypot(sortedCorners[3].x - sortedCorners[0].x, sortedCorners[3].y - sortedCorners[0].y);
    let heightRight = Math.hypot(sortedCorners[2].x - sortedCorners[1].x, sortedCorners[2].y - sortedCorners[1].y);
    let maxHeight = Math.max(heightLeft, heightRight);

    // 변환 행렬
    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        sortedCorners[0].x, sortedCorners[0].y,
        sortedCorners[1].x, sortedCorners[1].y,
        sortedCorners[2].x, sortedCorners[2].y,
        sortedCorners[3].x, sortedCorners[3].y
    ]);
    
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        maxWidth, 0,
        maxWidth, maxHeight,
        0, maxHeight
    ]);

    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    let dst = new cv.Mat();
    
    // 자르기 (Warp)
    cv.warpPerspective(srcMat, dst, M, new cv.Size(maxWidth, maxHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

    // 스캔 효과 (이진화)
    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0);
    // Gaussian Adaptive Threshold가 그림자 제거에 탁월
    cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

    // 결과 캔버스에 그리기
    cv.imshow('outputCanvas', dst);

    // 메모리 해제
    srcTri.delete(); dstTri.delete(); M.delete(); dst.delete();
}

function sortCorners(points) {
    // Y축 기준 정렬
    points.sort((a, b) => a.y - b.y);
    // 상단 2개, 하단 2개
    let top = points.slice(0, 2).sort((a, b) => a.x - b.x);
    let bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);
    // TL, TR, BR, BL
    return [top[0], top[1], bottom[1], bottom[0]];
}


// --- 7. 파일 업로드 모드 처리 ---
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
    let file = e.target.files[0];
    if(!file) return;

    let reader = new FileReader();
    reader.onload = (ev) => {
        let img = new Image();
        img.onload = () => {
            let src = cv.imread(img);
            let result = detectDocument(src);
            if(result.corners) {
                processCropAndScan(src, result.corners);
                document.getElementById('fileSection').style.display = 'none';
                document.getElementById('resultContainer').style.display = 'block';
            } else {
                alert("문서 인식이 어렵습니다. 다시 시도해주세요.");
                // 실패시 원본이라도 보여줌
                cv.imshow('outputCanvas', src);
            }
            src.delete();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
});


// --- 8. UI 탭 전환 및 버튼 이벤트 ---
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
    location.reload(); // 간단히 새로고침으로 초기화
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    let link = document.createElement('a');
    link.download = 'scan_result.png';
    link.href = outputCanvas.toDataURL();
    link.click();
});
