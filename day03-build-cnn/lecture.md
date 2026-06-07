# 第3天：动手搭建CNN模型

## 📋 今日目标

1. ✅ 理解PyTorch的基本数据结构
2. ✅ 搭建第一个CNN模型
3. ✅ 编写训练循环
4. ✅ 训练出>95%准确率的模型
5. ✅ 保存和加载模型

---

## 第一部分：PyTorch基础 (60分钟)

### 1.1 什么是Tensor？

**Tensor（张量）** = 深度学习中的"数组"

| 类型 | 说明 | 示例 |
|------|------|------|
| 标量 (0D) | 单个数字 | 3.14 |
| 向量 (1D) | 一维数组 | [1, 2, 3] |
| 矩阵 (2D) | 二维数组 | [[1,2], [3,4]] |
| 张量 (3D+) | 高维数组 | 图片的[通道, 高, 宽] |

```python
import torch

# 创建不同维度的张量
scalar = torch.tensor(3.14)           # 标量
vector = torch.tensor([1, 2, 3])       # 向量
matrix = torch.tensor([[1, 2], [3, 4]]) # 矩阵
image = torch.randn(1, 28, 28)        # 模拟一张图片

print(f"标量: {scalar}")
print(f"向量形状: {vector.shape}")      # torch.Size([3])
print(f"矩阵形状: {matrix.shape}")     # torch.Size([2, 2])
print(f"图片形状: {image.shape}")      # torch.Size([1, 28, 28])
```

### 1.2 MNIST数据的Tensor表示

```python
from torchvision import datasets, transforms

# 数据预处理：转Tensor + 归一化
transform = transforms.Compose([
    transforms.ToTensor(),              # PIL图像 → Tensor
    transforms.Normalize((0.5,), (0.5,)) # 归一化到[-1, 1]
])

# 加载数据
train_data = datasets.MNIST(
    root='./data',
    train=True,
    download=True,
    transform=transform
)

test_data = datasets.MNIST(
    root='./data',
    train=False,
    download=True,
    transform=transform
)

# 查看一张图片
image, label = train_data[0]
print(f"图片形状: {image.shape}")  # torch.Size([1, 28, 28])
# 通道数 × 高度 × 宽度
```

### 1.3 DataLoader：批量加载

```python
from torch.utils.data import DataLoader

# 创建数据加载器
train_loader = DataLoader(
    train_data,
    batch_size=32,    # 每批32张图片
    shuffle=True      # 打乱顺序
)

test_loader = DataLoader(
    test_data,
    batch_size=32,
    shuffle=False
)

# 获取一批数据
images, labels = next(iter(train_loader))
print(f"一批图片的形状: {images.shape}")  # [32, 1, 28, 28]
print(f"一批标签的形状: {labels.shape}")  # [32]
```

---

## 第二部分：深度学习训练基础概念 (45分钟)

在开始训练模型之前，需要理解几个核心概念。

### 2.1 训练集、验证集、测试集

| 数据集 | 用途 | 比例 |
|--------|------|------|
| **训练集** | 训练模型，调整参数 | ~60-70% |
| **验证集** | 调整超参数，选择模型 | ~10-20% |
| **测试集** | 最终评估，不参与训练 | ~20-30% |

**类比考试：**
- 训练集 = 平时练习题（可以反复做）
- 验证集 = 模拟考试（检验学习效果，调整方法）
- 测试集 = 高考（最终考试，不能提前看题）

> 💡 MNIST数据集已经帮我们分好了训练集(60,000张)和测试集(10,000张)

### 2.2 Batch（批次）

**什么是Batch？**

一次处理多个样本，而不是一个一个处理。

```
不用Batch：              用Batch：
图片1 → 前向 → 后向      图片1,2,3,4 → 前向 → 后向
图片2 → 前向 → 后向      图片5,6,7,8 → 前向 → 后向
图片3 → 前向 → 后向      ...
...
```

**为什么需要Batch？**

| 不用Batch | 用Batch |
|----------|---------|
| 每次只处理1张图 | 每次处理32/64/128张图 |
| 训练很慢 | 训练快（GPU并行） |
| 梯度波动大 | 梯度更稳定 |
| 无法充分利用GPU | GPU利用率高 |

