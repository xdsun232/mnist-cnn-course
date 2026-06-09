import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pptxgen = require("/Users/sun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "MNIST CNN Course";
pptx.company = "MNIST CNN Course";
pptx.subject = "Day 2 CNN theory lecture";
pptx.title = "第2天：CNN神经网络原理";
pptx.lang = "zh-CN";
pptx.theme = {
  headFontFace: "Microsoft YaHei",
  bodyFontFace: "Microsoft YaHei",
  lang: "zh-CN",
};
pptx.defineLayout({ name: "COURSE_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "COURSE_WIDE";

const W = 13.333;
const H = 7.5;
const C = {
  ink: "14213D",
  ink2: "233044",
  paper: "F7F4EC",
  white: "FFFFFF",
  muted: "667085",
  grid: "D9DEE8",
  mint: "20B486",
  amber: "F7B801",
  coral: "F25F5C",
  violet: "7C3AED",
  blue: "3A86FF",
  greenSoft: "DDF7ED",
  amberSoft: "FFF4D6",
  coralSoft: "FFE8E5",
  violetSoft: "EEE7FF",
  blueSoft: "E6F0FF",
};

const shape = pptx.ShapeType;
const font = "Microsoft YaHei";

function addTitle(slide, title, subtitle = "") {
  slide.addText(title, {
    x: 0.6, y: 0.35, w: 9.7, h: 0.45,
    fontFace: font, fontSize: 26, bold: true, color: C.ink,
    margin: 0, breakLine: false, fit: "shrink",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.62, y: 0.86, w: 10.4, h: 0.28,
      fontFace: font, fontSize: 9.5, color: C.muted,
      margin: 0, fit: "shrink",
    });
  }
  slide.addShape(shape.line, {
    x: 0.6, y: 1.18, w: 12.1, h: 0,
    line: { color: C.grid, width: 0.75 },
  });
  slide.addShape(shape.rect, {
    x: 12.1, y: 0.36, w: 0.62, h: 0.23,
    fill: { color: C.mint }, line: { color: C.mint },
  });
}

function addFooter(slide, n) {
  slide.addText(`Day 2  CNN神经网络原理  /  ${String(n).padStart(2, "0")}`, {
    x: 0.6, y: 7.05, w: 3.6, h: 0.22,
    fontFace: font, fontSize: 7.5, color: "98A2B3",
    margin: 0,
  });
}

function sectionSlide(title, kicker, items, accent = C.mint) {
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };
  slide.addShape(shape.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.ink }, line: { color: C.ink } });
  slide.addShape(shape.rect, { x: 0.0, y: 0, w: 0.42, h: H, fill: { color: accent }, line: { color: accent } });
  slide.addText(kicker, {
    x: 0.85, y: 1.0, w: 3.0, h: 0.25,
    fontFace: font, fontSize: 10.5, color: accent, bold: true,
    margin: 0,
  });
  slide.addText(title, {
    x: 0.85, y: 1.42, w: 8.8, h: 1.0,
    fontFace: font, fontSize: 37, color: C.white, bold: true,
    margin: 0, fit: "shrink",
  });
  const startY = 3.25;
  items.forEach((item, i) => {
    const y = startY + i * 0.62;
    slide.addShape(shape.ellipse, { x: 0.9, y: y + 0.03, w: 0.22, h: 0.22, fill: { color: accent }, line: { color: accent } });
    slide.addText(item, {
      x: 1.24, y, w: 9.2, h: 0.3,
      fontFace: font, fontSize: 16.5, color: "E7ECF3",
      margin: 0, fit: "shrink",
    });
  });
  addNeuralMesh(slide, 9.0, 0.75, 3.7, 5.8, accent, true);
  return slide;
}

function bulletText(slide, bullets, x, y, w, h, size = 15, color = C.ink2) {
  const runs = [];
  bullets.forEach((b, i) => {
    runs.push({
      text: b,
      options: { bullet: { type: "ul" }, breakLine: i !== bullets.length - 1 },
    });
  });
  slide.addText(runs, {
    x, y, w, h,
    fontFace: font, fontSize: size, color,
    breakLine: false, fit: "shrink",
    paraSpaceAfterPt: 8,
    margin: 0.04,
    valign: "mid",
  });
}

function card(slide, x, y, w, h, title, body, color = C.mint, fill = C.white) {
  slide.addShape(shape.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: "E4E7EC", width: 0.8 },
    shadow: { type: "outer", color: "000000", opacity: 0.08, blur: 1, angle: 45, offset: 1 },
  });
  slide.addShape(shape.rect, { x, y, w: 0.08, h, fill: { color }, line: { color } });
  slide.addText(title, {
    x: x + 0.25, y: y + 0.18, w: w - 0.45, h: 0.28,
    fontFace: font, fontSize: 14, bold: true, color: C.ink,
    margin: 0, fit: "shrink",
  });
  slide.addText(body, {
    x: x + 0.25, y: y + 0.58, w: w - 0.45, h: h - 0.75,
    fontFace: font, fontSize: 10.5, color: C.ink2,
    margin: 0.02, fit: "shrink", breakLine: false,
  });
}

function addCode(slide, code, x, y, w, h, size = 11) {
  slide.addShape(shape.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: "111827" },
    line: { color: "111827" },
  });
  slide.addText(code, {
    x: x + 0.18, y: y + 0.16, w: w - 0.36, h: h - 0.28,
    fontFace: "Menlo", fontSize: size, color: "ECFDF5",
    margin: 0, fit: "shrink", breakLine: false,
  });
}

function addMiniMatrix(slide, matrix, x, y, cell, opts = {}) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const stroke = opts.stroke || C.grid;
  const fill = opts.fill || C.white;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = matrix[r][c];
      const hot = opts.hot && opts.hot(r, c, val);
      slide.addShape(shape.rect, {
        x: x + c * cell, y: y + r * cell, w: cell, h: cell,
        fill: { color: hot ? opts.hotFill || C.greenSoft : fill },
        line: { color: stroke, width: 0.8 },
      });
      slide.addText(String(val), {
        x: x + c * cell, y: y + r * cell + 0.01, w: cell, h: cell,
        fontFace: font, fontSize: opts.fontSize || 12,
        bold: hot, color: hot ? opts.hotColor || C.ink : opts.color || C.ink2,
        align: "center", valign: "mid", margin: 0,
      });
    }
  }
}

