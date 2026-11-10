# Project Coding Rules (`nest-base`)

Mọi đoạn code tạo mới hoặc chỉnh sửa trong dự án này **bắt buộc** tuân thủ nghiêm ngặt 3 nguyên tắc cốt lõi sau:

---

## 1. Code luôn minh bạch, rõ ràng và dễ hiểu
- **Đặt tên tường minh:** Tên biến, hàm, class, DTO phải diễn tả đúng bản chất nghiệp vụ; tránh viết tắt tối nghĩa (`usr`, `dt`, ` tmp`, `res1`).
- **Đơn nhiệm (Single Responsibility):** Mỗi hàm/method chỉ làm một việc rõ ràng, giữ độ dài ngắn gọn, ưu tiên `early return` thay vì lồng `if/else` nhiều tầng.
- **Không dùng Magic Numbers / Strings:** Đưa các hằng số, enum, cấu hình ra biến có tên rõ nghĩa hoặc file config/constants.
- **Khai báo kiểu trả về rõ ràng:** Các public method trong `Controller` và `Service` nên khai báo rõ kiểu trả về (ví dụ `Promise<UserResponseDto>`).

---

## 2. Tuyệt đối KHÔNG sử dụng `any` trong TypeScript
- **Nghiêm cấm `any`** dưới mọi hình thức (`: any`, `as any`, `Record<string, any>`, `Promise<any>`), kể cả trong file test.
- Khi chưa biết trước kiểu dữ liệu (ví dụ dữ liệu từ bên ngoài hoặc biến `error` trong `catch`), **bắt buộc dùng `unknown`** kết hợp thu hẹp kiểu (type guard, `instanceof`, hoặc schema validation như `zod` / `class-validator`).
- Ưu tiên dùng Generic (`<T>`), Union types, `Record<string, unknown>`, hoặc interface/type cụ thể.

**Sai:**
```ts
function parsePayload(data: any): any {
  return data.user;
}
```

**Đúng:**
```ts
interface Payload {
  user: UserDto;
}

function parsePayload(data: Payload): UserDto {
  return data.user;
}
```

---

## 3. Sử dụng `try / catch` bắt buộc phải `throw` lỗi — Không được nuốt lỗi
- **Tuyệt đối không nuốt lỗi (swallow error):** Cấm để khối `catch` rỗng, chỉ `console.log` rồi bỏ qua, hoặc gán giá trị giả để che giấu lỗi hệ thống.
- Nếu không cần xử lý đặc biệt (ghi log ngữ cảnh, dọn tài nguyên, hoặc chuyển đổi sang HttpException phù hợp của NestJS), **không bọc `try / catch` thừa** mà để lỗi tự nổi lên Global Exception Filter.
- Khi dùng `try / catch`, khối `catch (error: unknown)` **bắt buộc phải `throw`** lại lỗi gốc hoặc `throw` một Exception tường minh (kèm `{ cause: error }` để giữ nguyên stack trace gốc).

**Sai (nuốt lỗi):**
```ts
try {
  await this.dataSource.query('SELECT 1');
} catch (error) {
  console.error(error);
  return null;
}
```

**Đúng (giữ nguyên nguyên nhân gốc và throw tường minh):**
```ts
try {
  await this.dataSource.query('SELECT 1');
} catch (error: unknown) {
  throw new ServiceUnavailableException('Database connection check failed', {
    cause: error,
  });
}
```
