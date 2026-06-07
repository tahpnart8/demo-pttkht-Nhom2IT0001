import pypdf
import sys

pdf_path = r"c:\Users\User\Downloads\PTTKHT\IT0001-Nhóm-2-Phân-tích-và-Thiết-kế-Hệ-thống-Thông-tin-Quản-lý-Bán-hàng-POS-và-Điều-hành-nội-bộ-cho-quán-cà-phê-Nhà-Ba-Teria (1).pdf"
out_path = r"c:\Users\User\Downloads\PTTKHT\pdf_text.txt"

try:
    with open(pdf_path, 'rb') as f:
        reader = pypdf.PdfReader(f)
        text = ""
        for i in range(len(reader.pages)):
            text += f"\n--- Page {i+1} ---\n"
            text += reader.pages[i].extract_text()

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Done extracting PDF")
except Exception as e:
    print(f"Error: {e}")