function addArrow(slide, x, y, w, label, color = C.mint) {
  slide.addShape(shape.chevron, {
    x, y, w, h: 0.52,
    fill: { color }, line: { color },
  });
  slide.addText(label, {
    x: x + 0.05, y: y + 0.12, w: w - 0.1, h: 0.18,
    fontFace: font, fontSize: 10, bold: true, color: C.white,
    align: "center", margin: 0, fit: "shrink",
  });
}

function addNeuralMesh(slide, x, y, w, h, accent = C.mint, dark = false) {
  const cols = [
    { n: 5, x: x + 0.1 },
    { n: 4, x: x + w * 0.42 },
    { n: 3, x: x + w * 0.78 },
  ];
  const nodes = [];
  cols.forEach((col, ci) => {
    const gap = h / (col.n + 1);
    for (let i = 0; i < col.n; i++) {
      nodes.push({ ci, x: col.x, y: y + gap * (i + 1) });
    }
  });
  nodes.filter(n => n.ci === 0).forEach(a => {
    nodes.filter(n => n.ci === 1).forEach(b => {
      slide.addShape(shape.line, {
        x: a.x + 0.1, y: a.y, w: b.x - a.x - 0.2, h: b.y - a.y,
        line: { color: dark ? "7F8EA3" : "CDD5DF", transparency: dark ? 52 : 35, width: 0.5 },
      });
    });
  });
  nodes.filter(n => n.ci === 1).forEach(a => {
    nodes.filter(n => n.ci === 2).forEach(b => {
      slide.addShape(shape.line, {
        x: a.x + 0.1, y: a.y, w: b.x - a.x - 0.2, h: b.y - a.y,
        line: { color: dark ? "7F8EA3" : "CDD5DF", transparency: dark ? 52 : 35, width: 0.5 },
      });
    });
  });
  nodes.forEach((n, idx) => {
    slide.addShape(shape.ellipse, {
      x: n.x - 0.11, y: n.y - 0.11, w: 0.22, h: 0.22,
      fill: { color: n.ci === 1 ? accent : (dark ? "DDE7F3" : C.white) },
      line: { color: n.ci === 1 ? accent : (dark ? "DDE7F3" : C.grid), width: 0.8 },
    });
  });
}

function addDigitGrid(slide, x, y, cell = 0.13, digit = "5") {
  const pat5 = [
    "1111110000",
    "1100000000",
    "1100000000",
    "1111100000",
    "0000110000",
    "0000110000",
    "1100110000",
    "0111100000",
    "0000000000",
    "0000000000",
  ];
  const pat8 = [
    "0011110000",
    "0110011000",
    "0110011000",
    "0011110000",
    "0110011000",
    "0110011000",
    "0110011000",
    "0011110000",
    "0000000000",
    "0000000000",
  ];
  const rows = digit === "8" ? pat8 : pat5;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const on = rows[r][c] === "1";
      slide.addShape(shape.rect, {
        x: x + c * cell, y: y + r * cell, w: cell, h: cell,
        fill: { color: on ? C.ink : "EEF2F6" },
        line: { color: "D9DEE8", width: 0.25 },
      });
    }
  }
}

function addSlideNumberedTitle(slide, n, title, subtitle) {
  addTitle(slide, title, subtitle);
  addFooter(slide, n);
}

let sn = 1;

// 1 Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };
  slide.addShape(shape.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.ink }, line: { color: C.ink } });
  slide.addShape(shape.rect, { x: 0, y: 0, w: W, h: 0.18, fill: { color: C.mint }, line: { color: C.mint } });
  slide.addText("第2天", {
    x: 0.8, y: 0.82, w: 1.4, h: 0.34,
    fontFace: font, fontSize: 15, bold: true, color: C.mint,
    margin: 0,
  });
  slide.addText("CNN神经网络原理", {
    x: 0.78, y: 1.35, w: 8.7, h: 0.9,
    fontFace: font, fontSize: 42, bold: true, color: C.white,
    margin: 0, fit: "shrink",
  });
  slide.addText("从一个神经元，到卷积、池化与完整CNN结构", {
    x: 0.82, y: 2.35, w: 7.2, h: 0.36,
    fontFace: font, fontSize: 16, color: "D8E3F0",
    margin: 0, fit: "shrink",
  });
  card(slide, 0.85, 5.55, 2.55, 0.8, "今日主线", "输入数字化  →  特征提取  →  分类决策", C.amber, "18243B");
  slide.addText("MNIST CNN 4天训练营", {
    x: 0.84, y: 6.74, w: 3.4, h: 0.25,
    fontFace: font, fontSize: 10.5, color: "B8C4D6",
    margin: 0,
  });
  addNeuralMesh(slide, 8.4, 0.8, 4.1, 5.6, C.mint, true);
  addDigitGrid(slide, 9.28, 3.02, 0.105, "5");
  slide.addShape(shape.roundRect, { x: 8.92, y: 2.66, w: 1.75, h: 1.75, rectRadius: 0.08, fill: { color: C.white, transparency: 4 }, line: { color: C.mint, width: 1.2 } });
  sn++;
}

