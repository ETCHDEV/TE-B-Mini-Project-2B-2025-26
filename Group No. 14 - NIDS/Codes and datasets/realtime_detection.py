from scapy.all import sniff, IP
import numpy as np
import pandas as pd
import time
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
# ─────────────────────────────────────────────
# 1. TRAIN MODEL FROM DATASET (ONE TIME)
# ─────────────────────────────────────────────
print("Training model...")
df = pd.read_csv("network_dataset.csv")
X = df.drop(columns=['label'])
y = df['label']
# Save feature names to prevent the UserWarning during inference
feature_names = X.columns.tolist()
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)
print("Model Ready ✅")
print("Starting Live Detection...\n")
# ─────────────────────────────────────────────
# 2. LIVE CAPTURE VARIABLES
# ─────────────────────────────────────────────
flow_start = time.time()
src_packets = 0
dst_packets = 0
src_bytes = 0
dst_bytes = 0
detected_intruders = set()
# ─────────────────────────────────────────────
# 3. PACKET PROCESSING
# ─────────────────────────────────────────────
def process_packet(packet):
    global src_packets, dst_packets
    global src_bytes, dst_bytes
    global flow_start
    if packet.haslayer(IP):
        src_ip = packet[IP].src
        protocol = packet[IP].proto
        pkt_len = len(packet)
        src_packets += 1
        src_bytes += pkt_len
        total_bytes = src_bytes + dst_bytes
        total_packets = src_packets + dst_packets
        flow_duration = time.time() - flow_start
        if flow_duration == 0:
            return
        bytes_per_sec = total_bytes / flow_duration
        # 1. Create raw feature list (Ensure order matches dataset features!)
        raw_features = [[
            flow_duration,
            protocol,
            src_bytes,
            dst_bytes,
            total_bytes,
            total_packets,
            src_packets,
            dst_packets,
            bytes_per_sec
        ]]
        # 2. Convert to DataFrame to eliminate the Feature Names warning
        features_df = pd.DataFrame(raw_features, columns=feature_names)
        # 3. ML prediction
        prediction = rf.predict(features_df)[0]
        # PRINT ONLY TRUE INTRUDERS
        if prediction == 1 and src_ip not in detected_intruders:
            detected_intruders.add(src_ip)
            print(f"{src_ip} IS AN INTRUDER 🚨")
        # Reset flow every 10 sec
        if flow_duration > 10:
            reset_flow()
def reset_flow():
    global src_bytes, dst_bytes
    global src_packets, dst_packets
    global flow_start
    flow_start = time.time()
    src_bytes = 0
    dst_bytes = 0
    src_packets = 0
    dst_packets = 0
# ─────────────────────────────────────────────
# 4. START SNIFFING
# ─────────────────────────────────────────────
print("Capturing packets...")
sniff(prn=process_packet, store=False)