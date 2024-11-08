const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let circles = [
    null, // 自我圆
    null, // 自然圆
];
let activeMode = null;
let activeCircle = null;
let isDrawing = false;
let startX, startY;

// 更新页面信息
function updateInfo() {
    const [selfCircle, natureCircle] = circles;
    let selfArea = 0,
        natureArea = 0,
        overlapArea = 0,
        overlapRatio = 0,
        distance = 0;

    if (selfCircle) {
        selfArea = Math.PI * Math.pow(selfCircle.radius, 2);
    }

    if (natureCircle) {
        natureArea = Math.PI * Math.pow(natureCircle.radius, 2);
    }

    if (selfCircle && natureCircle) {
        distance = Math.hypot(
            natureCircle.x - selfCircle.x,
            natureCircle.y - selfCircle.y
        );

        const d = distance;
        const r1 = selfCircle.radius;
        const r2 = natureCircle.radius;

        if (d < r1 + r2) {
            if (d <= Math.abs(r1 - r2)) {
                overlapArea = Math.PI * Math.pow(Math.min(r1, r2), 2);
            } else {
                const angle1 = 2 * Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
                const angle2 = 2 * Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
                const area1 = 0.5 * r1 * r1 * (angle1 - Math.sin(angle1));
                const area2 = 0.5 * r2 * r2 * (angle2 - Math.sin(angle2));
                overlapArea = area1 + area2;
            }
        }

        overlapRatio = overlapArea / (selfArea + natureArea);
    }

    document.getElementById("natureArea").textContent = natureArea.toFixed(3);
    document.getElementById("selfArea").textContent = selfArea.toFixed(3);
    document.getElementById("areaRatio").textContent = (
        (natureArea / selfArea) || 0
    ).toFixed(3);
    document.getElementById("overlapArea").textContent = overlapArea.toFixed(3);
    document.getElementById("overlapRatio").textContent = overlapRatio.toFixed(3);
    document.getElementById("distance").textContent = distance.toFixed(3);
}

// 绘制所有圆形
function drawCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle, index) => {
        if (!circle) return;

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(
            index === 0 ? "自我" : "自然",
            circle.x,
            circle.y + circle.radius + 15
        );
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 设置按钮的激活状态
function setActiveMode(mode) {
    activeMode = mode;
    document.querySelectorAll("#controls button").forEach((button) => {
        button.classList.remove("active");
    });
    if (mode) {
        document.getElementById(mode).classList.add("active");
    }
}

// 初始化事件
document.getElementById("drawSelf").addEventListener("click", () => {
    setActiveMode("drawSelf");
});
document.getElementById("drawNature").addEventListener("click", () => {
    setActiveMode("drawNature");
});
document.getElementById("adjustDistance").addEventListener("click", () => {
    setActiveMode("adjustDistance");
});
document.getElementById("undo").addEventListener("click", () => {
    const index = circles.findIndex((circle) => circle !== null);
    if (index !== -1) {
        circles[index] = null;
        drawCircles();
        updateInfo();
    }
});

// 鼠标事件
canvas.addEventListener("mousedown", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;

    if (activeMode === "drawSelf") {
        circles[0] = { x, y, radius: 0, color: "rgba(255, 255, 0, 0.5)" };
        activeCircle = circles[0];
    } else if (activeMode === "drawNature") {
        circles[1] = { x, y, radius: 0, color: "rgba(0, 255, 0, 0.5)" };
        activeCircle = circles[1];
    } else if (activeMode === "adjustDistance") {
        activeCircle = circles.find(
            (circle) => Math.hypot(circle.x - x, circle.y - y) < circle.radius
        );
    }
    isDrawing = true;
    startX = x;
    startY = y;
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing || !activeCircle) return;

    const x = event.offsetX;
    const y = event.offsetY;

    if (activeMode === "drawSelf" || activeMode === "drawNature") {
        activeCircle.radius = Math.hypot(x - startX, y - startY);
    } else if (activeMode === "adjustDistance") {
        activeCircle.x = x;
        activeCircle.y = y;
    }

    drawCircles();
    updateInfo();
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    activeCircle = null;
});
