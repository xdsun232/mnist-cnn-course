#!/usr/bin/env python
"""
MNIST CNN 可视化脚本

加载已有模型并生成预测样本、错误样本、混淆矩阵、卷积核和特征图。
默认会在项目目录下创建 visualizations/ 文件夹保存图片。
"""

import argparse
import math
import os
import re
import tempfile
from collections import Counter
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
os.environ.setdefault("MPLCONFIGDIR", str(Path(tempfile.gettempdir()) / "mnist-cnn-course-matplotlib"))
os.environ.setdefault("XDG_CACHE_HOME", str(Path(tempfile.gettempdir()) / "mnist-cnn-course-cache"))

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets, transforms


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
    """Day04/模板改进CNN模型 (with BatchNorm)"""

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


KNOWN_MODEL_FILES = [
    {
        "name": "Day03 Basic CNN",
        "file": "mnist_cnn_weights.pth",
        "classes": [MNIST_CNN, Improved_CNN],
        "prefix": "day03_",
    },
    {
        "name": "Day03 Full CNN",
        "file": "mnist_cnn_model.pth",
        "classes": [MNIST_CNN, Improved_CNN],
        "prefix": "day03_full_",
    },
    {
        "name": "Course Template CNN",
        "file": "mnist_cnn.pth",
        "classes": [Improved_CNN, MNIST_CNN],
        "prefix": "template_",
    },
    {
        "name": "Day04 Improved CNN",
        "file": "final_model.pth",
        "classes": [Improved_CNN, MNIST_CNN],
        "prefix": "day04_",
    },
    {
        "name": "Day04 Improved CNN",
        "file": "final_mnist_model.pth",
        "classes": [Improved_CNN, MNIST_CNN],
        "prefix": "day04_final_",
    },
]


def parse_args():
    parser = argparse.ArgumentParser(description="生成 MNIST CNN 模型可视化图片")
    parser.add_argument(
        "--model",
        action="append",
        help="指定模型文件路径；可重复传入。不指定时自动查找项目目录下的 .pth/.pt 文件。",
    )
    parser.add_argument(
        "--output-dir",
        default="visualizations",
        help="图片输出目录，默认: visualizations",
    )
    parser.add_argument("--batch-size", type=int, default=128, help="测试集 batch size")
    parser.add_argument("--max-samples", type=int, default=16, help="样本网格最多展示数量")
    parser.add_argument("--max-feature-maps", type=int, default=16, help="每层最多展示多少张特征图")
    parser.add_argument("--max-filters", type=int, default=32, help="每层最多展示多少个卷积核")
    parser.add_argument(
        "--download",
        action="store_true",
        help="如果本地没有 MNIST 数据集，允许 torchvision 下载数据",
    )
    parser.add_argument(
        "--device",
        default="auto",
        help="运行设备: auto / cpu / cuda / mps，默认 auto",
    )
    return parser.parse_args()


def get_device(device_name):
    if device_name != "auto":
        return torch.device(device_name)

    if torch.cuda.is_available():
        return torch.device("cuda")

    mps_backend = getattr(torch.backends, "mps", None)
    if mps_backend is not None and mps_backend.is_available():
        return torch.device("mps")

    return torch.device("cpu")


def resolve_output_dir(output_dir):
    path = Path(output_dir)
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    path.mkdir(parents=True, exist_ok=True)
    return path


def sanitize_prefix(name):
    prefix = re.sub(r"[^0-9a-zA-Z]+", "_", name).strip("_").lower()
    return f"{prefix or 'model'}_"


def get_test_data(batch_size, download):
    transform = transforms.Compose(
        [
            transforms.ToTensor(),
            transforms.Normalize((0.5,), (0.5,)),
        ]
    )

    try:
        test_data = datasets.MNIST(
            str(PROJECT_ROOT / "data"),
            train=False,
            download=download,
            transform=transform,
        )
    except RuntimeError as exc:
        if not download:
            raise RuntimeError(
                "未找到 MNIST 数据集。请先运行训练代码，或执行: python visualize.py --download"
            ) from exc
        raise

    test_loader = DataLoader(test_data, batch_size=batch_size, shuffle=False)
    return test_data, test_loader


