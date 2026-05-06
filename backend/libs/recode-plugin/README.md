# Arteo Re-Code Plugin V4 🚀

**Re-Code** là một Domain-Specific Language (DSL) siêu nhẹ, an toàn và dễ học, được thiết kế đặc biệt để xây dựng các thuật toán phân tích nội dung, nhận diện ngữ cảnh và mô phỏng hội thoại (Bot). 

Phiên bản **V4** mang đến cuộc cách mạng về Abstract Syntax Tree (AST), loại bỏ hoàn toàn `eval()`, hỗ trợ toán học phức tạp và nội suy chuỗi (String Interpolation).

---

## Tính năng nổi bật V4 ✨

- 🔒 **An toàn tuyệt đối:** Sử dụng AST Custom Evaluator, không sử dụng `new Function()` hay `eval()`, chống injection 100%.
- 🧮 **Toán học & Logic:** Hỗ trợ đầy đủ các phép toán `+`, `-`, `*`, `/` và logic `&&`, `||`, `!`, `>`, `<`, `==`.
- 💬 **Nội Suy Chuỗi (String Interpolation):** Nhúng trực tiếp biến vào chuỗi lệnh log/emit bằng cú pháp `${var_name}`.
- 📦 **Nested Object:** Truy xuất object sâu an toàn (VD: `post.author.name`).
- 🤖 **Micro-Blocks Logic:** Viết thuật toán kiểu khối (Block) siêu dễ đọc như `if...else`, `loop`, `set`.

---

## Cài đặt & Sử dụng 🛠️

```bash
# Clone repository
git clone https://github.com/arteoapp/Re-Code-Plugin.git
cd Re-Code-Plugin

# Cài đặt dependency (nếu cần phát triển thêm)
npm install

# Chạy thử bộ thuật toán 10 Block V4
npm run test

# Chạy thử mô phỏng Bot Chat 12 Blocks
npm run test:conversation
```

---

## Cú pháp cơ bản (Syntax) 📖

### 1. Khai báo biến và Toán học
Bạn có thể dùng lệnh `set` kèm mọi phép tính phức tạp.
```recode
set score = 10 + 5 * 2
set penalty = score / 3
```

### 2. Logic If/Else & Nested Logic
```recode
if post.like_count > 100 && post.share_count >= 10 {
    boost 50
    log "Bài viết cực hot!"
} else {
    penalty 10
}
```

### 3. String Interpolation (Nội suy chuỗi)
Dễ dàng in ra giá trị động:
```recode
set user_name = "Steve"
log "Xin chào sếp ${user_name}, bài viết của sếp có ${post.like_count} lượt thích!"
```

### 4. Vòng lặp
```recode
set bonus = 0
loop 5 {
    set bonus = bonus + 2
}
```

---

## Cấu trúc thư mục 📁

- `src/parser.js`: Core engine biên dịch và phân tích AST.
- `tests/`: 
  - `test_v4_algorithms.recode`: File test thuật toán V4.
  - `conversation_12_blocks.recode`: File test bot trò chuyện.
  - `recognition.recode`: File test nhận diện nội dung cơ bản.

---

## Giấy phép (License) 📄
Dự án được phân phối dưới giấy phép [MIT](LICENSE).
