# 快速开始指南

## 🚀 5分钟快速上手

### 第一步：安装环境

```bash
# 进入项目目录
cd mnist-cnn-course

# 运行安装脚本
bash setup.sh
```

或者手动安装：

```bash
conda create -n mnist python=3.10 -y
conda activate mnist
pip install -r requirements.txt
```

### 第二步：启动Jupyter

```bash
jupyter notebook
```

浏览器会自动打开，看到文件管理界面。

### 第三步：开始学习

1. 点击 `day01-python-basics/day01_exercises.ipynb`
2. 按顺序运行每个代码块
3. 完成 exercises 中的练习

---

## 📂 项目文件说明

```
mnist-cnn-course/
├── day01-python-basics/
│   ├── lecture.md              # 第1天讲义
│   └── day01_exercises.ipynb   # 第1天练习
├── day02-cnn-theory/
│   ├── lecture.md              # 第2天讲义
│   └── day02_quiz.md           # 第2天测验
├── day03-build-cnn/
│   ├── lecture.md              # 第3天讲义
│   └── day03_cnn.ipynb         # 第3天练习
├── day04-optimize/
│   ├── lecture.md              # 第4天讲义
│   └── day04_optimize.ipynb    # 第4天练习
├── templates/
│   └── cnn_template.py         # 完整代码模板
└── README.md                   # 项目说明
```

---

## 🎯 每日学习路线

### 第1天：Python基础与MNIST探索
1. 阅读 `day01/lecture.md`
2. 运行 `day01/day01_exercises.ipynb`
3. 完成所有练习

### 第2天：CNN理论
1. 阅读 `day02/lecture.md`
2. 完成 `day02/day02_quiz.md` 测验
3. 理解卷积和池化计算

### 第3天：搭建CNN
1. 阅读 `day03/lecture.md`
2. 运行 `day03/day03_cnn.ipynb`
3. 训练出>95%准确率的模型

### 第4天：优化与展示
1. 阅读 `day04/lecture.md`
2. 运行 `day04/day04_optimize.ipynb`
3. 准备项目展示

---

## 💻 常用命令

### Jupyter Notebook

```bash
# 启动
jupyter notebook

# 指定端口
jupyter notebook --port 8889

# 不自动打开浏览器
jupyter notebook --no-browser
```

### Python脚本

```bash
# 运行模板代码
python templates/cnn_template.py

# 或使用
python -m templates.cnn_template
```

### Conda环境

```bash
# 激活环境
conda activate mnist

# 退出环境
conda deactivate

# 查看已安装包
conda list
```

---

## ❓ 常见问题

### Q1: Jupyter打不开？

检查端口是否被占用：
```bash
jupyter notebook --port 8889
```

### Q2: 导入错误？

确保激活了正确的环境：
```bash
conda activate mnist
pip install -r requirements.txt
```

### Q3: 数据下载慢？

可以使用国内镜像：
```python
# 在代码中添加
import torch
torch.backends.cudnn.deterministic = True
# 数据会自动缓存，只需下载一次
```

### Q4: GPU加速？

如果有NVIDIA GPU：
```python
import torch
print(torch.cuda.is_available())  # 应该返回 True

# 代码会自动使用GPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
```

---

## 📞 获取帮助

- 查看 `lecture.md` 中的详细说明
- 向助教提问
- Google/百度搜索错误信息

---

**祝学习愉快！** 🎓