**Batch Size的选择：**
- 太小（如1）：训练慢，梯度不稳定
- 太大（如全部数据）：内存不够，泛化能力可能下降
- 常用值：32, 64, 128, 256

### 2.3 Epoch（轮次）

**什么是Epoch？**

把整个训练集完整过一遍叫做一个Epoch。

```
训练集有60,000张图，batch_size=100

1个Epoch = 600个batch（60000/100）
```

**训练多少个Epoch？**

- 太少：还没学好
- 太多：可能过拟合（把训练集死记硬背）

常见做法：设置一个较大的值（如10-50），同时使用**早停**（Early Stopping）

### 2.4 Iteration（迭代/步）

**什么是Iteration？**

```
1个Iteration = 处理1个batch

Iterations per Epoch = 训练集大小 / batch_size
```

**示例：**
- MNIST训练集：60,000张
- Batch size：64
- Iterations per epoch：60,000 / 64 ≈ 938
- 训练5个epoch：5 × 938 = 4,690次迭代

### 2.5 损失函数（Loss Function）

**什么是Loss？**

衡量模型预测与真实答案差距的指标。

**损失越小 = 预测越准确**

**分类任务常用：交叉熵损失**

```python
import torch.nn as nn

# 交叉熵损失
criterion = nn.CrossEntropyLoss()

# 使用
outputs = model(images)      # 模型输出 [batch, 10]
loss = criterion(outputs, labels)  # 计算损失
```

**直观理解：**
```
真实标签是"5"，模型输出：
[0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]  → Loss很大
[0.0, 0.0, 0.0, 0.0, 0.0, 0.9, 0.0, 0.0, 0.0, 0.1]  → Loss很小
                              ↑
                          正确预测
```

### 2.6 学习率（Learning Rate）

**什么是学习率？**

控制每次参数更新的大小。

```
新参数 = 旧参数 - 学习率 × 梯度
```

**学习率的影响：**

| 学习率太小 | 学习率合适 | 学习率太大 |
|-----------|-----------|-----------|
| 收敛很慢 | 稳定收敛 | 震荡/发散 |
| 需要更多epoch | 效率高 | 无法训练 |

**类比下楼梯：**
- 学习率太大 = 一步跨好几层，可能跨过头
- 学习率太小 = 每次只挪一厘米，太慢
- 学习率合适 = 稳步下降

**常用值：0.001, 0.0001, 0.01**

### 2.7 过拟合（Overfitting）

**什么是过拟合？**

模型把训练集"死记硬背"了，遇到新数据就不行了。

```
训练集准确率: 99.8%  ← 差距很大
测试集准确率: 92.0%  ← 说明过拟合了
```

**如何判断？**
- 训练Loss一直下降，测试Loss开始上升
- 训练准确率很高，测试准确率低很多

**如何防止？**
- 使用Dropout（随机丢弃一些神经元）
- 数据增强（旋转、平移图片）
- 早停（验证集Loss不再下降就停止）
- 减少模型复杂度

### 2.8 训练循环的结构

一个完整的训练循环：

```python
for epoch in range(num_epochs):           # 外层：遍历epoch
    for images, labels in train_loader:  # 内层：遍历batch
        # 1. 前向传播
        outputs = model(images)

        # 2. 计算损失
        loss = criterion(outputs, labels)

        # 3. 梯度清零
        optimizer.zero_grad()

        # 4. 反向传播
        loss.backward()

        # 5. 更新参数
        optimizer.step()
```

**类比学习过程：**
1. 看题做题（前向传播）
2. 对答案（计算损失）
3. 找问题（反向传播）
4. 改进方法（更新参数）

---

## 第三部分：搭建CNN模型 (90分钟)

### 3.1 模型结构设计

我们来搭建一个简单的CNN：

