// OpenCV 로딩 완료 여부 플래그
let cvReady = false;

// OpenCV 로드 완료 콜백
function onOpenCvReady() {
    cvReady = true;
    document.getElementById('status').innerText = '✅ 시스템 준비 완료! 사진을 선택하세요.';
}

const fileInput = document.getElementById('fileInput');
const imgElement = document.getElementById('imageSrc');
const canvas = document.getElementById('outputCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const statusMsg = document.getElementById('status');

// 1. 이미지 파일 업로드 이벤트
fileInput.addEventListener('change', (e) => {
    if (!cvReady) {
        alert("OpenCV가 아직 로드되지 않았습니다. 잠시만 기다려주세요.");
        return;
    }

    const file = e.target.files[0];
    if (!file) return;

    statusMsg.innerText = "⏳ 처리 중...";
    downloadBtn.style.display = 'none';

    const reader = new FileReader();
    reader.onload = (ev) => {
        imgElement.src = ev.target.result;
    };
    reader.readAsDataURL(file);
});

// 2. 이미지가 로드되면 자동으로 스캔 프로세스 시작
imgElement.onload = function () {
    try {
        processImage();
        statusMsg.innerText = "✨ 변환 완료!";
        downloadBtn.style.display = 'inline-block';
    } catch (err) {
        console.error(err);
        statusMsg.innerText = "❌ 처리 중 오류 발생";
    }
};

// 3. 메인 이미지 처리 함수
function processImage() {
    // OpenCV Mat 생성
    let src = cv.imread(imgElement);
    let dst = new cv.Mat();
    let gray = new cv.Mat();
    let blur = new cv.Mat();
    let edges = new cv.Mat();

    // --- 전처리 (Preprocessing) ---
    // 그레이스케일 변환
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    // 가우시안 블러 (노이즈 제거)
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    // Canny 엣지 검출
    cv.Canny(blur, edges, 75, 200);

    // --- 컨투어(윤곽선) 찾기 ---
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // --- 가장 큰 사각형(문서) 찾기 ---
    let maxArea = 0;
    let maxContour = null;
    let approx = new cv.Mat();

    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt);
        
        // 면적이 너무 작으면 무시
        if (area < 1000) continue;

        // 도형 단순화 (꼭짓점 줄이기)
        let peri = cv.arcLength(cnt, true);
        let tmpApprox = new cv.Mat();
        cv.approxPolyDP(cnt, tmpApprox, 0.02 * peri, true);

        // 꼭짓점이 4개이고(사각형), 면적이 가장 큰 것 선택
        if (tmpApprox.rows === 4 && area > maxArea) {
            maxArea = area;
            if (maxContour) maxContour.delete(); // 이전 메모리 해제
            maxContour = tmpApprox; // 새로운 컨투어 저장
            // approx는 루프 내에서 계속 쓰이므로 별도 저장하지 않음 (maxContour가 담당)
        } else {
            tmpApprox.delete();
        }
    }

    // 문서 감지에 실패하면 원본 출력
    if (maxContour === null) {
        alert("문서 영역을 찾을 수 없습니다. 배경과 문서의 대비가 명확한지 확인해주세요.");
        cv.imshow('outputCanvas', src);
        src.delete(); dst.delete(); gray.delete(); blur.delete(); edges.delete(); 
        contours.delete(); hierarchy.delete(); approx.delete();
        return;
    }

    // --- 투시 변환 (Perspective Transform) ---
    // 1. 감지된 4개의 좌표 가져오기
    let cornerArray = [];
    for (let i = 0; i < 4; i++) {
        cornerArray.push({
            x: maxContour.data32S[i * 2],
            y: maxContour.data32S[i * 2 + 1]
        });
    }

    // 2. 좌표 정렬 (좌상, 우상, 우하, 좌하 순서)
    let sortedCorners = sortCorners(cornerArray);

    // 3. 변환될 이미지의 크기 계산 (A4 비율 유지 또는 감지된 크기 기반)
    // 상단 너비와 하단 너비 중 큰 값 사용
    let widthTop = Math.hypot(sortedCorners[1].x - sortedCorners[0].x, sortedCorners[1].y - sortedCorners[0].y);
    let widthBottom = Math.hypot(sortedCorners[2].x - sortedCorners[3].x, sortedCorners[2].y - sortedCorners[3].y);
    let maxWidth = Math.max(widthTop, widthBottom);

    // 좌측 높이와 우측 높이 중 큰 값 사용
    let heightLeft = Math.hypot(sortedCorners[3].x - sortedCorners[0].x, sortedCorners[3].y - sortedCorners[0].y);
    let heightRight = Math.hypot(sortedCorners[2].x - sortedCorners[1].x, sortedCorners[2].y - sortedCorners[1].y);
    let maxHeight = Math.max(heightLeft, heightRight);

    // 4. 변환 행렬 구하기
    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        sortedCorners[0].x, sortedCorners[0].y, // TL
        sortedCorners[1].x, sortedCorners[1].y, // TR
        sortedCorners[2].x, sortedCorners[2].y, // BR
        sortedCorners[3].x, sortedCorners[3].y  // BL
    ]);

    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        maxWidth, 0,
        maxWidth, maxHeight,
        0, maxHeight
    ]);

    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    
    // 5. 이미지 펴기 (Warp)
    cv.warpPerspective(src, dst, M, new cv.Size(maxWidth, maxHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

    // --- 후처리 (Scan Effect) ---
    // 컬러를 흑백으로 변경하고 이진화 처리 (스캔 효과)
    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0);
    // Adaptive Threshold: 그림자 지거나 조명이 불균일해도 글자를 잘 따냄
    cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

    // 결과 출력
    cv.imshow('outputCanvas', dst);

    // 메모리 정리
    src.delete(); dst.delete(); gray.delete(); blur.delete(); edges.delete();
    contours.delete(); hierarchy.delete(); approx.delete();
    if(maxContour) maxContour.delete();
    srcTri.delete(); dstTri.delete(); M.delete();
}

// 좌표 정렬 헬퍼 함수: [TL, TR, BR, BL] 순서로 정렬
function sortCorners(points) {
    // Y좌표 기준으로 먼저 정렬 (상단 2개, 하단 2개 분리)
    points.sort((a, b) => a.y - b.y);

    // 상단 2개 중 X가 작은게 TL, 큰게 TR
    let top = points.slice(0, 2).sort((a, b) => a.x - b.x);
    let tl = top[0];
    let tr = top[1];

    // 하단 2개 중 X가 작은게 BL, 큰게 BR
    let bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);
    let bl = bottom[0];
    let br = bottom[1];

    // 순서: TL, TR, BR, BL (OpenCV warpPerspective 순서에 맞춤)
    return [tl, tr, br, bl];
}

// 다운로드 기능
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'scanned_document.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
