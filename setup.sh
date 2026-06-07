#!/bin/bash

# MNIST CNN 项目一键安装脚本
# 适用于 Linux / macOS / WSL

set -e  # 遇到错误立即退出

echo "======================================"
echo "  MNIST CNN 项目环境安装"
echo "======================================"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python 3，请先安装 Python"
    echo "   访问 https://www.python.org/downloads/"
    exit 1
fi

echo "✅ 找到 Python: $(python3 --version)"
echo ""

# 检查是否安装了 conda
if command -v conda &> /dev/null; then
    echo "📦 检测到 Conda，使用 Conda 创建环境..."

    # 创建 conda 环境
    echo "创建虚拟环境 'mnist'..."
    conda create -n mnist python=3.10 -y

    # 激活环境
    echo "激活环境..."
    eval "$(conda shell.bash hook)"
    conda activate mnist

    # 安装依赖
    echo "安装项目依赖..."
    pip install -r requirements.txt

    echo ""
    echo "✅ 环境安装完成！"
    echo ""
    echo "📝 启动项目的命令："
    echo "   1. 激活环境: conda activate mnist"
    echo "   2. 启动 Jupyter: jupyter notebook"

else
    echo "📦 未检测到 Conda，使用 venv 创建环境..."

    # 创建 venv 环境
    echo "创建虚拟环境..."
    python3 -m venv mnist-env

    # 激活环境
    echo "激活环境..."
    source mnist-env/bin/activate

    # 升级 pip
    echo "升级 pip..."
    pip install --upgrade pip

    # 安装依赖
    echo "安装项目依赖..."
    pip install -r requirements.txt

    echo ""
    echo "✅ 环境安装完成！"
    echo ""
    echo "📝 启动项目的命令："
    echo "   1. 激活环境: source mnist-env/bin/activate"
    echo "   2. 启动 Jupyter: jupyter notebook"
fi

echo ""
echo "======================================"
echo "  安装完成！祝学习愉快！"
echo "======================================"