```
输入: [batch, 1, 28, 28]
    ↓
卷积层1: Conv2d(1, 32, 3)  →  [batch, 32, 26, 26]
    ↓ ReLU
    ↓ MaxPool(2, 2)        →  [batch, 32, 13, 13]
    ↓
卷积层2: Conv2d(32, 64, 3) →  [batch, 64, 11, 11]
    ↓ ReLU
    ↓ MaxPool(2, 2)        →  [batch, 64, 5, 5]
    ↓
展平: Flatten              →  [batch, 64×5×5] = [batch, 1600]
    ↓
全连接层: Linear(1600, 128) →  [batch, 128]
    ↓ ReLU
    ↓ Dropout (防止过拟合)
    ↓
输出层: Linear(128, 10)    →  [batch, 10]
```

### 3.2 理解卷积通道变化

这是初学者最容易困惑的地方，让我们详细拆解。

#### 什么是"通道"（Channel）？

**通道 = 特征图的数量**

- **输入通道**：原始数据的通道数
  - 灰度图：1个通道（只有亮度）
  - 彩色图（RGB）：3个通道（红、绿、蓝）
  
- **输出通道**：提取的特征数量
  - 32个通道 = 学到了32种不同的特征
  - 64个通道 = 学到了64种不同的特征

#### MNIST的通道变化详解

```
输入图片: [batch, 1, 28, 28]
          ↑      ↑  ↑   ↑
        批次   通道 高  宽
        
含义：一批图片，每张是1通道（灰度），28×28像素
```

**第一层卷积：Conv2d(1, 32, 3)**

```python
nn.Conv2d(in_channels=1, out_channels=32, kernel_size=3)
```

| 参数 | 含义 |
|------|------|
| in_channels=1 | 输入是1通道（灰度图） |
| out_channels=32 | 输出32个通道（学32个特征） |
| kernel_size=3 | 卷积核是3×3 |

**发生了什么？**

```
输入:  [batch, 1, 28, 28]  ← 1个灰度图
        ↓
卷积层: 32个不同的3×3卷积核
        ↓
输出:  [batch, 32, 26, 26]  ← 32个特征图
                ↑
            每个卷积核学一个特征
```

**32个通道学到了什么？**

| 通道号 | 可能学到的特征 |
|--------|---------------|
| 通道1 | 横线检测器 |
| 通道2 | 竖线检测器 |
| 通道3 | 斜线检测器 |
| 通道4 | 圆弧检测器 |
| ... | ... |
| 通道32 | 某种复杂形状 |

**可视化理解：**

```
输入图片（1通道）：
┌───────────────┐
│  ████         │
│  █  █         │
│  ████         │
│               │
└───────────────┘
1个通道，显示数字"8"

卷积后输出（32通道）：
通道1: 通道2: 通道3: ... 通道32:
┌───┐ ┌───┐ ┌───┐     ┌───┐
│...│ │███│ │...│     │...│  ← 32个特征图
│███│ │███│ │...│  ... │...│     每个显示不同特征
│███│ │███│ │...│     │...│
└───┘ └───┘ └───┘     └───┘
横线  竖线   圆弧
```

**经过池化后：**

```
输入:  [batch, 32, 26, 26]
        ↓ MaxPool(2, 2)
输出:  [batch, 32, 13, 13]
                ↑
            通道数不变！
            只是每个特征图变小了
```

---

**第二层卷积：Conv2d(32, 64, 3)**

```python
nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3)
```

| 参数 | 含义 |
|------|------|
| in_channels=32 | 输入32个通道（上一层学到的特征） |
| out_channels=64 | 输出64个通道（组合成更复杂特征） |
| kernel_size=3 | 卷积核是3×3 |

**发生了什么？**

```
输入:  [batch, 32, 13, 13]  ← 上一层的32个特征图
        ↓
每个输出通道需要1个卷积核处理所有32个输入通道
→ 总共 64×32 = 2048 个3×3×32的卷积核参数
        ↓
输出:  [batch, 64, 11, 11]  ← 64个更复杂的特征图
```

**为什么增加通道？**

```
浅层特征（通道少）：
- 横线、竖线、圆弧等简单形状

深层特征（通道多）：
- 组合简单形状形成复杂特征
- "8" = 两个圆叠加
- "4" = 竖线 + 横线组合
```

---

#### 通道变化规律总结