// 2 Goals
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "今日目标", "学完后能解释CNN每一层为什么存在，并能手推一个小卷积例子");
  const items = [
    ["1", "神经元", "理解权重、偏置、激活函数"],
    ["2", "前向与反向", "知道训练一次发生的五个步骤"],
    ["3", "卷积层", "理解局部连接与参数共享"],
    ["4", "池化层", "理解降采样与保留强特征"],
    ["5", "LeNet-5", "看懂经典CNN结构"],
  ];
  items.forEach((it, i) => {
    const x = 0.8 + (i % 5) * 2.45;
    const y = 2.0;
    slide.addShape(shape.roundRect, {
      x, y, w: 2.05, h: 3.05, rectRadius: 0.08,
      fill: { color: C.white },
      line: { color: "E1E5EC", width: 1 },
      shadow: { type: "outer", color: "000000", opacity: 0.05, blur: 1, angle: 45, offset: 1 },
    });
    slide.addShape(shape.ellipse, {
      x: x + 0.55, y: y + 0.36, w: 0.92, h: 0.92,
      fill: { color: [C.mint, C.amber, C.coral, C.violet, C.blue][i] },
      line: { color: [C.mint, C.amber, C.coral, C.violet, C.blue][i] },
    });
    slide.addText(it[0], {
      x: x + 0.55, y: y + 0.55, w: 0.92, h: 0.28,
      fontFace: font, fontSize: 18, bold: true, color: C.white,
      align: "center", margin: 0,
    });
    slide.addText(it[1], {
      x: x + 0.18, y: y + 1.55, w: 1.7, h: 0.3,
      fontFace: font, fontSize: 17, bold: true, color: C.ink,
      align: "center", margin: 0, fit: "shrink",
    });
    slide.addText(it[2], {
      x: x + 0.22, y: y + 2.08, w: 1.58, h: 0.54,
      fontFace: font, fontSize: 10.3, color: C.muted,
      align: "center", valign: "mid", margin: 0.02, fit: "shrink",
    });
  });
}

// 3 Section
sectionSlide("第一部分：神经网络基础", "90分钟", ["图片如何变成数字", "神经元如何给特征打分", "前向传播、损失、反向传播如何连起来"], C.mint);
sn++;

// 4 MNIST task
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "MNIST任务：输入图片，输出类别", "先把任务本身讲清楚，再进入神经元和网络结构");
  addDigitGrid(slide, 0.95, 2.02, 0.19, "5");
  slide.addText("28×28 灰度图片", {
    x: 0.9, y: 4.12, w: 2.0, h: 0.24,
    fontFace: font, fontSize: 12.5, bold: true, color: C.ink,
    align: "center", margin: 0,
  });
  addArrow(slide, 3.2, 2.88, 1.3, "拉直");
  slide.addShape(shape.roundRect, { x: 4.75, y: 2.12, w: 2.2, h: 1.45, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.grid } });
  slide.addText("[784]", { x: 5.22, y: 2.43, w: 1.25, h: 0.38, fontFace: font, fontSize: 27, bold: true, color: C.ink, align: "center", margin: 0 });
  slide.addText("784个像素数字", { x: 5.04, y: 3.07, w: 1.65, h: 0.22, fontFace: font, fontSize: 11.2, color: C.muted, align: "center", margin: 0 });
  addArrow(slide, 7.22, 2.88, 1.55, "网络计算", C.amber);
  slide.addShape(shape.roundRect, { x: 9.05, y: 1.55, w: 3.15, h: 2.55, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.grid } });
  const scores = ["0.2", "0.1", "0.4", "0.3", "0.2", "6.8", "0.1", "0.5", "0.7", "0.2"];
  scores.forEach((s, i) => {
    const x = 9.25 + (i % 5) * 0.52;
    const y = 1.88 + Math.floor(i / 5) * 0.72;
    const hot = i === 5;
    slide.addShape(shape.roundRect, { x, y, w: 0.42, h: 0.42, rectRadius: 0.04, fill: { color: hot ? C.coral : "EEF2F6" }, line: { color: hot ? C.coral : C.grid } });
    slide.addText(String(i), { x, y: y - 0.18, w: 0.42, h: 0.14, fontFace: font, fontSize: 7.5, color: C.muted, align: "center", margin: 0 });
    slide.addText(s, { x: x - 0.02, y: y + 0.12, w: 0.46, h: 0.14, fontFace: font, fontSize: 8.5, bold: hot, color: hot ? C.white : C.ink2, align: "center", margin: 0, fit: "shrink" });
  });
  slide.addText("10个类别分数", { x: 9.43, y: 3.42, w: 1.6, h: 0.2, fontFace: font, fontSize: 11.2, color: C.muted, align: "center", margin: 0 });
  slide.addShape(shape.roundRect, { x: 9.5, y: 4.72, w: 2.05, h: 0.62, rectRadius: 0.06, fill: { color: C.coral }, line: { color: C.coral } });
  slide.addText("预测结果 = 5", { x: 9.5, y: 4.89, w: 2.05, h: 0.2, fontFace: font, fontSize: 15, bold: true, color: C.white, align: "center", margin: 0 });
  card(slide, 0.9, 5.35, 11.3, 0.74, "讲课提示", "输出层通常给出 logits：它们还不是概率，但最大分数对应模型最倾向的类别。", C.mint, C.white);
}

// 5 Neuron
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "一个神经元：可学习的打分器", "神经元把输入特征加权求和，再通过激活函数输出一个值");
  slide.addShape(shape.roundRect, { x: 0.8, y: 1.65, w: 3.15, h: 3.8, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.grid } });
  addMiniMatrix(slide, [["0.9"], ["0.8"], ["0.1"]], 1.25, 2.3, 0.45, { hot: (r) => r < 2, hotFill: C.greenSoft });
  slide.addText("输入 x", { x: 1.08, y: 1.88, w: 0.9, h: 0.22, fontFace: font, fontSize: 12, bold: true, color: C.ink, align: "center", margin: 0 });
  addMiniMatrix(slide, [["1.2"], ["1.0"], ["-0.5"]], 2.45, 2.3, 0.45, { hot: (r) => r < 2, hotFill: C.amberSoft });
  slide.addText("权重 w", { x: 2.25, y: 1.88, w: 1.0, h: 0.22, fontFace: font, fontSize: 12, bold: true, color: C.ink, align: "center", margin: 0 });
  slide.addText("偏置 b = -1.0", { x: 1.22, y: 4.0, w: 2.3, h: 0.25, fontFace: font, fontSize: 13, bold: true, color: C.coral, align: "center", margin: 0 });
  slide.addText("输入越重要，权重越大；权重也可以是负数。", { x: 1.05, y: 4.55, w: 2.7, h: 0.36, fontFace: font, fontSize: 10.4, color: C.muted, align: "center", margin: 0, fit: "shrink" });
  addArrow(slide, 4.25, 3.04, 1.3, "加权求和", C.mint);
  slide.addText("0.9×1.2 + 0.8×1.0 + 0.1×(-0.5) - 1.0 = 0.83", {
    x: 5.9, y: 2.28, w: 6.05, h: 0.38,
    fontFace: font, fontSize: 17.5, bold: true, color: C.ink,
    margin: 0, fit: "shrink",
  });
  slide.addShape(shape.line, { x: 6.0, y: 3.15, w: 2.1, h: 0, line: { color: C.grid, width: 1 } });
  slide.addText("ReLU(0.83) = 0.83", { x: 6.0, y: 3.45, w: 3.0, h: 0.35, fontFace: font, fontSize: 19, bold: true, color: C.mint, margin: 0 });
  card(slide, 6.0, 4.35, 5.35, 0.92, "结论", "输出值越大，说明这个神经元越认可当前输入中存在它关心的特征。", C.mint, C.white);
}