def discover_models(model_paths):
    models = []
    seen = set()

    if model_paths:
        for raw_path in model_paths:
            path = Path(raw_path)
            if not path.is_absolute():
                path = PROJECT_ROOT / path
            models.append(
                {
                    "name": path.name,
                    "path": path,
                    "classes": [Improved_CNN, MNIST_CNN],
                    "prefix": sanitize_prefix(path.stem),
                }
            )
        return models

    for spec in KNOWN_MODEL_FILES:
        path = PROJECT_ROOT / spec["file"]
        if path.exists():
            models.append(
                {
                    "name": spec["name"],
                    "path": path,
                    "classes": spec["classes"],
                    "prefix": spec["prefix"],
                }
            )
            seen.add(path.resolve())

    for pattern in ("*.pth", "*.pt"):
        for path in sorted(PROJECT_ROOT.glob(pattern)):
            if path.resolve() in seen:
                continue
            models.append(
                {
                    "name": path.name,
                    "path": path,
                    "classes": [Improved_CNN, MNIST_CNN],
                    "prefix": sanitize_prefix(path.stem),
                }
            )
            seen.add(path.resolve())

    return models


def torch_load(path):
    try:
        return torch.load(path, map_location="cpu", weights_only=False)
    except TypeError:
        return torch.load(path, map_location="cpu")


def extract_state_dict(checkpoint):
    if isinstance(checkpoint, nn.Module):
        return checkpoint, {}

    if not isinstance(checkpoint, dict):
        return None, {}

    if "model_state_dict" in checkpoint:
        return checkpoint["model_state_dict"], checkpoint

    if "state_dict" in checkpoint:
        return checkpoint["state_dict"], checkpoint

    if checkpoint and all(torch.is_tensor(value) for value in checkpoint.values()):
        return checkpoint, {}

    return None, checkpoint


def normalize_state_dict_keys(state_dict):
    normalized = {}
    for key, value in state_dict.items():
        if key.startswith("module."):
            key = key[len("module.") :]
        normalized[key] = value
    return normalized


def load_model(model_info, device):
    model_path = model_info["path"]
    if not model_path.exists():
        print(f"   ❌ 模型文件不存在: {model_path}")
        return None

    try:
        checkpoint = torch_load(model_path)
    except Exception as exc:
        print(f"   ❌ 无法加载模型文件: {model_path.name}")
        print(f"      {exc}")
        return None

    state_or_model, metadata = extract_state_dict(checkpoint)

    if isinstance(state_or_model, nn.Module):
        model = state_or_model.to(device)
        model.eval()
        print(f"   ✅ 加载完整模型: {model_path.name}")
        return model

    if state_or_model is None:
        print(f"   ❌ 未识别的模型文件格式: {model_path.name}")
        return None

    state_dict = normalize_state_dict_keys(state_or_model)
    last_error = None

    for model_class in model_info["classes"]:
        model = model_class()
        try:
            model.load_state_dict(state_dict, strict=True)
        except RuntimeError as exc:
            last_error = exc
            continue

        model = model.to(device)
        model.eval()
        accuracy = metadata.get("accuracy") if isinstance(metadata, dict) else None
        if isinstance(accuracy, (int, float)):
            print(f"   ✅ 加载参数: {model_path.name} ({model_class.__name__}, 保存准确率: {accuracy:.2f}%)")
        else:
            print(f"   ✅ 加载参数: {model_path.name} ({model_class.__name__})")
        return model

    print(f"   ❌ 模型结构不匹配: {model_path.name}")
    if last_error is not None:
        print(f"      最后一次错误: {str(last_error).splitlines()[0]}")
    return None


def collect_predictions(model, test_loader, device):
    model.eval()
    samples = []
    confusion = torch.zeros(10, 10, dtype=torch.long)
    correct = 0
    total = 0

    with torch.no_grad():
        for batch_idx, (images, labels) in enumerate(test_loader):
            outputs = model(images.to(device))
            probabilities = F.softmax(outputs.cpu(), dim=1)
            confidences, predicted = torch.max(probabilities, dim=1)

            for item_idx in range(labels.size(0)):
                true_label = int(labels[item_idx].item())
                pred_label = int(predicted[item_idx].item())
                dataset_index = batch_idx * test_loader.batch_size + item_idx

                confusion[true_label, pred_label] += 1
                correct += int(true_label == pred_label)
                total += 1

                samples.append(
                    {
                        "index": dataset_index,
                        "image": images[item_idx].detach().cpu(),
                        "true": true_label,
                        "pred": pred_label,
                        "confidence": float(confidences[item_idx].item()),
                        "probs": probabilities[item_idx].detach().cpu(),
                    }
                )

    accuracy = 100 * correct / total if total else 0.0
    return samples, confusion, accuracy