```
规律1：卷积层的输出通道数 = 你想学多少个特征
Conv2d(1, 32, 3)  → 输出32个通道（学32个特征）
Conv2d(32, 64, 3) → 输出64个通道（学64个特征）

规律2：池化不改变通道数
MaxPool(2, 2) → 通道数保持不变

规律3：进入全连接层前要展平
[batch, 64, 5, 5] → [batch, 64×5×5]
                   所有通道拉平成一条
```

---

#### 参数量计算

**第一卷积层参数：**
```
Conv2d(1, 32, 3)
= 32个卷积核 × (3×3×1 + 1偏置)
= 32 × 10
= 320个参数
```

**第二卷积层参数：**
```
Conv2d(32, 64, 3)
= 64个卷积核 × (3×3×32 + 1偏置)
= 64 × 289
= 18,496个参数
```

**全连接层参数：**
```
Linear(1600, 128)
= 1600 × 128 + 128
= 204,928个参数  ← 参数最多！
```

> 💡 **关键理解**：卷积层虽然通道多，但参数相对较少；全连接层参数量最大，这就是为什么CNN比全连接网络高效！

---

#### 形状变化的完整追踪

让我们追踪一张图片在网络中的完整旅程：

```
输入图片: [1, 1, 28, 28]
            │
            ↓ conv1 (1→32通道)
特征提取:  [1, 32, 26, 26]  ← 学到32种基础特征
            │
            ↓ maxpool
压缩:     [1, 32, 13, 13]  ← 特征图变小，通道不变
            │
            ↓ conv2 (32→64通道)
特征组合:  [1, 64, 11, 11]  ← 组合成64种复杂特征
            │
            ↓ maxpool
压缩:     [1, 64, 5, 5]    ← 特征图继续变小
            │
            ↓ flatten
展平:     [1, 1600]         ← 64×5×5 = 1600
            │
            ↓ fc1
分类:     [1, 128]          ← 压缩到128维特征
            │
            ↓ fc2
输出:     [1, 10]           ← 10个数字的概率
            │
            ↓ argmax
预测:     5                  ← 最终预测结果
```

---

### 3.3 代码实现

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MNIST_CNN(nn.Module):
    def __init__(self):
        super().__init__()

        # 卷积层1: 1通道 → 32通道
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3)

        # 卷积层2: 32通道 → 64通道
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3)

        # 全连接层1
        self.fc1 = nn.Linear(64 * 5 * 5, 128)

        # 输出层
        self.fc2 = nn.Linear(128, 10)

        # Dropout层
        self.dropout = nn.Dropout(0.25)

    def forward(self, x):
        # 第一卷积块
        x = self.conv1(x)           # [batch, 32, 26, 26]
        x = F.relu(x)
        x = F.max_pool2d(x, 2)      # [batch, 32, 13, 13]

        # 第二卷积块
        x = self.conv2(x)           # [batch, 64, 11, 11]
        x = F.relu(x)
        x = F.max_pool2d(x, 2)      # [batch, 64, 5, 5]

        # 展平
        x = x.view(-1, 64 * 5 * 5)  # [batch, 1600]

        # 全连接层
        x = self.fc1(x)              # [batch, 128]
        x = F.relu(x)
        x = self.dropout(x)

        # 输出层
        x = self.fc2(x)              # [batch, 10]

        return x
```

### 3.4 测试模型

```python
# 创建模型
model = MNIST_CNN()

# 测试前向传播
dummy_input = torch.randn(1, 1, 28, 28)
output = model(dummy_input)

print(f"输入形状: {dummy_input.shape}")
print(f"输出形状: {output.shape}")  # 应该是 [1, 10]

# 查看模型结构
print(model)
```

---

## 第四部分：训练模型 (90分钟)

### 4.1 损失函数和优化器

```python
import torch.optim as optim

# 损失函数：交叉熵损失
# 适用于多分类任务
criterion = nn.CrossEntropyLoss()