// 6 Network layers
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "一层网络：多个神经元一起工作", "隐藏层把原始像素组合成更有用的中间特征");
  const xs = [1.0, 4.35, 8.05];
  const labels = [["输入层", "784个像素", C.blue], ["隐藏层", "128种中间特征", C.mint], ["输出层", "10个数字分数", C.coral]];
  labels.forEach((l, i) => {
    slide.addShape(shape.roundRect, { x: xs[i], y: 1.65, w: 2.25, h: 3.9, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.grid } });
    slide.addText(l[0], { x: xs[i] + 0.22, y: 1.92, w: 1.8, h: 0.3, fontFace: font, fontSize: 17, bold: true, color: C.ink, align: "center", margin: 0 });
    slide.addShape(shape.ellipse, { x: xs[i] + 0.72, y: 2.55, w: 0.8, h: 0.8, fill: { color: l[2] }, line: { color: l[2] } });
    slide.addText(i === 0 ? "x" : i === 1 ? "h" : "y", { x: xs[i] + 0.72, y: 2.75, w: 0.8, h: 0.18, fontFace: font, fontSize: 20, bold: true, color: C.white, align: "center", margin: 0 });
    slide.addText(l[1], { x: xs[i] + 0.25, y: 3.65, w: 1.75, h: 0.34, fontFace: font, fontSize: 12, color: C.muted, align: "center", margin: 0, fit: "shrink" });
    slide.addText(i === 0 ? "[784]" : i === 1 ? "[128]" : "[10]", { x: xs[i] + 0.35, y: 4.35, w: 1.55, h: 0.36, fontFace: font, fontSize: 19, bold: true, color: l[2], align: "center", margin: 0 });
  });
  addArrow(slide, 3.35, 3.2, 0.75, "Linear", C.mint);
  addArrow(slide, 6.75, 3.2, 0.85, "Linear", C.amber);
  addCode(slide, "输入 [784]\n  ↓ Linear(784, 128)\n  ↓ ReLU\n  ↓ Linear(128, 10)\n输出 [10]", 10.5, 1.76, 1.95, 3.55, 10.8);
}

// 7 Forward
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "前向传播：从图片算出预测结果", "前向传播只负责算答案，还没有修改参数");
  const steps = [
    ["图片", "image.view(784)", C.blue],
    ["隐藏特征", "relu(x @ W1 + b1)", C.mint],
    ["类别分数", "h @ W2 + b2", C.amber],
    ["预测", "argmax(logits)", C.coral],
  ];
  steps.forEach((s, i) => {
    const x = 0.9 + i * 3.05;
    slide.addShape(shape.roundRect, { x, y: 2.0, w: 2.3, h: 1.85, rectRadius: 0.07, fill: { color: C.white }, line: { color: C.grid } });
    slide.addShape(shape.ellipse, { x: x + 0.73, y: 2.24, w: 0.85, h: 0.85, fill: { color: s[2] }, line: { color: s[2] } });
    slide.addText(String(i + 1), { x: x + 0.73, y: 2.45, w: 0.85, h: 0.18, fontFace: font, fontSize: 18, bold: true, color: C.white, align: "center", margin: 0 });
    slide.addText(s[0], { x: x + 0.2, y: 3.25, w: 1.9, h: 0.25, fontFace: font, fontSize: 16, bold: true, color: C.ink, align: "center", margin: 0 });
    slide.addText(s[1], { x: x + 0.18, y: 3.58, w: 1.95, h: 0.18, fontFace: "Menlo", fontSize: 8.7, color: C.muted, align: "center", margin: 0, fit: "shrink" });
    if (i < steps.length - 1) addArrow(slide, x + 2.43, 2.66, 0.47, "", [C.mint, C.amber, C.coral][i]);
  });
  addCode(slide, "x = image.view(784)\nh = relu(x @ W1 + b1)\nlogits = h @ W2 + b2\npred = argmax(logits)", 1.35, 4.8, 10.55, 1.15, 14);
}

// 8 Loss
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "损失函数：告诉模型错得有多严重", "训练目标不是直接追求“看起来对”，而是让loss越来越小");
  card(slide, 0.85, 1.65, 5.35, 1.45, "情况A：模型不确定或给错分", "真实标签是5，但数字5分数很低\n→ loss大，模型需要明显调整", C.coral, C.white);
  card(slide, 0.85, 3.58, 5.35, 1.45, "情况B：模型给正确类高分", "真实标签是5，数字5分数最高\n→ loss小，模型已经接近正确", C.mint, C.white);
  slide.addShape(shape.roundRect, { x: 7.05, y: 1.67, w: 4.75, h: 3.35, rectRadius: 0.08, fill: { color: "111827" }, line: { color: "111827" } });
  slide.addText("outputs = model(images)\nloss = criterion(outputs, labels)", {
    x: 7.35, y: 2.35, w: 4.1, h: 0.78,
    fontFace: "Menlo", fontSize: 16, color: "ECFDF5",
    margin: 0, fit: "shrink",
  });
  slide.addShape(shape.line, { x: 7.35, y: 3.53, w: 4.0, h: 0, line: { color: "334155", width: 1 } });
  slide.addText("交叉熵损失", { x: 7.35, y: 3.88, w: 4.0, h: 0.3, fontFace: font, fontSize: 18, bold: true, color: C.amber, align: "center", margin: 0 });
}

