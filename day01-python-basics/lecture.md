# 第1天：Python基础与MNIST数据探索

## 📋 今日目标

1. ✅ 完成开发环境搭建
2. ✅ 掌握Python基础语法
3. ✅ 理解MNIST数据集
4. ✅ 学会使用NumPy处理数组
5. ✅ 完成数据可视化练习

---

## 第一部分：环境搭建 (45分钟)

### 1.1 什么是开发环境？

开发环境就像我们的工作台，需要准备好工具才能开始工作。

对于深度学习项目，我们需要：
- **Python**：编程语言
- **Jupyter Notebook**：交互式代码编辑器
- **PyTorch**：深度学习框架
- **NumPy/Matplotlib**：数据处理和可视化工具

### 1.2 创建虚拟环境

虚拟环境就像给每个项目独立的工具箱，互不干扰。

```bash
# 创建名为 mnist 的环境
conda create -n mnist python=3.10

# 激活环境
conda activate mnist

# 安装需要的包
pip install torch torchvision matplotlib jupyter notebook
```

### 1.3 启动Jupyter Notebook

```bash
jupyter notebook
```

启动后会自动打开浏览器，看到文件管理界面。

---

## 第二部分：Python快速入门 (90分钟)

### 2.1 变量和数据类型

**变量**就像给数据起的名字：

```python
# 数字
x = 5
learning_rate = 0.001

# 字符串
name = "MNIST数据集"

# 列表 - 存放多个数据
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### 2.2 列表操作

```python
# 创建列表
digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# 获取元素 - 注意从0开始数
print(digits[0])  # 输出: 0
print(digits[5])  # 输出: 5

# 切片 - 获取一部分
print(digits[0:5])  # 输出: [0, 1, 2, 3, 4]

# 获取长度
print(len(digits))  # 输出: 10
```

### 2.3 循环 - 重复做某件事

```python
# for 循环 - 遍历列表
for digit in digits:
    print(f"数字是: {digit}")

# 使用 range 生成数字序列
for i in range(10):
    print(f"第 {i} 次循环")
```

### 2.4 函数 - 打包代码

```python
# 定义函数
def greet(name):
    return f"你好, {name}!"

# 调用函数
message = greet("小明")
print(message)  # 输出: 你好, 小明!
```

---

## 第三部分：NumPy数组基础 (60分钟)

### 3.1 什么是NumPy？

NumPy是Python的科学计算库，专门处理数值运算。

**为什么需要NumPy？**
- Python列表慢，NumPy数组快
- NumPy支持高效的数学运算
- 深度学习中数据都用NumPy/张量表示

### 3.2 创建NumPy数组

```python
import numpy as np

# 从列表创建
arr = np.array([1, 2, 3, 4, 5])
print(arr)

# 创建全零数组
zeros = np.zeros((3, 3))  # 3行3列，都是0
print(zeros)

# 创建全一数组
ones = np.ones((2, 4))
print(ones)
```

### 3.3 数组的形状（shape）

```python
# 创建二维数组
matrix = np.array([
    [1, 2, 3],
    [4, 5, 6]
])

print(matrix.shape)  # 输出: (2, 3) - 2行3列
print(matrix.shape[0])  # 行数: 2
print(matrix.shape[1])  # 列数: 3
```

### 3.4 数组索引和切片

```python
arr = np.array([
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12]
])

# 获取单个元素
print(arr[0, 0])  # 第1行第1列: 1
print(arr[1, 2])  # 第2行第3列: 7

# 获取一行
print(arr[0, :])  # 第1行全部: [1, 2, 3, 4]

# 获取一列
print(arr[:, 0])  # 第1列全部: [1, 5, 9]
```

---

## 第四部分：MNIST数据集 (60分钟)

### 4.1 MNIST是什么？

MNIST是手写数字数据集，被称为深度学习的"Hello World"。

**数据集特点：**
- 60,000张训练图片
- 10,000张测试图片
- 每张图片是28×28像素的灰度图
- 数字0-9，共10个类别

**为什么从MNIST开始？**
- 数据量适中，不会太大
- 问题简单，容易上手
- 结果直观，一眼就能看出对错

### 4.2 加载MNIST数据集

```python
from torchvision import datasets

# 下载训练集
train_data = datasets.MNIST(
    root='./data',    # 保存路径
    train=True,        # 训练集
    download=True      # 如果不存在就下载
)

# 下载测试集
test_data = datasets.MNIST(
    root='./data',
    train=False,       # 测试集
    download=True
)
```

### 4.3 探索数据

```python
print(f"训练集大小: {len(train_data)}")
print(f"测试集大小: {len(test_data)}")

# 获取第一张图片
image, label = train_data[0]
print(f"第一张图片的标签: {label}")  # 应该是5
```

---

## 第五部分：数据可视化 (60分钟)

### 5.1 使用Matplotlib画图

```python
import matplotlib.pyplot as plt

# 获取一张图片
image, label = train_data[0]

# 显示图片
plt.imshow(image, cmap='gray')
plt.title(f"标签: {label}")
plt.show()
```

### 5.2 显示多张图片

```python
# 创建一个画布，显示16张图片
fig, axes = plt.subplots(4, 4, figsize=(10, 10))

for i, ax in enumerate(axes.flat):
    image, label = train_data[i]
    ax.imshow(image, cmap='gray')
    ax.set_title(f"标签: {label}")
    ax.axis('off')  # 隐藏坐标轴

plt.tight_layout()
plt.show()
```

### 5.3 统计数字分布

```python
from collections import Counter

# 统计每个数字的数量
labels = [train_data[i][1] for i in range(len(train_data))]
counter = Counter(labels)

# 画柱状图
digits = list(counter.keys())
counts = list(counter.values())

plt.bar(digits, counts)
plt.xlabel('数字')
plt.ylabel('数量')
plt.title('MNIST数据集数字分布')
plt.show()
```

---

## 📝 今日练习

打开 `day01_exercises.ipynb` 完成以下练习：

1. 打印前10张图片及其标签
2. 计算数字"0"在训练集中有多少张
3. 计算数字"0"在测试集中有多少张
4. 显示一张随机图片
5. 统计并可视化测试集的数字分布

---

## 🎯 检查点

完成第1天后，你应该能够：
- [ ] 独立启动Jupyter Notebook
- [ ] 用Python创建列表和循环
- [ ] 用NumPy创建和操作数组
- [ ] 加载并显示MNIST图片
- [ ] 理解什么是训练集和测试集

**第1天目标达成！🎉 明天我们将学习CNN的原理！**