# 优化器：Adam
# 自动调整学习率，收敛快
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 或者使用 SGD
# optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
```

### 4.2 训练循环

```python
def train_model(model, train_loader, criterion, optimizer, epochs=5):
    model.train()  # 设置为训练模式
    train_losses = []

    for epoch in range(epochs):
        running_loss = 0.0

        for i, (images, labels) in enumerate(train_loader):
            # 梯度清零
            optimizer.zero_grad()

            # 前向传播
            outputs = model(images)

            # 计算损失
            loss = criterion(outputs, labels)

            # 反向传播
            loss.backward()

            # 更新参数
            optimizer.step()

            running_loss += loss.item()

        # 计算平均损失
        epoch_loss = running_loss / len(train_loader)
        train_losses.append(epoch_loss)

        print(f'Epoch [{epoch+1}/{epochs}], Loss: {epoch_loss:.4f}')

    return train_losses

# 开始训练
train_losses = train_model(model, train_loader, criterion, optimizer, epochs=5)
```

### 4.3 评估模型

```python
def evaluate_model(model, test_loader):
    model.eval()  # 设置为评估模式
    correct = 0
    total = 0

    # 不计算梯度，节省内存
    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            # 获取预测类别（最大值的索引）
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total
    return accuracy

# 评估
accuracy = evaluate_model(model, test_loader)
print(f'测试集准确率: {accuracy:.2f}%')
```

---

## 第五部分：完整代码 (30分钟)

### 5.1 完整训练脚本

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# 设置随机种子（保证可复现）
torch.manual_seed(42)

# 1. 数据准备
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

train_data = datasets.MNIST('./data', train=True, download=True, transform=transform)
test_data = datasets.MNIST('./data', train=False, download=True, transform=transform)

train_loader = DataLoader(train_data, batch_size=64, shuffle=True)
test_loader = DataLoader(test_data, batch_size=64, shuffle=False)

# 2. 定义模型
class MNIST_CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.fc1 = nn.Linear(64 * 5 * 5, 128)
        self.fc2 = nn.Linear(128, 10)
        self.dropout = nn.Dropout(0.25)

    def forward(self, x):
        x = F.max_pool2d(F.relu(self.conv1(x)), 2)
        x = F.max_pool2d(F.relu(self.conv2(x)), 2)
        x = x.view(-1, 64 * 5 * 5)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

model = MNIST_CNN()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 3. 训练
def train(epochs=5):
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for images, labels in train_loader:
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        print(f'Epoch {epoch+1}, Loss: {running_loss/len(train_loader):.4f}')

# 4. 评估
def evaluate():
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    print(f'准确率: {100*correct/total:.2f}%')

# 运行
print("开始训练...")
train(epochs=5)
print("训练完成！")
evaluate()
```

### 5.2 保存模型

```python
# 保存整个模型
torch.save(model, 'mnist_cnn_model.pth')

# 或者只保存参数（推荐）
torch.save(model.state_dict(), 'mnist_cnn_weights.pth')
```

### 5.3 加载模型

```python
# 加载保存的模型
model = MNIST_CNN()
model.load_state_dict(torch.load('mnist_cnn_weights.pth'))
model.eval()

# 测试加载的模型
sample_image, _ = test_data[0]
sample_image = sample_image.unsqueeze(0)  # 增加batch维度
output = model(sample_image)
predicted = torch.argmax(output, dim=1)
print(f"预测结果: {predicted.item()}")
```

---

## 🎯 练习任务

1. 运行完整代码，观察loss变化
2. 尝试调整batch_size（32, 64, 128）
3. 尝试调整学习率（0.001, 0.0001, 0.01）
4. 尝试增加epoch数量
5. 记录不同配置的准确率

---

## 📝 常见问题

**Q1: 训练loss不下降怎么办？**
- 检查学习率是否太大或太小
- 检查数据是否正确加载
- 尝试不同的优化器

**Q2: 训练集准确率高但测试集低？**
- 这是过拟合
- 增加Dropout
- 增加数据增强
- 减少模型复杂度

**Q3: GPU加速？**
```python
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)
images, labels = images.to(device), labels.to(device)
```

---

## 🎯 检查点

完成第3天后，你应该：
- [ ] 理解Tensor的结构
- [ ] 能够搭建CNN模型
- [ ] 理解训练循环
- [ ] 训练出>95%准确率的模型
- [ ] 保存和加载模型

**第3天目标达成！🎉 明天我们将优化模型！**
