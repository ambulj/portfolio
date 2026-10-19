#!/usr/bin/env python3
"""
scripts/generate-threat-model.py
Trains a calibrated 6-feature MLP threat anomaly detection model with embedded in-graph normalization,
and exports it to ONNX format (threat-anomaly-v1.onnx).
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# Set deterministic seed
torch.manual_seed(42)
np.random.seed(42)

# Features:
# 0: duration (s) [0.01 - 60.0]
# 1: src_bytes (B) [0 - 100,000]
# 2: dst_bytes (B) [0 - 500,000]
# 3: failed_logins [0 - 20]
# 4: packet_rate (pps) [1 - 10,000]
# 5: entropy (bits/B) [0.0 - 8.0]

def generate_synthetic_data(n_samples=10000):
    n_benign = int(n_samples * 0.8)
    n_attack = n_samples - n_benign

    # Benign data: low failed logins, normal packet rates, moderate entropy, normal byte ratios
    benign_duration = np.random.uniform(0.1, 15.0, size=(n_benign, 1))
    benign_src_bytes = np.random.uniform(200, 15000, size=(n_benign, 1))
    benign_dst_bytes = np.random.uniform(500, 60000, size=(n_benign, 1))
    benign_logins = np.random.choice([0, 1], size=(n_benign, 1), p=[0.95, 0.05])
    benign_packet_rate = np.random.uniform(5, 120, size=(n_benign, 1))
    benign_entropy = np.random.uniform(3.0, 5.5, size=(n_benign, 1))

    X_benign = np.hstack([
        benign_duration,
        benign_src_bytes,
        benign_dst_bytes,
        benign_logins,
        benign_packet_rate,
        benign_entropy
    ])
    y_benign = np.zeros((n_benign, 1), dtype=np.int64)

    # Attack data:
    # 1. SSH Brute Force (high failed logins)
    # 2. C2 Data Exfil (very high src_bytes, high duration, high entropy)
    # 3. SYN Flood DDoS (very high packet rate, high src_bytes, 0 dst_bytes, low entropy)
    # 4. Port Scan / Recon (short duration, low bytes, high failed attempts or packet burst)
    n_ssh = n_attack // 4
    n_c2 = n_attack // 4
    n_ddos = n_attack // 4
    n_scan = n_attack - (n_ssh + n_c2 + n_ddos)

    # SSH Brute Force
    ssh_duration = np.random.uniform(0.2, 5.0, size=(n_ssh, 1))
    ssh_src_bytes = np.random.uniform(100, 2000, size=(n_ssh, 1))
    ssh_dst_bytes = np.random.uniform(200, 3000, size=(n_ssh, 1))
    ssh_logins = np.random.randint(5, 20, size=(n_ssh, 1))
    ssh_packet_rate = np.random.uniform(20, 200, size=(n_ssh, 1))
    ssh_entropy = np.random.uniform(3.0, 4.5, size=(n_ssh, 1))
    X_ssh = np.hstack([ssh_duration, ssh_src_bytes, ssh_dst_bytes, ssh_logins, ssh_packet_rate, ssh_entropy])

    # C2 Exfil
    c2_duration = np.random.uniform(20.0, 60.0, size=(n_c2, 1))
    c2_src_bytes = np.random.uniform(50000, 100000, size=(n_c2, 1))
    c2_dst_bytes = np.random.uniform(500, 5000, size=(n_c2, 1))
    c2_logins = np.zeros((n_c2, 1))
    c2_packet_rate = np.random.uniform(100, 800, size=(n_c2, 1))
    c2_entropy = np.random.uniform(7.2, 8.0, size=(n_c2, 1))
    X_c2 = np.hstack([c2_duration, c2_src_bytes, c2_dst_bytes, c2_logins, c2_packet_rate, c2_entropy])

    # SYN Flood DDoS
    ddos_duration = np.random.uniform(1.0, 10.0, size=(n_ddos, 1))
    ddos_src_bytes = np.random.uniform(60000, 100000, size=(n_ddos, 1))
    ddos_dst_bytes = np.zeros((n_ddos, 1))
    ddos_logins = np.zeros((n_ddos, 1))
    ddos_packet_rate = np.random.uniform(5000, 10000, size=(n_ddos, 1))
    ddos_entropy = np.random.uniform(1.0, 2.5, size=(n_ddos, 1))
    X_ddos = np.hstack([ddos_duration, ddos_src_bytes, ddos_dst_bytes, ddos_logins, ddos_packet_rate, ddos_entropy])

    # Port Scan
    scan_duration = np.random.uniform(0.01, 1.0, size=(n_scan, 1))
    scan_src_bytes = np.random.uniform(50, 500, size=(n_scan, 1))
    scan_dst_bytes = np.random.uniform(0, 100, size=(n_scan, 1))
    scan_logins = np.random.randint(2, 8, size=(n_scan, 1))
    scan_packet_rate = np.random.uniform(1000, 4000, size=(n_scan, 1))
    scan_entropy = np.random.uniform(1.5, 3.0, size=(n_scan, 1))
    X_scan = np.hstack([scan_duration, scan_src_bytes, scan_dst_bytes, scan_logins, scan_packet_rate, scan_entropy])

    X_attack = np.vstack([X_ssh, X_c2, X_ddos, X_scan])
    y_attack = np.ones((n_attack, 1), dtype=np.int64)

    X = np.vstack([X_benign, X_attack]).astype(np.float32)
    y = np.vstack([y_benign, y_attack]).squeeze().astype(np.int64)

    # Shuffle
    indices = np.random.permutation(n_samples)
    return X[indices], y[indices]

class ThreatAnomalyDetector(nn.Module):
    def __init__(self, means, stds):
        super().__init__()
        # In-graph normalization buffers (non-trainable)
        self.register_buffer("means", torch.tensor(means, dtype=torch.float32))
        self.register_buffer("stds", torch.tensor(stds, dtype=torch.float32))

        self.net = nn.Sequential(
            nn.Linear(6, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 2),
            nn.Softmax(dim=-1)
        )

    def forward(self, x):
        norm_x = (x - self.means) / self.stds
        return self.net(norm_x)

def main():
    print("[*] Generating calibrated synthetic NetFlow training dataset...")
    X, y = generate_synthetic_data(10000)

    # Compute means and stds for embedded in-graph normalization
    means = np.mean(X, axis=0)
    stds = np.std(X, axis=0)
    # Prevent divide by zero
    stds = np.where(stds == 0, 1.0, stds)

    print(f"[*] Calculated Means: {means}")
    print(f"[*] Calculated Stds:  {stds}")

    model = ThreatAnomalyDetector(means, stds)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-4)

    X_tensor = torch.from_numpy(X)
    y_tensor = torch.from_numpy(y)

    print("[*] Training 6-feature MLP Threat Anomaly Detector...")
    model.train()
    for epoch in range(120):
        optimizer.zero_grad()
        out = model(X_tensor)
        loss = criterion(out, y_tensor)
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 30 == 0:
            preds = torch.argmax(out, dim=1)
            acc = (preds == y_tensor).float().mean().item() * 100
            print(f"    Epoch {epoch+1:3d}/120 - Loss: {loss.item():.4f} - Accuracy: {acc:.2f}%")

    model.eval()
    with torch.no_grad():
        final_preds = torch.argmax(model(X_tensor), dim=1)
        final_acc = (final_preds == y_tensor).float().mean().item() * 100
        print(f"[*] Training finished. Final Accuracy: {final_acc:.2f}%")

        # Test presets
        presets = {
            "BENIGN_WEB_FLOW": torch.tensor([[1.2, 1450.0, 18200.0, 0.0, 45.0, 4.2]], dtype=torch.float32),
            "SSH_BRUTE_FORCE": torch.tensor([[0.8, 420.0, 850.0, 14.0, 65.0, 3.8]], dtype=torch.float32),
            "C2_DATA_EXFIL": torch.tensor([[42.0, 86400.0, 3200.0, 0.0, 180.0, 7.85]], dtype=torch.float32),
            "SYN_FLOOD_DDOS": torch.tensor([[2.5, 92000.0, 0.0, 0.0, 8500.0, 2.1]], dtype=torch.float32),
        }

        print("\n[*] Evaluating Preset Vectors:")
        for name, tensor in presets.items():
            prob = model(tensor).numpy()[0]
            print(f"    {name:<18} -> Benign: {prob[0]:.4f}, Anomaly: {prob[1]:.4f}")

    # Export to ONNX
    output_dir = os.path.join(os.path.dirname(__file__), "..", "public", "models")
    os.makedirs(output_dir, exist_ok=True)
    onnx_path = os.path.join(output_dir, "threat-anomaly-v1.onnx")

    dummy_input = torch.randn(1, 6, dtype=torch.float32)

    print(f"\n[*] Exporting to ONNX at {onnx_path}...")
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["probabilities"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "probabilities": {0: "batch_size"}
        }
    )

    file_size = os.path.getsize(onnx_path)
    print(f"[+] ONNX export successful! File size: {file_size} bytes ({file_size / 1024:.2f} KB)")
    assert file_size < 10240, f"Model file size {file_size} exceeds 10 KB budget!"

if __name__ == "__main__":
    main()
