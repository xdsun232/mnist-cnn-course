"""
CNN 手写数字识别模板
复制此文件并根据需要修改
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# ============================================
# 配置参数
# ============================================
BATCH_SIZE = 64
LEARNING_RATE = 0.001
EPOCHS = 10
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ============================================
# 数据准备
# ============================================
def get_data_loaders():
    """返回训练和测试数据加载器"""

    # 训练集变换（可添加数据增强）
    train_transform = transforms.Compose([
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    # 测试集变换
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

    train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_data, batch_size=BATCH_SIZE, shuffle=False)

    return train_loader, test_loader

# ============================================
# 模型定义
# ============================================
class MNIST_CNN(nn.Module):
    """手写数字识别CNN模型"""

    def __init__(self):
        super().__init__()

        # 卷积层
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3)

        # 批归一化（可选）
        self.bn1 = nn.BatchNorm2d(32)
        self.bn2 = nn.BatchNorm2d(64)

        # 全连接层
        self.fc1 = nn.Linear(64 * 5 * 5, 128)
        self.fc2 = nn.Linear(128, 10)

        # Dropout
        self.dropout = nn.Dropout(0.25)

    def forward(self, x):
        # 卷积块1
        x = self.conv1(x)
        x = self.bn1(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2)

        # 卷积块2
        x = self.conv2(x)
        x = self.bn2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2)

        # 展平
        x = x.view(-1, 64 * 5 * 5)

        # 全连接
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)

        return x

# ============================================
# 训练函数
# ============================================
def train_epoch(model, train_loader, criterion, optimizer, device):
    """训练一个epoch"""
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

    return running_loss / len(train_loader)

# ============================================
# 评估函数
# ============================================
def evaluate(model, test_loader, device):
    """评估模型"""
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

    return 100 * correct / total

# ============================================
# 主训练函数
# ============================================
def main():
    """主训练流程"""

    print(f"使用设备: {DEVICE}")

    # 加载数据
    print("加载数据...")
    train_loader, test_loader = get_data_loaders()

    # 创建模型
    print("创建模型...")
    model = MNIST_CNN().to(DEVICE)

    # 损失函数和优化器
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    # 学习率调度器
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)

    # 训练
    print("\n开始训练...")
    for epoch in range(EPOCHS):
        loss = train_epoch(model, train_loader, criterion, optimizer, DEVICE)
        accuracy = evaluate(model, test_loader, DEVICE)
        scheduler.step()

        print(f'Epoch [{epoch+1}/{EPOCHS}], Loss: {loss:.4f}, Accuracy: {accuracy:.2f}%')

    # 保存模型
    torch.save(model.state_dict(), 'mnist_cnn.pth')
    print("\n模型已保存为 mnist_cnn.pth")

if __name__ == '__main__':
    main()