def denormalize_image(image):
    image = image.detach().cpu().squeeze()
    image = image * 0.5 + 0.5
    return image.clamp(0, 1).numpy()


def normalize_map(channel):
    channel = channel.detach().cpu().float()
    min_value = float(channel.min())
    max_value = float(channel.max())
    if abs(max_value - min_value) < 1e-8:
        return torch.zeros_like(channel).numpy()
    return ((channel - min_value) / (max_value - min_value)).numpy()


def make_grid_axes(count, cols, cell_width=3.0, cell_height=3.0):
    cols = min(cols, count)
    rows = math.ceil(count / cols)
    fig, axes = plt.subplots(rows, cols, figsize=(cols * cell_width, rows * cell_height))
    axes = np.array(axes, dtype=object).reshape(-1)
    return fig, axes


def save_figure(fig, output_path):
    fig.savefig(output_path, dpi=140, bbox_inches="tight")
    plt.close(fig)
    print(f"   📊 {output_path.name}")


def select_balanced_samples(samples, max_samples):
    if len(samples) <= max_samples:
        return samples

    per_digit = max(1, math.ceil(max_samples / 10))
    chosen = []
    counts = Counter()

    for sample in samples:
        label = sample["true"]
        if counts[label] >= per_digit:
            continue
        chosen.append(sample)
        counts[label] += 1
        if len(chosen) == max_samples:
            return chosen

    chosen_indexes = {sample["index"] for sample in chosen}
    for sample in samples:
        if sample["index"] in chosen_indexes:
            continue
        chosen.append(sample)
        if len(chosen) == max_samples:
            break

    return chosen


def plot_prediction_grid(samples, output_path, title, max_samples=16):
    if not samples:
        print(f"   ℹ️  跳过 {output_path.name}: 没有样本")
        return

    selected = samples[:max_samples]
    fig, axes = make_grid_axes(len(selected), cols=4, cell_width=3.0, cell_height=3.1)

    for ax, sample in zip(axes, selected):
        is_correct = sample["true"] == sample["pred"]
        title_color = "forestgreen" if is_correct else "crimson"
        ax.imshow(denormalize_image(sample["image"]), cmap="gray", vmin=0, vmax=1)
        ax.set_title(
            f"#{sample['index']}  T:{sample['true']}  P:{sample['pred']}\n"
            f"confidence: {sample['confidence']:.1%}",
            color=title_color,
            fontsize=10,
        )
        ax.axis("off")

    for ax in axes[len(selected) :]:
        ax.axis("off")

    fig.suptitle(title, fontsize=14)
    fig.tight_layout(rect=[0, 0, 1, 0.96])
    save_figure(fig, output_path)


def plot_probability_bars(samples, output_path, title, max_samples=6):
    if not samples:
        print(f"   ℹ️  跳过 {output_path.name}: 没有样本")
        return

    selected = samples[:max_samples]
    fig, axes = plt.subplots(len(selected), 1, figsize=(8, 2.2 * len(selected)))
    axes = np.array(axes, dtype=object).reshape(-1)

    for ax, sample in zip(axes, selected):
        probabilities = sample["probs"].numpy()
        colors = ["#8da0cb"] * 10
        colors[sample["pred"]] = "#2ca25f" if sample["pred"] == sample["true"] else "#de2d26"
        colors[sample["true"]] = "#31a354"

        ax.bar(range(10), probabilities, color=colors)
        ax.set_ylim(0, 1)
        ax.set_xticks(range(10))
        ax.set_ylabel("prob.")
        ax.set_title(
            f"#{sample['index']}  true={sample['true']}  pred={sample['pred']}  "
            f"confidence={sample['confidence']:.1%}",
            fontsize=10,
        )
        ax.grid(axis="y", alpha=0.25)

    fig.suptitle(title, fontsize=14)
    fig.tight_layout(rect=[0, 0, 1, 0.95])
    save_figure(fig, output_path)


