# 第4天：模型优化与展示

## 📋 今日目标

1. ✅ 学习模型优化技巧
2. ✅ 尝试数据增强
3. ✅ 可视化训练过程
4. ✅ 分析错误样本
5. ✅ 准备项目展示

---

## 第一部分：模型优化技巧 (90分钟)

### 1.1 学习率调整

学习率太大 → 震荡，不收敛
学习率太小 → 收敛太慢

**学习率衰减：**

```python
# 学习率调度器
scheduler = optim.lr_scheduler.StepLR(
    optimizer,
    step_size=3,    # 每3个epoch
    gamma=0.1       # 学习率×0.1
)

# 在训练循环中
for epoch in range(epochs):
    train_one_epoch()
    scheduler.step()  # 更新学习率
    current_lr = optimizer.param_groups[0]['lr']
    print(f"当前学习率: {current_lr}")
```

### 1.2 数据增强

通过变换图像增加数据多样性：

```python
from torchvision import transforms

# 训练集使用数据增强
train_transform = transforms.Compose([
    transforms.RandomRotation(10),      # 随机旋转±10度
    transforms.RandomAffine(0, translate=(0.1, 0.1)),  # 随机平移
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# 测试集不使用增强
test_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

train_data = datasets.MNIST('./data', train=True,
                            download=True,
                            transform=train_transform)
test_data = datasets.MNIST('./data', train=False,
                           download=True,
                           transform=test_transform)
```

### 1.3 Batch Normalization

归一化每层的输入，加速训练：

```python
class MNIST_CNN_BN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)
        self.bn1 = nn.BatchNorm2d(32)  # 批归一化
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.bn2 = nn.BatchNorm2d(64)
        self.fc1 = nn.Linear(64 * 5 * 5, 128)
        self.fc2 = nn.Linear(128, 10)
        self.dropout = nn.Dropout(0.25)

    def forward(self, x):
        x = F.max_pool2d(F.relu(self.bn1(self.conv1(x))), 2)
        x = F.max_pool2d(F.relu(self.bn2(self.conv2(x))), 2)
        x = x.view(-1, 64 * 5 * 5)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x
```

### 1.4 不同优化器比较

| 优化器 | 特点 | 适用场景 |
|--------|------|----------|
| SGD | 简单稳定 | 大多数场景 |
| Adam | 自适应学习率 | 快速原型 |
| RMSprop | 适合RNN | 序列模型 |
| Adagrad | 稀疏数据 | NLP任务 |

---

## 第二部分：训练可视化 (60分钟)

### 2.1 使用Tensorboard

```python
from torch.utils.tensorboard import SummaryWriter

# 创建日志目录
writer = SummaryWriter('runs/mnist_cnn')

# 在训练循环中记录
for epoch in range(epochs):
    # 记录损失
    writer.add_scalar('Loss/train', epoch_loss, epoch)

    # 记录学习率
    writer.add_scalar('Learning_rate', current_lr, epoch)

# 训练后，在终端运行：
# tensorboard --logdir=runs
```

### 2.2 使用Matplotlib绘制训练曲线

```python
def plot_training_history(train_losses, test_accuracies):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    # 损失曲线
    ax1.plot(train_losses, marker='o', label='Train Loss')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss')
    ax1.set_title('Training Loss')
    ax1.legend()
    ax1.grid(True)

    # 准确率曲线
    ax2.plot(test_accuracies, marker='s', color='green', label='Test Accuracy')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Accuracy (%)')
    ax2.set_title('Test Accuracy')
    ax2.legend()
    ax2.grid(True)

    plt.tight_layout()
    plt.show()
```

### 2.3 可视化卷积核

```python
def visualize_filters(model):
    # 获取第一层卷积核
    filters = model.conv1.weight.data.cpu()

    # 画前32个滤波器
    fig, axes = plt.subplots(4, 8, figsize=(16, 8))
    for i, ax in enumerate(axes.flat):
        if i < filters.shape[0]:
            filter_img = filters[i].squeeze()
            ax.imshow(filter_img, cmap='gray')
        ax.axis('off')
    plt.suptitle('First Convolutional Layer Filters')
    plt.show()

visualize_filters(model)
```

### 2.4 可视化特征图

```python
def visualize_feature_maps(model, image):
    # 挂钩获取中间层输出
    activation = {}

    def get_activation(name):
        def hook(model, input, output):
            activation[name] = output.detach()
        return hook

    model.conv1.register_forward_hook(get_activation('conv1'))

    # 前向传播
    model(image.unsqueeze(0))

    # 可视化
    act = activation['conv1'].squeeze()
    fig, axes = plt.subplots(4, 8, figsize=(16, 8))
    for i, ax in enumerate(axes.flat):
        if i < act.shape[0]:
            ax.imshow(act[i], cmap='viridis')
        ax.axis('off')
    plt.suptitle('Feature Maps after Conv1')
    plt.show()

# 使用
image, _ = test_data[0]
visualize_feature_maps(model, image)
```

---

## 第三部分：错误分析 (60分钟)

### 3.1 找出预测错误的样本

```python
def get_wrong_predictions(model, test_loader):
    model.eval()
    wrong_samples = []

    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)

            # 找出预测错误的
            wrong_mask = predicted != labels
            if wrong_mask.any():
                wrong_indices = wrong_mask.nonzero().squeeze()
                for idx in wrong_indices:
                    wrong_samples.append({
                        'image': images[idx],
                        'true': labels[idx].item(),
                        'pred': predicted[idx].item()
                    })

    return wrong_samples

wrong_samples = get_wrong_predictions(model, test_loader)
print(f"共找到 {len(wrong_samples)} 个错误样本")
```

