#!/usr/bin/env python
"""
MNIST CNN 可视化脚本
直接加载已训练的模型生成所有可视化图表，无需重新训练
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from collections import Counter
import os

# 设置工作目录
os.chdir('/home/sun_yuan/mnist-cnn-course')

print("=== MNIST CNN 可视化工具 ===\n")

# ============ 模型定义 ============
class MNIST_CNN(nn.Module):
    """Day03 基础CNN模型"""
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3)
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


class Improved_CNN(nn.Module):
    """Day04 改进CNN模型 (with BatchNorm)"""
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
        x = self.conv1(x)
        x = self.bn1(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2)
        x = self.conv2(x)
        x = self.bn2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2)
        x = x.view(-1, 64 * 5 * 5)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x


# ============ 加载数据 ============
print("📦 加载数据...")
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

train_data = datasets.MNIST('./data', train=True, download=False, transform=transform)
test_data = datasets.MNIST('./data', train=False, download=False, transform=transform)

train_loader = DataLoader(train_data, batch_size=64, shuffle=True)
test_loader = DataLoader(test_data, batch_size=64, shuffle=False)

print(f"   训练集: {len(train_data)} 张")
print(f"   测试集: {len(test_data)} 张\n")


# ============ 加载模型 ============
def load_model(model_path, model_class):
    """加载训练好的模型"""
    if not os.path.exists(model_path):
        print(f"   ❌ 模型文件不存在: {model_path}")
        return None

    model = model_class()

    # 尝试加载完整checkpoint
    try:
        checkpoint = torch.load(model_path, weights_only=False)
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
            acc = checkpoint.get('accuracy', None)
            print(f"   ✅ 加载: {model_path} (准确率: {acc:.2f}%)" if acc else f"   ✅ 加载: {model_path}")
        else:
            model.load_state_dict(checkpoint)
            print(f"   ✅ 加载: {model_path}")
    except:
        return None

    model.eval()
    return model


# ============ 评估函数 ============
def evaluate_model(model, test_loader):
    """评估模型准确率"""
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    return 100 * correct / total


# ============ 可视化函数 ============
def visualize_single_prediction(model, test_data, output_path):
    """单张预测结果可视化"""
    image, true_label = test_data[0]
    image_input = image.unsqueeze(0)

    with torch.no_grad():
        output = model(image_input)
        predicted = torch.argmax(output, dim=1).item()

    plt.figure(figsize=(4, 4))
    plt.imshow(image.squeeze(), cmap='gray')
    plt.title(f"True: {true_label}, Pred: {predicted}", fontsize=14)
    plt.axis('off')
    plt.savefig(output_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"   📊 {os.path.basename(output_path)}")


def visualize_batch_predictions(model, test_data, output_path, n=16):
    """批量预测结果可视化"""
    fig, axes = plt.subplots(4, 4, figsize=(12, 12))

    for i, ax in enumerate(axes.flat):
        image, true_label = test_data[i]
        image_input = image.unsqueeze(0)

        with torch.no_grad():
            output = model(image_input)
            predicted = torch.argmax(output, dim=1).item()

        ax.imshow(image.squeeze(), cmap='gray')
        color = 'green' if predicted == true_label else 'red'
        ax.set_title(f"T:{true_label} P:{predicted}", color=color, fontsize=12)
        ax.axis('off')

    plt.tight_layout()
    plt.savefig(output_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"   📊 {os.path.basename(output_path)}")


def visualize_wrong_predictions(model, test_loader, output_path, max_samples=16):
    """错误样本可视化"""
    model.eval()
    wrong_samples = []

    with torch.no_grad():
        for images, labels in test_loader:
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)

            for i in range(len(labels)):
                if predicted[i] != labels[i]:
                    wrong_samples.append({
                        'image': images[i],
                        'true': labels[i].item(),
                        'pred': predicted[i].item()
                    })
                    if len(wrong_samples) >= max_samples:
                        break

            if len(wrong_samples) >= max_samples:
                break

    if len(wrong_samples) == 0:
        print("   ℹ️  没有找到错误样本")
        return

    n_samples = min(len(wrong_samples), 16)
    n_rows = (n_samples + 3) // 4

    fig, axes = plt.subplots(n_rows, 4, figsize=(12, n_rows*3))
    axes = axes.flatten() if n_rows > 1 else [axes] if isinstance(axes, plt.Axes) else axes

    for i in range(n_samples):
        sample = wrong_samples[i]
        axes[i].imshow(sample['image'].squeeze(), cmap='gray')
        axes[i].set_title(f"T:{sample['true']} P:{sample['pred']}", color='red', fontsize=12)
        axes[i].axis('off')

    for i in range(n_samples, len(axes)):
        axes[i].axis('off')

    plt.tight_layout()
    plt.savefig(output_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"   📊 {os.path.basename(output_path)} ({len(wrong_samples)} 个错误样本)")

    # 统计错误类型
    error_types = Counter([(s['true'], s['pred']) for s in wrong_samples])
    print(f"      常见错误: {error_types.most_common(3)}")


def visualize_conv_filters(model, output_path):
    """卷积核可视化"""
    if hasattr(model, 'bn1'):  # Improved_CNN
        filters = model.conv1.weight.data.cpu()
    else:  # Basic MNIST_CNN
        filters = model.conv1.weight.data.cpu()

    fig, axes = plt.subplots(4, 8, figsize=(16, 8))
    for i, ax in enumerate(axes.flat):
        if i < filters.shape[0]:
            filter_img = filters[i].squeeze()
            ax.imshow(filter_img, cmap='gray')
            ax.set_title(f'F{i}', fontsize=8)
        ax.axis('off')

    plt.suptitle('First Layer Convolutional Filters', fontsize=14)
    plt.tight_layout()
    plt.savefig(output_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"   📊 {os.path.basename(output_path)}")


def visualize_feature_map(model, test_data, output_path):
    """特征图可视化"""
    image, _ = test_data[0]
    image_input = image.unsqueeze(0)

    # 获取第一层卷积输出
    with torch.no_grad():
        if hasattr(model, 'bn1'):
            x = model.conv1(image_input)
            x = model.bn1(x)
            x = F.relu(x)
        else:
            x = F.relu(model.conv1(image_input))

    feature_maps = x.squeeze().cpu()

    # 显示前16个特征图
    fig, axes = plt.subplots(4, 4, figsize=(12, 12))
    for i, ax in enumerate(axes.flat):
        if i < min(16, feature_maps.shape[0]):
            ax.imshow(feature_maps[i], cmap='viridis')
            ax.set_title(f'FM{i}', fontsize=10)
        ax.axis('off')

    plt.suptitle('First Layer Feature Maps', fontsize=14)
    plt.tight_layout()
    plt.savefig(output_path, dpi=100, bbox_inches='tight')
    plt.close()
    print(f"   📊 {os.path.basename(output_path)}")


# ============ 主函数 ============
def main():
    print("🔍 检查可用的模型文件...\n")

    models_to_viz = []

    # 检查 Day03 基础模型
    if os.path.exists('mnist_cnn_weights.pth'):
        models_to_viz.append({
            'name': 'Day03 Basic CNN',
            'path': 'mnist_cnn_weights.pth',
            'class': MNIST_CNN,
            'prefix': 'day03_'
        })

    # 检查 Day04 改进模型
    if os.path.exists('final_mnist_model.pth'):
        models_to_viz.append({
            'name': 'Day04 Improved CNN',
            'path': 'final_mnist_model.pth',
            'class': Improved_CNN,
            'prefix': 'day04_'
        })

    if not models_to_viz:
        print("❌ 没有找到训练好的模型文件！")
        print("   请先运行训练脚本生成模型文件。")
        return

    for model_info in models_to_viz:
        print(f"\n{'='*50}")
        print(f"📈 可视化: {model_info['name']}")
        print(f"{'='*50}")

        # 加载模型
        model = load_model(model_info['path'], model_info['class'])
        if model is None:
            continue

        # 评估
        acc = evaluate_model(model, test_loader)
        print(f"   📊 测试集准确率: {acc:.2f}%")

        prefix = model_info['prefix']

        # 生成可视化
        print("\n   生成可视化图表...")
        visualize_single_prediction(model, test_data, f'{prefix}single_prediction.png')
        visualize_batch_predictions(model, test_data, f'{prefix}predictions_16.png')
        visualize_wrong_predictions(model, test_loader, f'{prefix}wrong_predictions.png')
        visualize_conv_filters(model, f'{prefix}conv_filters.png')
        visualize_feature_map(model, test_data, f'{prefix}feature_maps.png')

        print(f"\n   ✅ {model_info['name']} 可视化完成！")

    print(f"\n{'='*50}")
    print("🎉 所有可视化完成！")
    print(f"{'='*50}\n")


if __name__ == '__main__':
    main()
