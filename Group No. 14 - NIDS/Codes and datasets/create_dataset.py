from scapy.all import sniff, IP
import pandas as pd
import time

data = []

flow_start = time.time()

src_bytes = 0
dst_bytes = 0
src_packets = 0
dst_packets = 0

def process_packet(packet):
    global src_bytes, dst_bytes
    global src_packets, dst_packets
    global data

    if packet.haslayer(IP):

        protocol = packet[IP].proto
        packet_size = len(packet)

        src_packets += 1
        src_bytes += packet_size

        total_bytes = src_bytes + dst_bytes
        total_packets = src_packets + dst_packets

        flow_duration = time.time() - flow_start

        if flow_duration == 0:
            bytes_per_sec = 0
        else:
            bytes_per_sec = total_bytes / flow_duration

        # Simple rule for intrusion
        if bytes_per_sec > 50000 or total_packets > 200:
            label = 1
        else:
            label = 0

        row = [
            flow_duration,
            protocol,
            src_bytes,
            dst_bytes,
            total_bytes,
            total_packets,
            src_packets,
            dst_packets,
            bytes_per_sec,
            label
        ]

        data.append(row)

        print("Packets captured:", len(data))

        if len(data) >= 10000:
            save_dataset()

def save_dataset():
    df = pd.DataFrame(data, columns=[
        "flow_duration",
        "protocol",
        "src_bytes",
        "dst_bytes",
        "total_bytes",
        "total_packets",
        "src_packets",
        "dst_packets",
        "bytes_per_sec",
        "label"
    ])

    df.to_csv("network_dataset.csv", index=False)
    print("\nDataset saved as network_dataset.csv")
    exit()

print("[*] Listening for packets...")
print("[*] Press Ctrl+C to stop manually")

try:
    sniff(prn=process_packet, store=False)
except KeyboardInterrupt:
    save_dataset()