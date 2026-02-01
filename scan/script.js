let cvReady = false;

function onOpenCvReady() {
    cvReady = true;
    document.getElementById('status').innerText = '✅ 준비 완료! 버튼을 눌러주세요.';
}

// 두 개의 인풋 엘리먼트 가져오기
const cameraInput = document.getElementById('cameraInput');
const galleryInput = document.getElementById('galleryInput');

const imgElement = document.getElementById('imageSrc');
const canvas = document.getElementById('outputCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const statusMsg = document.getElementById('status');

// 공통 파일 처리 함수
function handleFileSelect(e) {
    if (!cvReady) {
        alert("OpenCV 로딩 중입니다. 잠시만 기다려주세요.");
        return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // UI 초기화
    statusMsg.innerText = "⏳ 이미지 분석 및 변환 중...";
    downloadBtn.style.display = 'none';

    // 파일 읽기
    const reader = new FileReader();
    reader.onload = (ev) => {
        imgElement.src = ev.target.result;
    };
    reader.readAsDataURL(file);

    // 같은 파일을 다시 선택해도 반응하도록 value 초기화
    e.target.value = ''; 
}

// 이벤트 리스너 연결 (카메라, 갤러리 둘 다 같은 함수 실행)
cameraInput.addEventListener('change', handleFileSelect);
galleryInput.addEventListener('change', handleFileSelect);

// 이미지가 로드되면 프로세싱 시작
imgElement.onload = function () {
    // 약간의 딜레이를 주어 UI가 렌더링될 시간을 줌
    setTimeout(() => {
        try {
            processImage();
            statusMsg.innerText = "✨ 변환 완료!";
            downloadBtn.style.display = 'inline-block';
        } catch (err) {
            console.error(err);
            statusMsg.innerText = "❌ 처리 실패: 문서를 찾지 못했습니다.";
            // 실패 시 원본이라도 보여줌
            let src = cv.imread(imgElement);
            cv.imshow('outputCanvas', src);
            src.delete();
        }
    }, 100);
};

function processImage() {
    let src = cv.imread(imgElement);
    let dst = new cv.Mat();
    let gray = new cv.Mat();
    let blur = new cv.Mat();
    let edges = new cv.Mat();

    // 1. 전처리
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    cv.Canny(blur, edges, 75, 200);

    // 2. 윤곽선 찾기
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // 3. 문서 영역(가장 큰 사각형) 찾기
    let maxArea = 0;
    let maxContour = null;
    let approx = new cv.Mat();

    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt);
        
        if (area < 5000) continue; // 너무 작은 영역 무시

        let peri = cv.arcLength(cnt, true);
        let tmpApprox = new cv.Mat();
        cv.approxPolyDP(cnt, tmpApprox, 0.02 * peri, true);

        if (tmpApprox.rows === 4 && area > maxArea) {
            maxArea = area;
            if (maxContour) maxContour.delete();
            maxContour = tmpApprox;
        } else {
            tmpApprox.delete();
        }
    }

    if (maxContour === null) {
        src.delete(); dst.delete(); gray.delete(); blur.delete(); edges.delete(); 
        contours.delete(); hierarchy.delete(); approx.delete();
        throw new Error("No document found");
    }

    // 4. 좌표 정렬 및 투시 변환
    let cornerArray = [];
    for (let i = 0; i < 4; i++) {
        cornerArray.push({
            x: maxContour.data32S[i * 2],
            y: maxContour.data32S[i * 2 + 1]
        });
    }
    
    let sortedCorners = sortCorners(cornerArray);

    // 변환 크기 계산
    let widthTop = Math.hypot(sortedCorners[1].x - sortedCorners[0].x, sortedCorners[1].y - sortedCorners[0].y);
    let widthBottom = Math.hypot(sortedCorners[2].x - sortedCorners[3].x, sortedCorners[2].y - sortedCorners[3].y);
    let maxWidth = Math.max(widthTop, widthBottom);

    let heightLeft = Math.hypot(sortedCorners[3].x - sortedCorners[0].x, sortedCorners[3].y - sortedCorners[0].y);
    let heightRight = Math.hypot(sortedCorners[2].x - sortedCorners[1].x, sortedCorners[2].y - sortedCorners[1].y);
    let maxHeight = Math.max(heightLeft, heightRight);

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
    cv.warpPerspective(src, dst, M, new cv.Size(maxWidth, maxHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

    // 5. 스캔 효과 (이진화)
    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0);
    cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

    cv.imshow('outputCanvas', dst);

    // 메모리 해제
    src.delete(); dst.delete(); gray.delete(); blur.delete(); edges.delete();
    contours.delete(); hierarchy.delete(); approx.delete();
    maxContour.delete(); srcTri.delete(); dstTri.delete(); M.delete();
}

function sortCorners(points) {
    points.sort((a, b) => a.y - b.y);
    let top = points.slice(0, 2).sort((a, b) => a.x - b.x);
    let bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);
    return [top[0], top[1], bottom[1], bottom[0]];
}

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'scanned_doc.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
