# 手写数字识别CNN 4天训练营

> 面向零基础本科生的深度学习入门项目

## 📚 课程概览

| 天数 | 主题 | 主要收获 |
|:---:|------|----------|
| 1 | Python基础 + MNIST数据探索 | 环境搭建，理解手写数字数据集 |
| 2 | CNN神经网络原理 | 理解卷积、池化、激活函数 |
| 3 | 动手搭建CNN模型 | 完成第一个>95%准确率的模型 |
| 4 | 模型优化与展示 | 改进模型，可视化成果 |

## 🛠️ 环境准备

在开始第1天课程前，请运行：

```bash
bash setup.sh
```

或者手动安装：

```bash
conda create -n mnist python=3.10 -y
conda activate mnist
pip install -r requirements.txt
```

## 📁 项目结构

```
mnist-cnn-course/
├── day01-python-basics/   # 第1天：Python基础与数据探索
├── day02-cnn-theory/       # 第2天：CNN理论讲解
├── day03-build-cnn/        # 第3天：模型搭建
├── day04-optimize/         # 第4天：优化与展示
├── docs/                   # 教学资料
├── templates/              # 代码模板
├── setup.sh                # 一键安装脚本
└── requirements.txt        # 依赖列表
```

## 🎯 每日目标

### 第1天：完成以下任务
- [ ] 成功运行Jupyter Notebook
- [ ] 加载并显示MNIST数据集中的图片
- [ ] 理解什么是训练集和测试集
- [ ] 完成 `day01_exercises.ipynb` 中的练习

### 第2天：完成以下任务
- [ ] 理解神经元的工作原理
- [ ] 能够解释卷积层的作用
- [ ] 能够解释池化层的作用
- [ ] 完成 `day02_quiz.md` 中的测验

### 第3天：完成以下任务
- [ ] 搭建第一个CNN模型
- [ ] 训练模型并观察loss下降
- [ ] 在测试集上达到>95%准确率
- [ ] 保存训练好的模型

### 第4天：完成以下任务
- [ ] 尝试至少一种优化方法
- [ ] 可视化训练过程
- [ ] 准备5分钟项目展示
- [ ] 完成最终代码提交

## 📖 学习资源

- [PyTorch 官方教程](https://pytorch.org/tutorials/)
- [CS231n: CNN for Visual Recognition](http://cs231n.stanford.edu/)
- [3Blue1Brown 神经网络视频](https://www.bilibili.com/video/BV1bx411T7eQ)

## 🏆 项目展示标准

优秀项目应包含：
1. 完整可运行的代码
2. 清晰的代码注释
3. 训练曲线可视化
4. 错误样本分析
5. 模型改进思路

---

**祝学习愉快！有问题随时向助教提问。** 🚀