// 9 Backprop
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "反向传播：计算参数应该怎么改", "反向传播不是把图片倒着输入，而是计算每个参数的梯度");
  const y = 2.0;
  const blocks = [
    ["前向传播", "图片 → 隐藏层 → 输出分数 → loss", C.mint],
    ["反向传播", "loss → 计算每一层参数的梯度", C.amber],
    ["参数更新", "用梯度调整权重和偏置", C.coral],
  ];
  blocks.forEach((b, i) => {
    card(slide, 0.95 + i * 4.05, y, 3.35, 1.25, b[0], b[1], b[2], C.white);
  });
  slide.addText("w_new = w_old - α × ∂L/∂w", {
    x: 1.55, y: 4.28, w: 10.1, h: 0.62,
    fontFace: "Cambria Math", fontSize: 30, bold: true, color: C.ink,
    align: "center", margin: 0, fit: "shrink",
  });
  bulletText(slide, [
    "梯度告诉我们：哪个方向会让loss上升最快",
    "更新时减去梯度，往loss下降的方向走",
    "学习率α控制每次参数改动的大小",
  ], 2.1, 5.45, 9.2, 0.8, 13.5);
}

// 10 Training step
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "一次训练到底发生了什么", "第3天写训练循环时，这五行代码会反复出现");
  addCode(slide, "outputs = model(images)          # 1. 前向传播：算预测\nloss = criterion(outputs, labels) # 2. 计算损失：看错多少\n\noptimizer.zero_grad()            # 3. 清空旧梯度\nloss.backward()                  # 4. 反向传播：计算新梯度\noptimizer.step()                 # 5. 更新参数", 0.9, 1.65, 7.1, 4.4, 13);
  const steps = [
    ["1", "算预测", C.blue],
    ["2", "看错多少", C.amber],
    ["3", "清梯度", C.violet],
    ["4", "算新梯度", C.coral],
    ["5", "更新参数", C.mint],
  ];
  steps.forEach((s, i) => {
    const y = 1.82 + i * 0.78;
    slide.addShape(shape.ellipse, { x: 8.7, y, w: 0.42, h: 0.42, fill: { color: s[2] }, line: { color: s[2] } });
    slide.addText(s[0], { x: 8.7, y: y + 0.11, w: 0.42, h: 0.12, fontFace: font, fontSize: 10, bold: true, color: C.white, align: "center", margin: 0 });
    slide.addText(s[1], { x: 9.35, y: y + 0.08, w: 2.35, h: 0.18, fontFace: font, fontSize: 14.5, bold: true, color: C.ink, margin: 0 });
    if (i < steps.length - 1) slide.addShape(shape.line, { x: 8.91, y: y + 0.45, w: 0, h: 0.28, line: { color: C.grid, width: 1.2 } });
  });
}

// 11 Misunderstandings
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "初学者常见误区", "把容易混淆的概念一次讲清楚");
  const pairs = [
    ["权重是老师手动设置的", "权重随机初始化，然后从数据中学出来"],
    ["输出层直接输出一个数字", "输出10个分数，再选最大分数对应的类别"],
    ["反向传播就是把数据倒着跑", "反向传播是在计算每个参数的梯度"],
    ["层数越多一定越好", "层数多也更难训练，更容易过拟合"],
    ["没有激活函数也可以堆很多层", "没有非线性，多层线性变换仍等价于一层"],
  ];
  pairs.forEach((p, i) => {
    const y = 1.48 + i * 0.95;
    slide.addShape(shape.roundRect, { x: 0.82, y, w: 5.2, h: 0.62, rectRadius: 0.06, fill: { color: C.coralSoft }, line: { color: "FFD1CC" } });
    slide.addShape(shape.roundRect, { x: 7.05, y, w: 5.3, h: 0.62, rectRadius: 0.06, fill: { color: C.greenSoft }, line: { color: "BDEDD7" } });
    slide.addText(p[0], { x: 1.05, y: y + 0.17, w: 4.75, h: 0.16, fontFace: font, fontSize: 12.2, bold: true, color: C.ink, margin: 0, fit: "shrink" });
    slide.addText(p[1], { x: 7.28, y: y + 0.17, w: 4.85, h: 0.16, fontFace: font, fontSize: 12.2, bold: true, color: C.ink, margin: 0, fit: "shrink" });
    if (i === 0) {
      slide.addText("误区", { x: 0.86, y: 1.05, w: 0.8, h: 0.18, fontFace: font, fontSize: 11, color: C.coral, bold: true, margin: 0 });
      slide.addText("正确理解", { x: 7.08, y: 1.05, w: 1.2, h: 0.18, fontFace: font, fontSize: 11, color: C.mint, bold: true, margin: 0 });
    }
  });
}

// 12 Section CNN
sectionSlide("第二部分：卷积神经网络核心", "90分钟", ["为什么普通全连接网络不适合图像", "卷积层如何检测局部特征", "池化层和激活函数各自解决什么问题"], C.amber);
sn++;