def plot_confusion_matrix(confusion, output_path):
    matrix = confusion.numpy()
    fig, ax = plt.subplots(figsize=(8, 7))
    image = ax.imshow(matrix, cmap="Blues")
    fig.colorbar(image, ax=ax, fraction=0.046, pad=0.04)

    ax.set_title("Confusion Matrix")
    ax.set_xlabel("Predicted label")
    ax.set_ylabel("True label")
    ax.set_xticks(range(10))
    ax.set_yticks(range(10))

    threshold = matrix.max() * 0.55 if matrix.size else 0
    for row in range(10):
        for col in range(10):
            value = int(matrix[row, col])
            if value == 0:
                continue
            color = "white" if value > threshold else "black"
            ax.text(col, row, str(value), ha="center", va="center", color=color, fontsize=8)

    fig.tight_layout()
    save_figure(fig, output_path)


def plot_error_summary(wrong_samples, output_path):
    if not wrong_samples:
        print(f"   ℹ️  跳过 {output_path.name}: 没有错误样本")
        return

    counts = Counter((sample["true"], sample["pred"]) for sample in wrong_samples)
    top_errors = counts.most_common(10)
    labels = [f"{true}->{pred}" for (true, pred), _ in top_errors]
    values = [count for _, count in top_errors]

    fig, ax = plt.subplots(figsize=(8, 4.8))
    ax.barh(labels[::-1], values[::-1], color="#de2d26")
    ax.set_title("Top Misclassification Types")
    ax.set_xlabel("count")
    ax.grid(axis="x", alpha=0.25)
    fig.tight_layout()
    save_figure(fig, output_path)


def plot_channel_grid(channels, output_path, title, max_items, cols=4, cmap="viridis", symmetric=False):
    if channels.ndim != 3:
        print(f"   ℹ️  跳过 {output_path.name}: 张量形状不是 [C,H,W]")
        return

    count = min(max_items, channels.shape[0])
    fig, axes = make_grid_axes(count, cols=cols, cell_width=2.2, cell_height=2.4)

    for idx, ax in enumerate(axes[:count]):
        channel = channels[idx].detach().cpu()
        if symmetric:
            abs_max = max(abs(float(channel.min())), abs(float(channel.max())), 1e-8)
            ax.imshow(channel.numpy(), cmap=cmap, vmin=-abs_max, vmax=abs_max)
        else:
            ax.imshow(normalize_map(channel), cmap=cmap)
        ax.set_title(f"{idx}", fontsize=8)
        ax.axis("off")

    for ax in axes[count:]:
        ax.axis("off")

    fig.suptitle(title, fontsize=14)
    fig.tight_layout(rect=[0, 0, 1, 0.95])
    save_figure(fig, output_path)


def plot_conv_filters(model, output_dir, prefix, max_filters):
    conv_layers = [(name, layer) for name, layer in model.named_modules() if isinstance(layer, nn.Conv2d)]
    if not conv_layers:
        print("   ℹ️  没有找到卷积层，跳过卷积核可视化")
        return

    for layer_idx, (name, layer) in enumerate(conv_layers[:2], start=1):
        weights = layer.weight.detach().cpu()
        if weights.shape[1] == 1:
            filters = weights[:, 0]
            subtitle = "input channel 0"
        else:
            filters = weights.mean(dim=1)
            subtitle = "mean over input channels"

        layer_name = name.replace(".", "_")
        output_path = output_dir / f"{prefix}{layer_name}_filters.png"
        plot_channel_grid(
            filters,
            output_path,
            f"Conv{layer_idx} Filters ({subtitle})",
            max_items=max_filters,
            cols=8,
            cmap="coolwarm",
            symmetric=True,
        )


def extract_feature_maps(model, image, device):
    if not hasattr(model, "conv1") or not hasattr(model, "conv2"):
        return {}

    model.eval()
    features = {}

    with torch.no_grad():
        x = image.unsqueeze(0).to(device)

        x = model.conv1(x)
        if hasattr(model, "bn1"):
            x = model.bn1(x)
        x = F.relu(x)
        features["conv1_relu"] = x.squeeze(0).detach().cpu()

        x = F.max_pool2d(x, 2)
        x = model.conv2(x)
        if hasattr(model, "bn2"):
            x = model.bn2(x)
        x = F.relu(x)
        features["conv2_relu"] = x.squeeze(0).detach().cpu()

    return features


def plot_feature_maps(model, sample, output_dir, prefix, device, max_feature_maps):
    features = extract_feature_maps(model, sample["image"], device)
    if not features:
        print("   ℹ️  当前模型结构不支持特征图可视化")
        return

    for layer_name, feature_maps in features.items():
        output_path = output_dir / f"{prefix}{layer_name}_feature_maps.png"
        plot_channel_grid(
            feature_maps,
            output_path,
            (
                f"{layer_name} Feature Maps "
                f"(sample #{sample['index']}, true={sample['true']}, pred={sample['pred']})"
            ),
            max_items=max_feature_maps,
            cols=4,
            cmap="viridis",
        )