### 3.2 可视化错误样本

```python
def show_wrong_samples(wrong_samples, n=16):
    fig, axes = plt.subplots(4, 4, figsize=(12, 12))

    for i, ax in enumerate(axes.flat):
        if i < len(wrong_samples):
            sample = wrong_samples[i]
            image = sample['image'].squeeze()
            true_label = sample['true']
            pred_label = sample['pred']

            ax.imshow(image, cmap='gray')
            ax.set_title(f"真:{true_label} 预:{pred_label}", color='red')
        ax.axis('off')

    plt.tight_layout()
    plt.show()

show_wrong_samples(wrong_samples)
```

### 3.3 分析混淆矩阵

```python
from sklearn.metrics import confusion_matrix
import seaborn as sns

def plot_confusion_matrix(model, test_loader):
    model.eval()
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            all_preds.extend(predicted.numpy())
            all_labels.extend(labels.numpy())

    # 计算混淆矩阵
    cm = confusion_matrix(all_labels, all_preds)

    # 画图
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=range(10),
                yticklabels=range(10))
    plt.xlabel('预测标签')
    plt.ylabel('真实标签')
    plt.title('混淆矩阵')
    plt.show()

plot_confusion_matrix(model, test_loader)
```

---

## 第四部分：项目展示准备 (30分钟)

### 4.1 展示内容模板

每个学生准备5分钟展示，包含：

1. **项目介绍**（1分钟）
   - MNIST是什么
   - 任务目标

2. **模型设计**（2分钟）
   - 使用的网络结构
   - 为什么这样设计

3. **实验结果**（1分钟）
   - 最终准确率
   - 训练曲线图

4. **遇到的困难与解决**（1分钟）
   - 训练中遇到的问题
   - 如何解决

### 4.2 展示评分标准

| 评分项 | 分数 | 标准 |
|--------|------|------|
| 模型准确率 | 30 | >95%满分，每低1%扣2分 |
| 代码质量 | 20 | 注释清晰，结构合理 |
| 展示表达 | 20 | 讲解清楚，逻辑连贯 |
| 实验分析 | 20 | 有对比实验，有错误分析 |
| 创新改进 | 10 | 尝试了改进方法 |

---

## 🎯 综合练习任务

1. **必做任务：**
   - 尝试至少一种优化方法
   - 绘制训练曲线
   - 分析至少5个错误样本

2. **选做任务：**
   - 可视化卷积核
   - 可视化特征图
   - 绘制混淆矩阵
   - 尝试不同的网络结构

3. **展示准备：**
   - 整理最终代码
   - 准备展示PPT（3-5页）
   - 准备回答问题

---

## 📝 代码整合示例

创建一个完整的训练脚本 `train.py`：

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import matplotlib.pyplot as plt

# 设置
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
EPOCHS = 10
BATCH_SIZE = 64
LEARNING_RATE = 0.001

# 数据
transform = transforms.Compose([
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

train_data = datasets.MNIST('./data', train=True,
                            download=True, transform=transform)
test_data = datasets.MNIST('./data', train=False,
                           download=True,
                           transform=transforms.Compose([
                               transforms.ToTensor(),
                               transforms.Normalize((0.5,), (0.5,))
                           ]))

train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
test_loader = DataLoader(test_data, batch_size=BATCH_SIZE, shuffle=False)

# 模型
class MNIST_CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.bn2 = nn.BatchNorm2d(64)
        self.fc1 = nn.Linear(64 * 5 * 5, 128)
        self.fc2 = nn.Linear(128, 10)
        self.dropout = nn.Dropout(0.25)

    def forward(self, x):
        x = F.max_pool2d(F.relu(self.bn1(self.conv1(x))), 2)
        x = F.max_pool2d(F.relu(self.bn2(self.conv2(x))), 2)
        x = x.view(-1, 64 * 5 * 5)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

model = MNIST_CNN().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)

# 训练
train_losses = []
test_accuracies = []

for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    epoch_loss = running_loss / len(train_loader)
    train_losses.append(epoch_loss)

    # 评估
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total
    test_accuracies.append(accuracy)

    scheduler.step()

    print(f'Epoch {epoch+1}/{EPOCHS}, Loss: {epoch_loss:.4f}, Accuracy: {accuracy:.2f}%')

# 保存
torch.save(model.state_dict(), 'final_model.pth')
print(f'最终准确率: {test_accuracies[-1]:.2f}%')

# 绘图
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(train_losses, marker='o')
plt.title('Training Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(test_accuracies, marker='s', color='green')
plt.title('Test Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy (%)')
plt.grid(True)

plt.tight_layout()
plt.savefig('training_history.png')
plt.show()
```

---

## 🎯 课程总结

### 4天学习回顾

| 天数 | 内容 | 掌握技能 |
|------|------|----------|
| 第1天 | Python基础与数据探索 | Jupyter, NumPy, MNIST数据 |
| 第2天 | CNN理论 | 卷积、池化、激活函数 |
| 第3天 | 模型搭建 | PyTorch模型、训练循环 |
| 第4天 | 优化与展示 | 数据增强、可视化、展示 |

### 继续学习建议

1. **尝试更复杂的数据集：**
   - CIFAR-10（彩色图像）
   - Fashion-MNIST（服装分类）

2. **学习更深的网络：**
   - ResNet
   - VGG
   - EfficientNet

3. **了解其他应用：**
   - 目标检测
   - 图像分割
   - 迁移学习

---

## 🎉 恭喜完成4天课程！

你已经：
- ✅ 从零开始学习了CNN
- ✅ 动手搭建了深度学习模型
- ✅ 完成了一个完整的机器学习项目

**这是你深度学习之旅的起点，继续加油！** 🚀