// 13 Why CNN
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "为什么需要CNN？", "全连接网络能工作，但对图像结构不友好");
  card(slide, 0.82, 1.55, 3.65, 1.28, "丢失空间结构", "图片拉直后，网络不知道哪些像素原本相邻。", C.coral, C.white);
  card(slide, 0.82, 3.1, 3.65, 1.28, "参数太多", "第一层1000个神经元就有784000个权重。", C.coral, C.white);
  card(slide, 0.82, 4.65, 3.65, 1.28, "位置变化不稳", "同一条竖线换个位置，会变成不同像素模式。", C.coral, C.white);
  slide.addShape(shape.roundRect, { x: 5.32, y: 1.55, w: 6.9, h: 4.38, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid } });
  slide.addText("CNN的三个关键想法", { x: 5.72, y: 1.95, w: 3.5, h: 0.3, fontFace: font, fontSize: 18, bold: true, color: C.ink, margin: 0 });
  const ideas = [
    ["局部连接", "每个卷积核只看一小块区域，例如3×3像素", C.mint],
    ["参数共享", "同一套权重扫过整张图", C.amber],
    ["保留二维结构", "输入按高度和宽度处理，不先粗暴拉直", C.blue],
  ];
  ideas.forEach((it, i) => {
    const y = 2.67 + i * 0.86;
    slide.addShape(shape.ellipse, { x: 5.82, y, w: 0.38, h: 0.38, fill: { color: it[2] }, line: { color: it[2] } });
    slide.addText(it[0], { x: 6.38, y: y - 0.02, w: 1.2, h: 0.18, fontFace: font, fontSize: 13, bold: true, color: C.ink, margin: 0 });
    slide.addText(it[1], { x: 7.62, y: y - 0.01, w: 3.85, h: 0.18, fontFace: font, fontSize: 11.2, color: C.muted, margin: 0, fit: "shrink" });
  });
  addDigitGrid(slide, 10.35, 4.5, 0.105, "5");
}

// 14 Convolution kernel
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "卷积核：一个小的特征检测器", "卷积核会在整张图上滑动，寻找它关心的局部模式");
  slide.addText("图像局部", { x: 1.15, y: 1.65, w: 1.3, h: 0.24, fontFace: font, fontSize: 14, bold: true, color: C.ink, margin: 0 });
  const img = [
    [0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1],
  ];
  addMiniMatrix(slide, img, 1.12, 2.04, 0.55, { hot: (r, c, v) => v === 1, hotFill: C.ink, hotColor: C.white, fontSize: 13 });
  slide.addText("检测竖线的卷积核", { x: 5.0, y: 1.65, w: 2.2, h: 0.24, fontFace: font, fontSize: 14, bold: true, color: C.ink, margin: 0 });
  addMiniMatrix(slide, [[1, 0, -1], [1, 0, -1], [1, 0, -1]], 5.22, 2.16, 0.62, { hot: (r, c) => c === 0, hotFill: C.greenSoft, fontSize: 15 });
  addArrow(slide, 8.05, 2.8, 1.25, "滑动匹配", C.amber);
  card(slide, 9.75, 1.95, 2.5, 2.55, "得到特征图", "某个位置越像卷积核要找的特征，输出值通常越大。", C.mint, C.white);
  slide.addShape(shape.roundRect, { x: 10.42, y: 4.8, w: 1.25, h: 0.45, rectRadius: 0.04, fill: { color: C.mint }, line: { color: C.mint } });
  slide.addText("feature map", { x: 10.42, y: 4.93, w: 1.25, h: 0.12, fontFace: "Menlo", fontSize: 7.8, bold: true, color: C.white, align: "center", margin: 0 });
}

// 15 Convolution calculation
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "卷积计算：对应位置相乘再求和", "小矩阵例子适合在黑板上手推");
  slide.addText("图像片段", { x: 1.05, y: 1.7, w: 1.2, h: 0.22, fontFace: font, fontSize: 14, bold: true, color: C.ink, margin: 0 });
  addMiniMatrix(slide, [[1, 2], [3, 4]], 1.15, 2.22, 0.75, { hot: () => true, hotFill: C.blueSoft, fontSize: 17 });
  slide.addText("卷积核", { x: 4.05, y: 1.7, w: 1.0, h: 0.22, fontFace: font, fontSize: 14, bold: true, color: C.ink, margin: 0 });
  addMiniMatrix(slide, [[1, 0], [0, 1]], 4.08, 2.22, 0.75, { hot: (r, c, v) => v === 1, hotFill: C.greenSoft, fontSize: 17 });
  addArrow(slide, 6.58, 2.7, 1.1, "计算", C.mint);
  slide.addShape(shape.roundRect, { x: 8.2, y: 2.0, w: 3.75, h: 1.85, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.grid } });
  slide.addText("(1×1 + 2×0) + (3×0 + 4×1)", { x: 8.42, y: 2.44, w: 3.3, h: 0.25, fontFace: font, fontSize: 14, bold: true, color: C.ink, align: "center", margin: 0, fit: "shrink" });
  slide.addText("= 5", { x: 8.95, y: 3.08, w: 2.1, h: 0.38, fontFace: font, fontSize: 24, bold: true, color: C.coral, align: "center", margin: 0 });
  card(slide, 1.05, 5.15, 10.9, 0.68, "记忆方式", "卷积不是把整张图一次性塞进去，而是用小窗口逐块扫描，每个位置得到一个输出值。", C.amber, C.white);
}

// 16 Conv params
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "卷积层的三个关键参数", "kernel_size、stride、padding共同决定特征图的尺寸和边界处理方式");
  const params = [
    ["kernel_size", "卷积核大小", "3×3、5×5常见", C.mint],
    ["stride", "每次移动步长", "步长越大，输出越小", C.amber],
    ["padding", "边缘填充", "保持边缘信息或控制输出尺寸", C.coral],
  ];
  params.forEach((p, i) => {
    const x = 0.9 + i * 4.1;
    slide.addShape(shape.roundRect, { x, y: 1.78, w: 3.25, h: 3.55, rectRadius: 0.07, fill: { color: C.white }, line: { color: C.grid } });
    slide.addShape(shape.rect, { x, y: 1.78, w: 3.25, h: 0.24, fill: { color: p[3] }, line: { color: p[3] } });
    slide.addText(p[0], { x: x + 0.22, y: 2.28, w: 2.8, h: 0.3, fontFace: "Menlo", fontSize: 17, bold: true, color: p[3], align: "center", margin: 0, fit: "shrink" });
    slide.addText(p[1], { x: x + 0.35, y: 3.18, w: 2.55, h: 0.27, fontFace: font, fontSize: 16, bold: true, color: C.ink, align: "center", margin: 0 });
    slide.addText(p[2], { x: x + 0.42, y: 3.78, w: 2.42, h: 0.52, fontFace: font, fontSize: 11.5, color: C.muted, align: "center", valign: "mid", margin: 0.02, fit: "shrink" });
  });
  addCode(slide, "输出尺寸 = (输入尺寸 - kernel_size + 2×padding) / stride + 1", 1.25, 5.88, 10.85, 0.58, 13.5);
}