def print_error_summary(wrong_samples):
    if not wrong_samples:
        print("   ✅ 没有错误样本")
        return

    counts = Counter((sample["true"], sample["pred"]) for sample in wrong_samples)
    top_items = ", ".join(f"{true}->{pred}: {count}" for (true, pred), count in counts.most_common(5))
    print(f"   常见错误: {top_items}")


def visualize_model(model_info, model, test_loader, output_dir, device, args):
    samples, confusion, accuracy = collect_predictions(model, test_loader, device)
    correct_samples = [sample for sample in samples if sample["true"] == sample["pred"]]
    wrong_samples = [sample for sample in samples if sample["true"] != sample["pred"]]
    wrong_by_confidence = sorted(wrong_samples, key=lambda sample: sample["confidence"], reverse=True)
    correct_by_confidence = sorted(correct_samples, key=lambda sample: sample["confidence"], reverse=True)

    print(f"   📊 测试集准确率: {accuracy:.2f}%")
    print(f"   ✅ 正确样本: {len(correct_samples)}")
    print(f"   ❌ 错误样本: {len(wrong_samples)}")
    print_error_summary(wrong_samples)

    prefix = model_info["prefix"]
    balanced_correct = select_balanced_samples(correct_samples, args.max_samples)
    probability_samples = wrong_by_confidence[:3] + correct_by_confidence[: max(0, 6 - len(wrong_by_confidence[:3]))]
    feature_sample = balanced_correct[0] if balanced_correct else samples[0]

    print("\n   生成可视化图表...")
    plot_prediction_grid(
        samples,
        output_dir / f"{prefix}prediction_overview.png",
        "Prediction Overview (green=correct, red=wrong)",
        max_samples=args.max_samples,
    )
    plot_prediction_grid(
        balanced_correct,
        output_dir / f"{prefix}correct_predictions.png",
        "Correct Prediction Samples",
        max_samples=args.max_samples,
    )
    plot_prediction_grid(
        wrong_by_confidence,
        output_dir / f"{prefix}wrong_predictions.png",
        "Wrong Prediction Samples (sorted by confidence)",
        max_samples=args.max_samples,
    )
    plot_probability_bars(
        probability_samples,
        output_dir / f"{prefix}prediction_probabilities.png",
        "Prediction Probabilities",
        max_samples=6,
    )
    plot_confusion_matrix(confusion, output_dir / f"{prefix}confusion_matrix.png")
    plot_error_summary(wrong_samples, output_dir / f"{prefix}error_summary.png")
    plot_conv_filters(model, output_dir, prefix, args.max_filters)
    plot_feature_maps(model, feature_sample, output_dir, prefix, device, args.max_feature_maps)


def main():
    args = parse_args()
    device = get_device(args.device)
    output_dir = resolve_output_dir(args.output_dir)

    print("=== MNIST CNN 可视化工具 ===\n")
    print(f"项目目录: {PROJECT_ROOT}")
    print(f"输出目录: {output_dir}")
    print(f"运行设备: {device}\n")

    print("📦 加载测试数据...")
    try:
        test_data, test_loader = get_test_data(args.batch_size, args.download)
    except RuntimeError as exc:
        print(f"❌ {exc}")
        return 1
    print(f"   测试集: {len(test_data)} 张\n")

    print("🔍 检查可用的模型文件...")
    models_to_viz = discover_models(args.model)
    if not models_to_viz:
        print("❌ 没有找到训练好的模型文件。")
        print("   请先训练模型，或用 --model 指定 .pth/.pt 文件。")
        return 1

    loaded_count = 0
    for model_info in models_to_viz:
        print(f"\n{'=' * 60}")
        print(f"📈 可视化: {model_info['name']} ({model_info['path'].name})")
        print(f"{'=' * 60}")

        model = load_model(model_info, device)
        if model is None:
            continue

        visualize_model(model_info, model, test_loader, output_dir, device, args)
        loaded_count += 1
        print(f"\n   ✅ {model_info['name']} 可视化完成")

    if loaded_count == 0:
        print("\n❌ 找到了模型文件，但没有任何模型成功加载。")
        return 1

    print(f"\n{'=' * 60}")
    print("🎉 所有可视化完成")
    print(f"{'=' * 60}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