// 17 Pooling
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "池化层：压缩特征图，保留重要信息", "最大池化没有可训练参数，只做固定的下采样");
  const mat = [[1, 3, 2, 4], [5, 6, 7, 8], [2, 8, 9, 1], [3, 4, 5, 6]];
  addMiniMatrix(slide, mat, 1.05, 2.0, 0.57, {
    hot: (r, c) => (r === 1 && c === 1) || (r === 1 && c === 3) || (r === 2 && c === 2),
    hotFill: C.greenSoft,
    fontSize: 14,
  });
  slide.addText("输入特征图 4×4", { x: 1.0, y: 4.55, w: 2.3, h: 0.22, fontFace: font, fontSize: 12.5, bold: true, color: C.ink, align: "center", margin: 0 });
  addArrow(slide, 4.25, 2.76, 1.25, "2×2 max", C.mint);
  addMiniMatrix(slide, [[6, 8], [8, 9]], 6.0, 2.32, 0.8, { hot: () => true, hotFill: C.mint, hotColor: C.white, fontSize: 17 });
  slide.addText("输出 2×2", { x: 5.85, y: 4.25, w: 1.9, h: 0.22, fontFace: font, fontSize: 12.5, bold: true, color: C.ink, align: "center", margin: 0 });
  bulletText(slide, [
    "减少特征图尺寸，降低后续计算量",
    "保留局部区域最强响应",
    "特征小范围移动时，结果仍然相似",
    "没有权重和偏置",
  ], 9.0, 1.9, 2.9, 2.4, 12.3);
}

// 18 Activation
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "激活函数：给网络引入非线性", "没有激活函数，多层线性变换仍然等价于一层线性变换");
  slide.addShape(shape.roundRect, { x: 0.9, y: 1.55, w: 5.1, h: 4.55, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.grid } });
  slide.addText("ReLU: f(x)=max(0,x)", { x: 1.35, y: 1.95, w: 3.6, h: 0.34, fontFace: font, fontSize: 18, bold: true, color: C.ink, margin: 0 });
  slide.addShape(shape.line, { x: 1.45, y: 4.75, w: 3.65, h: 0, line: { color: C.grid, width: 1.2 } });
  slide.addShape(shape.line, { x: 3.0, y: 2.65, w: 0, h: 2.45, line: { color: C.grid, width: 1.2 } });
  slide.addShape(shape.line, { x: 1.55, y: 4.75, w: 1.45, h: 0, line: { color: C.coral, width: 2.8 } });
  slide.addShape(shape.line, { x: 3.0, y: 4.75, w: 1.75, h: -1.75, line: { color: C.mint, width: 2.8 } });
  slide.addText("负数变0，正数保持不变", { x: 1.55, y: 5.42, w: 3.65, h: 0.25, fontFace: font, fontSize: 13.5, color: C.muted, align: "center", margin: 0 });
  card(slide, 7.0, 1.82, 4.75, 1.05, "为什么需要非线性？", "激活函数让网络能表达更复杂的边界，而不是只能做线性分类。", C.mint, C.white);
  card(slide, 7.0, 3.18, 4.75, 1.05, "Sigmoid的问题", "输出范围是[0,1]，但深层网络中容易出现梯度消失。", C.amber, C.white);
  card(slide, 7.0, 4.54, 4.75, 1.05, "课堂重点", "MNIST CNN中优先记住ReLU，它简单、稳定、常用。", C.coral, C.white);
}

// 19 LeNet
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "经典网络架构：LeNet-5", "LeNet-5是早期用于手写数字识别的代表性CNN");
  const boxes = [
    ["输入", "32×32", C.blue],
    ["卷积", "6个5×5", C.mint],
    ["池化", "2×2", C.amber],
    ["卷积", "16个5×5", C.mint],
    ["池化", "2×2", C.amber],
    ["全连接", "120 → 84", C.violet],
    ["输出", "10类别", C.coral],
  ];
  boxes.forEach((b, i) => {
    const x = 0.55 + i * 1.82;
    slide.addShape(shape.roundRect, { x, y: 2.15, w: 1.38, h: 1.15, rectRadius: 0.06, fill: { color: b[2] }, line: { color: b[2] } });
    slide.addText(b[0], { x: x + 0.1, y: 2.43, w: 1.18, h: 0.2, fontFace: font, fontSize: 13, bold: true, color: C.white, align: "center", margin: 0, fit: "shrink" });
    slide.addText(b[1], { x: x + 0.1, y: 2.78, w: 1.18, h: 0.16, fontFace: font, fontSize: 8.8, color: C.white, align: "center", margin: 0, fit: "shrink" });
    if (i < boxes.length - 1) addArrow(slide, x + 1.45, 2.47, 0.28, "", C.grid);
  });
  slide.addShape(shape.roundRect, { x: 1.1, y: 4.45, w: 11.1, h: 0.72, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.grid } });
  slide.addText("理解顺序：先用卷积和池化提取图像特征，再用全连接层做最终分类。", { x: 1.4, y: 4.68, w: 10.5, h: 0.18, fontFace: font, fontSize: 14.2, bold: true, color: C.ink, align: "center", margin: 0, fit: "shrink" });
}

// 20 Practice convolution
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "手推小例子：3×3输入与2×2卷积核", "课堂上建议让学生先自己算，再逐步展示答案");
  addMiniMatrix(slide, [[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1.0, 1.8, 0.58, { hot: () => false, fontSize: 14 });
  slide.addText("输入图像", { x: 0.88, y: 3.75, w: 1.95, h: 0.2, fontFace: font, fontSize: 12.5, bold: true, color: C.ink, align: "center", margin: 0 });
  addMiniMatrix(slide, [[1, 0], [0, 1]], 4.08, 2.05, 0.68, { hot: (r, c, v) => v === 1, hotFill: C.greenSoft, fontSize: 15 });
  slide.addText("卷积核", { x: 3.92, y: 3.62, w: 1.6, h: 0.2, fontFace: font, fontSize: 12.5, bold: true, color: C.ink, align: "center", margin: 0 });
  addArrow(slide, 6.2, 2.58, 1.15, "stride=1", C.mint);
  addMiniMatrix(slide, [[6, 8], [12, 14]], 8.0, 2.05, 0.78, { hot: () => true, hotFill: C.mint, hotColor: C.white, fontSize: 16 });
  slide.addText("输出特征图", { x: 7.72, y: 3.88, w: 2.1, h: 0.2, fontFace: font, fontSize: 12.5, bold: true, color: C.ink, align: "center", margin: 0 });
  addCode(slide, "左上: 1×1 + 2×0 + 4×0 + 5×1 = 6\n右上: 2×1 + 3×0 + 5×0 + 6×1 = 8\n左下: 4×1 + 5×0 + 7×0 + 8×1 = 12\n右下: 5×1 + 6×0 + 8×0 + 9×1 = 14", 1.0, 5.1, 10.95, 1.1, 11.5);
}

// 21 Practice pooling
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "手推小例子：最大池化", "每个2×2区域取最大值，stride=2时输出尺寸减半");
  addMiniMatrix(slide, [[1, 3, 2, 4], [5, 6, 7, 8], [2, 8, 9, 1], [3, 4, 5, 6]], 1.12, 1.85, 0.54, { fontSize: 13.5 });
  addArrow(slide, 4.55, 2.75, 1.25, "取最大", C.amber);
  addMiniMatrix(slide, [[6, 8], [8, 9]], 6.42, 2.25, 0.72, { hot: () => true, hotFill: C.amber, hotColor: C.white, fontSize: 16 });
  const lines = [
    "左上 max(1,3,5,6)=6",
    "右上 max(2,4,7,8)=8",
    "左下 max(2,8,3,4)=8",
    "右下 max(9,1,5,6)=9",
  ];
  bulletText(slide, lines, 9.05, 1.9, 3.0, 2.2, 12.5);
  card(slide, 1.15, 5.34, 10.85, 0.75, "课堂提示", "池化只改变每个特征图的高度和宽度，不改变通道数；它本身没有可训练参数。", C.amber, C.white);
}

// 22 Quiz
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  addSlideNumberedTitle(slide, sn++, "概念测验", "用5个问题检查学生是否真正理解了每一层的作用");
  const qs = [
    "卷积层的主要作用是什么？",
    "池化层为什么能减少计算量？",
    "ReLU对负数和正数分别做什么？",
    "CNN为什么比全连接网络更适合图像？",
    "28×28输入经过3×3卷积，padding=0、stride=1，输出尺寸是多少？",
  ];
  qs.forEach((q, i) => {
    const y = 1.45 + i * 0.88;
    slide.addShape(shape.roundRect, { x: 0.9, y, w: 11.35, h: 0.56, rectRadius: 0.05, fill: { color: i % 2 === 0 ? C.white : "F0F3F8" }, line: { color: "E4E7EC" } });
    slide.addShape(shape.ellipse, { x: 1.15, y: y + 0.12, w: 0.32, h: 0.32, fill: { color: [C.mint, C.amber, C.coral, C.violet, C.blue][i] }, line: { color: [C.mint, C.amber, C.coral, C.violet, C.blue][i] } });
    slide.addText(String(i + 1), { x: 1.15, y: y + 0.205, w: 0.32, h: 0.08, fontFace: font, fontSize: 8.5, bold: true, color: C.white, align: "center", margin: 0 });
    slide.addText(q, { x: 1.75, y: y + 0.17, w: 9.8, h: 0.16, fontFace: font, fontSize: 12.6, bold: true, color: C.ink, margin: 0, fit: "shrink" });
  });
}

// 23 Checkpoints
{
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };
  slide.addShape(shape.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.ink }, line: { color: C.ink } });
  slide.addText("第2天检查点", {
    x: 0.82, y: 0.9, w: 5.2, h: 0.58,
    fontFace: font, fontSize: 34, bold: true, color: C.white,
    margin: 0, fit: "shrink",
  });
  const checks = [
    "能解释神经元的工作原理",
    "能说清前向传播和反向传播",
    "能手推简单卷积计算",
    "能解释卷积层、池化层、激活函数的作用",
    "能画出一个简单CNN结构",
  ];
  checks.forEach((c, i) => {
    const y = 2.05 + i * 0.75;
    slide.addShape(shape.ellipse, { x: 1.0, y, w: 0.34, h: 0.34, fill: { color: C.mint }, line: { color: C.mint } });
    slide.addText(String(i + 1), { x: 1.0, y: y + 0.09, w: 0.34, h: 0.1, fontFace: font, fontSize: 8.5, bold: true, color: C.ink, align: "center", margin: 0 });
    slide.addText(c, { x: 1.58, y: y + 0.04, w: 5.4, h: 0.2, fontFace: font, fontSize: 15.5, color: "E7ECF3", margin: 0, fit: "shrink" });
  });
  slide.addShape(shape.roundRect, { x: 7.8, y: 1.35, w: 3.75, h: 3.75, rectRadius: 0.1, fill: { color: C.white, transparency: 5 }, line: { color: C.mint, width: 1.4 } });
  addDigitGrid(slide, 8.82, 2.05, 0.17, "8");
  slide.addText("明天：动手搭建CNN模型", {
    x: 7.55, y: 5.75, w: 4.45, h: 0.38,
    fontFace: font, fontSize: 18, bold: true, color: C.amber,
    align: "center", margin: 0, fit: "shrink",
  });
  slide.addText("PyTorch Tensor  ·  DataLoader  ·  训练循环  ·  >95%准确率", {
    x: 7.25, y: 6.23, w: 5.05, h: 0.24,
    fontFace: font, fontSize: 11.2, color: "B8C4D6",
    align: "center", margin: 0, fit: "shrink",
  });
}

pptx.writeFile({ fileName: "/Users/sun/Desktop/mnist/mnist-cnn-course/day02-cnn-theory/day02_cnn_theory.pptx" });
