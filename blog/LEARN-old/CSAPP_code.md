---
title: CSAPP-汇编代码题
date: 2026-06-27
category: CSAPP
description: 从看懂指令到反推 C 代码。
tags: [CSAPP, 学习笔记]
---

# CSAPP 汇编代码题 — 从看懂指令到反推 C 代码

> 适用：从零开始学看汇编。本文覆盖所有考试中出现的汇编题型，逐步建立从"读指令"到"反推 C 代码"的完整能力。

---

## 第一部分：建立心智模型

### 汇编是什么？

C 代码 → 编译器 → 汇编代码 → 汇编器 → 机器码

汇编是 C 和机器码之间的"可读中间层"。考试不要求你写汇编，但要求你能**从汇编读懂程序逻辑**。

### 你需要建立的三个视角

```
视角 1：数据在哪？
  寄存器？内存？立即数？

视角 2：做了什么运算？
  加减乘除？位运算？地址计算？

视角 3：程序流向哪里？
  顺序执行？条件跳转？函数调用？循环？
```

每次看到一行汇编，依次用这三个视角去读。下面逐个展开。

---

## 第二部分：寄存器——CPU 内部的 16 个变量

### x86-64 寄存器全表

每个寄存器有不同位宽的"别名"。**对同一个寄存器操作不同位宽，相当于只读写它的某一部分**。

```
64位       32位      16位     8位      用途约定
─────────────────────────────────────────────────
%rax      %eax      %ax      %al      返回值
%rbx      %ebx      %bx      %bl      被调用者保存
%rcx      %ecx      %cx      %cl      第4参数
%rdx      %edx      %dx      %dl      第3参数
%rsi      %esi      %si      %sil     第2参数
%rdi      %edi      %di      %dil     第1参数
%rbp      %ebp      %bp      %bpl     帧指针（可选）
%rsp      %esp      %sp      %spl     栈指针 ★
%r8       %r8d      %r8w     %r8b     第5参数
%r9       %r9d      %r9w     %r9b     第6参数
%r10-%r15 ...                          调用者保存
```

### 关键规则（考试反复出现）

**规则 1**：操作 32 位寄存器时，高 32 位**自动清零**。

```asm
movl $0x12345678, %eax    # %rax = 0x0000000012345678（高32位清零！）
movw $0x1234, %ax         # %rax 的高48位不变（操作16位不清零高位）
movb $0x12, %al           # %rax 的高56位不变
```

**规则 2**：`%ebx` 就是 `%rbx` 的低 32 位。不是两个不同的寄存器。

**规则 3**：函数参数传递顺序（x86-64）：
```
第1参→%rdi  第2参→%rsi  第3参→%rdx
第4参→%rcx  第5参→%r8   第6参→%r9
超过6个的参数通过栈传递
返回值→%rax
```

**题外**：IA32（32位）的参数通过栈传递，看到 `8(%ebp)` 就是第一个参数，`12(%ebp)` 是第二个...考试如果出现 IA32 汇编，参数在 `8(%ebp)`, `12(%ebp)`, `16(%ebp)`。

### 看到任何汇编函数，第一件事：标注参数和返回值

```asm
# on entry: %rdi = x, %rsi = y, %rdx = z
```

考试通常会给出这样的注释。如果没有，自己推理：
- `%rdi` 被使用 = 可能有第一个参数
- `%rax` 最后被设置 = 返回值

---

## 第三部分：指令解码——把任何指令翻译成人话

### 3.1 数据传送类

```asm
movq S, D     # D = S（64位）
movl S, D     # D = S（32位，高32位清零）
movw S, D     # D = S（16位）
movb S, D     # D = S（8位）

movzbw S, D   # D = 零扩展(S)（8→16位）
movsbl S, D   # D = 符号扩展(S)（8→32位）
movslq S, D   # D = 符号扩展(S)（32→64位）
```

### 3.2 算术类

```asm
addq S, D     # D = D + S
subq S, D     # D = D - S
imulq S, D    # D = D * S（有符号乘法）
andq S, D     # D = D & S
orq  S, D     # D = D | S
xorq S, D     # D = D ^ S

incq D        # D = D + 1
decq D        # D = D - 1
negq D        # D = -D
notq D        # D = ~D

salq k, D     # D = D << k（左移）
sarq k, D     # D = D >> k（算术右移，补符号位）
shrq k, D     # D = D >> k（逻辑右移，补0）
```

### 3.3 lea——最容易被误解的指令 ★

```asm
leaq S, D     # D = 地址表达式(S)，不访问内存
```

**lea 和 mov 的本质区别**：

```asm
# 假设 %rax = 0x200，内存 0x200 处存的是 0xFF

movq (%rax), %rbx     # %rbx = M[%rax] = M[0x200] = 0xFF（读了内存）
leaq (%rax), %rbx     # %rbx = %rax = 0x200（只是复制值，没读内存）
leaq (%rax, %rax, 2), %rbx  # %rbx = %rax * 3（纯算术，没读内存！）
```

**lea 的真正威力是把寻址模式当计算器用**：

```asm
leaq (%rdi, %rsi, 2), %rax   # %rax = %rdi + 2 * %rsi
leaq 9(%rdi, %rsi), %rax     # %rax = 9 + %rdi + %rsi
leaq (%rdi, %rdi, 1), %rax   # %rax = 2 * %rdi
```

考试喜欢考 lea 对应什么 C 表达式。

### 3.4 比较与测试

```asm
cmpq S2, S1    # 计算 S1 - S2，只设条件码，不存结果
testq S2, S1   # 计算 S1 & S2，只设条件码，不存结果
```

这两个指令**不修改任何寄存器**，只影响条件码（ZF, SF, CF, OF）。

### 3.5 条件跳转

```asm
je  target    # ZF=1 时跳转（相等/为零）
jne target    # ZF=0 时跳转（不等/非零）
js  target    # SF=1 时跳转（负数）
jns target    # SF=0 时跳转（非负）
jg  target    # 有符号大于时跳转
jge target    # 有符号大于等于
jl  target    # 有符号小于
jle target    # 有符号小于等于
ja  target    # 无符号大于
jb  target    # 无符号小于
jmp target    # 无条件跳转
```

**条件跳转的经典配对**：

```asm
cmpq %rdi, %rsi    # 计算 rsi - rdi
jg  .L_greater     # 如果 rsi > rdi（有符号），跳转
```

```asm
testq %rax, %rax   # 计算 rax & rax
je   .L_zero       # 如果 rax == 0，跳转
```

### 3.6 函数调用与返回

```asm
call func    # 压入返回地址，跳转到 func
ret          # 弹出返回地址，跳回
pushq S      # rsp -= 8; M[rsp] = S
popq D       # D = M[rsp]; rsp += 8
```

---

## 第四部分：寻址模式——汇编中最复杂的部分 ★

这是考试中分值最重的计算点。

### 通用格式

```
Imm(rb, ri, s)

含义：M[ Imm + R[rb] + R[ri] × s ]

Imm: 立即数偏移（可省略）
rb:  基址寄存器（可省略）
ri:  变址寄存器（可省略）
s:   比例因子 = 1, 2, 4, 8（可省略，需配合 ri）
```

### 所有合法形式（背下来，考场上直接套）

| 汇编写法 | 含义 | 相当于 C |
|----------|------|----------|
| `$0x204` | 就是值 0x204 | 常量 |
| `%eax` | R[%eax] | 变量 |
| `(%eax)` | M[R[%eax]] | `*p` |
| `0x204` | M[0x204] | `*(0x204)` |
| `0x1fc(,%ecx,4)` | M[0x1fc + R[%ecx]×4] | `*(0x1fc + ecx*4)` |
| `(%eax,%edx,4)` | M[R[%eax] + R[%edx]×4] | `*(eax + edx*4)` |
| `1(%eax,%edx)` | M[1 + R[%eax] + R[%edx]] | `*(1 + eax + edx)` |
| `516(%ecx,%edx)` | M[516 + R[%ecx] + R[%edx]] | `*(516 + ecx + edx)` |
| `8(%ebp)` | M[R[%ebp] + 8] | `*(ebp + 8)` |

### 做题时怎么快速心算

三步法：
1. 取出 Imm、rb、ri、s
2. 把寄存器的**当前值**代入
3. 计算总地址 → 查内存表

---

## 第五部分：汇编→C 反推方法论

考试中最难的大题就是给你一段汇编，让你补充 C 代码空缺。这里给出系统性的方法。

### 五步反推法

```
步骤 1：标注入口
  → 看函数开头的注释或 push/mov 模式，确定参数映射
  → %rdi=?  %rsi=?  %rdx=?  返回值最后在 %rax

步骤 2：识别结构
  → 有 cmp + jmp 回跳 = 循环（for/while）
  → 有 cmp + ja/jbe + jmp 表 = switch
  → 有 cmp + 条件跳转 = if-else
  → 有 call 自己 = 递归

步骤 3：逐块翻译
  → 每块从标签到跳转，翻译为 C 的一个操作

步骤 4：确定变量
  → 哪个寄存器一直在维护什么值？
  → 初始值是什么？（xorl %eax,%eax = 置零）

步骤 5：拼合验证
  → 把你的 C 代码的逻辑和汇编逐行对照
```

---

## 第六部分：题型分类精讲

### 题型一：寻址计算（直接套公式）

**特征**：给出一张寄存器值表和内存值表，求各种寻址模式下的操作数值。

**题目**（2015-2016 期中第三大题）：

| 存储器地址 | 值 | 寄存器 | 值 |
|-----------|-----|--------|-----|
| 0x200 | 0xFF | %eax | 0x200 |
| 0x204 | 0xAB | %ecx | 0x1 |
| 0x208 | 0x13 | %edx | 0x3 |
| 0x20c | 0x11 | | |

求各操作数的值：

```
操作数              │ 计算过程                    │ 答案
────────────────────┼─────────────────────────────┼──────
%eax               │ 直接读寄存器                 │ 0x200
(%eax)             │ M[R[%eax]] = M[0x200]       │ 0xFF
0x204              │ M[0x204]                    │ 0xAB
$0x204             │ 立即数就是它本身             │ 0x204
0x1fc(,%ecx,4)     │ M[0x1FC + 1×4] = M[0x200]   │ 0xFF
(%eax,%edx,4)      │ M[0x200 + 3×4] = M[0x20C]   │ 0x11
1(%eax,%edx)       │ M[1 + 0x200 + 3] = M[0x204]  │ 0xAB
516(%ecx,%edx)     │ 516=0x204, M[0x204+1+3]=M[0x208] │ 0x13
```

**做题技巧**：516 是十进制，先转十六进制 → `516 = 0x204`。然后 `0x204 + 1 + 3 = 0x208`。

---

### 题型二：lea 表达式识别

**特征**：给出 `leaX S, D`，问你它等价于什么 C 表达式。

**核心认知**：lea **不访问内存**，只是把地址计算的结果存到寄存器。所以它等价于**纯算术表达式**。

**题目**：

```asm
# 假设 %eax = x, %ecx = y

leal (%eax,%ecx,2), %edx     →  %edx = ?  答案：x + 2y

leal 9(%eax,%ecx,2), %edx    →  %edx = ?  答案：9 + x + 2y

lea 0xffffffff(%esi), %eax   →  %eax = ?
# 0xffffffff 是 32 位 -1 的补码
# 所以 %eax = %esi - 1
# 对应 C: eax = esi - 1
```

**记忆**：`lea Imm(rb, ri, s), D` = `D = Imm + rb + ri*s`

---

### 题型三：从汇编反推 C 代码（完整函数）★

这是最大、最重要的题型。考试四年出现了至少 4 道。

#### 例题 A：循环函数（2018-2019 期中第五题）

**汇编**：

```asm
# on entry: %edi = n, %rsi = a（数组指针）

looper:
    xorl %eax, %eax          # (1)
    xorl %ecx, %ecx          # (2)
    jmp .L25                 # (3)

.L27:
    movl (%rsi,%rcx,4), %edx # (4) edx = a[i]
    cmpl %eax, %edx          # (5) 比较 a[i] 和 x
    jle .L28                 # (6) if a[i] <= x → 跳
    movl %edx, %eax          # (7) x = a[i]

.L28:
    incl %eax                # (8) x++
    incl %ecx                # (9) i++

.L25:
    cmpl %edi, %ecx          # (10) 比较 i 和 n
    jl .L27                  # (11) if i < n → 回跳

    ret                      # (12) 返回 %eax
```

**逐步翻译**：

(1) `xorl %eax,%eax` = 把 %eax 置零。%eax 通常存返回值 → 有个变量初始为 0。
(2) `xorl %ecx,%ecx` = 把 %ecx 置零。后面 `incl %ecx` → 这是循环变量 i = 0。
(3) 直接跳到条件测试 → 这是 for 循环的典型模式：先判条件再进循环体。
(4) `(%rsi,%rcx,4)` = `M[a + i*4]` = `a[i]`。%edx = a[i]。
(5-7) 比较 a[i] 和 %eax（那个初始为 0 的变量），如果 a[i] > %eax，更新 %eax。
(8) 不管前面怎样，%eax++。
(9) i++。
(10-11) `cmpl %edi,%ecx` = 比较 i 和 n（%edi 是第一个参数），`jl` = 小于则跳回。
(12) 返回 %eax。

**还原的 C 代码**：

```c
int looper(int n, int *a) {
    int i;
    int x = 0;                    // (1) xorl %eax,%eax
    for (i = 0; i < n; i++) {    // (2)(3)(9)(10)(11)
        if (a[i] > x)            // (4)(5)(6)
            x = a[i];            // (7)
        x++;                     // (8)
    }
    return x;                    // (12)
}
```

**关键技巧总结**：
- `xorl %reg, %reg` = 置零（不是异或运算的语义）
- `jmp` 在循环开头 + `cmp+jl` 在末尾 = for 循环
- `(%rsi,%rcx,4)` 中 4 是 int 的大小 → 这是数组访问 `a[i]`

---

#### 例题 B：递归函数（2017-2018 期中第五题）

**汇编**：

```asm
# on entry: %rdi = x（unsigned long）

mystery1:
    pushq %rbx               # 保存 %rbx
    movq %rdi, %rbx          # rbx = x
    movl $0, %eax            # result = 0
    testq %rdi, %rdi         # 测试 x
    je .L2                   # if x == 0, 跳转到返回
    shrq $2, %rdi            # rdi = x >> 2（作为递归参数）
    call mystery1            # rv = mystery1(x >> 2)
    addq %rbx, %rax          # return rv + x（注意 %rbx 保存了原始 x）
.L2:
    popq %rbx                # 恢复 %rbx
    ret
```

**逐步翻译**：

1. `pushq %rbx` + `movq %rdi, %rbx`：把参数 x 保存到 %rbx（因为递归调用会修改 %rdi，但原始值后面还要用）
2. `testq %rdi, %rdi; je .L2`：如果 x == 0，返回 0（%eax 已清零）
3. `shrq $2, %rdi`：`nx = x >> 2`
4. `call mystery1`：`rv = mystery1(nx)`（返回值在 %rax）
5. `addq %rbx, %rax`：返回 `rv + x`（%rbx 存的是原始 x）

**还原的 C 代码**：

```c
long mystery1(unsigned long x) {
    if (x == 0)
        return 0;
    unsigned long nx = x >> 2;
    long rv = mystery1(nx);
    return x + rv;
}
```

**递归函数识别技巧**：
- 看到 `call` 指令的目标是函数自身 → 递归
- `pushq %rbx` 保存调用者寄存器 → 说明 %rbx 的值要在递归调用后使用
- `shrq` 是右移，`$2` 表示除以 4

---

#### 例题 C：斐波那契类（2017-2018 期末第四题）

**汇编**：

```asm
# on entry: %edi = x（unsigned int）

foo:
    push %rbx
    mov %edi, %eax            # eax = x
    cmp $0x1, %edi            # 比较 x 和 1
    jbe .L521                 # if x <= 1, 跳转到返回 x

    mov $0x1, %eax            # a = 1
    mov $0x0, %ecx            # b = 0
    mov $0x2, %edx            # i = 2
.L50f:
    cmp %edi, %edx            # 比较 i 和 x
    ja .L521                  # if i > x, 跳出循环

    add %ecx, %eax            # a = a + b
    mov %eax, %ebx            # tmp = a
    sub %ecx, %ebx            # tmp = a - b（= 旧 a）
    mov %ebx, %ecx            # b = 旧 a
    inc %edx                  # i++
    cmp %edi, %edx
    jbe .L50f                 # if i <= x, 继续循环

.L521:
    pop %rbx
    ret
```

**逐步翻译**：

1. `cmp $0x1, %edi; jbe .L521`：如果 x ≤ 1，直接返回 x（此时 %eax = x）
2. 初始化：a=1, b=0, i=2
3. 循环体（执行条件 i ≤ x）：
   - `add %ecx, %eax` → `a = a + b`
   - `mov %eax, %ebx; sub %ecx, %ebx` → `tmp = a - b`（即旧 a 的值）
   - `mov %ebx, %ecx` → `b = 旧 a`
   - `inc %edx` → `i++`
4. 循环结束，返回 %eax（即 a）

实际上这是斐波那契数列的迭代版：a = F(i), b = F(i-1)，每次更新 a = a+b, b = (新 a - b) = 旧 a。

**还原的 C 代码**：

```c
int foo(unsigned int x) {
    int a, b, i;
    if (x <= 1)
        return x;
    a = 1;
    b = 0;
    for (i = 2; i <= x; i++) {
        a = a + b;
        b = a - b;   // 即旧 a
    }
    return a;
}
```

---

### 题型四：Switch 跳转表 ★

这是最有辨识度的题型——看到 `jmpq *Base(,%rax,8)` 就一定是 switch 跳转表。

#### 完整方法

**第一步**：找跳转表指令

```asm
jmpq *0x400600(,%rax,8)
```

这行等于：`goto *(0x400600 + rax * 8)`。`rax` 是 case 索引（case值 - min），`0x400600` 是跳转表基址。

**第二步**：确定 case 的有效范围

```asm
cmp $0x7, %edx     # 最大 case 值 = 7
ja  .L_default      # 超过 → default
mov %edx, %eax      # eax = z（作为索引）
```

说明：case 值范围是 0~7，`z > 7` 走 default。case 的最小值是 0。

**第三步**：列出跳转表，给每个索引分配含义

```
索引 0 → 0x4004d1    索引 1 → 0x4004c8
索引 2 → 0x4004c8    索引 3 → 0x4004be
索引 4 → 0x4004c1    索引 5 → 0x4004d7
索引 6 → 0x4004c8    索引 7 → 0x4004be
```

注意：多个索引映射到同一个地址 → 多个 case 值共用同一段代码（fall through 或同行为）。

**第四步**：分析每个目标地址的代码

```
0x4004c8（索引 1,2,6 和 ja 跳转目标）:
    mov %esi, %eax    # result = y
    ret               # break → 这显然是 default

0x4004be（索引 3,7）:
    mov %edi, %eax    # result = x
    ret               # break → case 3 和 case 7

0x4004c1（索引 4）:
    mov $0x3, %eax    # result = 3
    jmp 0x4004da      # 跳转（不是 ret！→ fall through）

0x4004d1（索引 0）:
    mov %edi, %eax    # tmp = x
    and $0x19, %eax   # result = x & 25
    ret

0x4004d7（索引 5）:
    lea (%rdi,%rdi,1), %eax   # result = 2*x
0x4004da（case 4 fall through 到达此处）:
    add %esi, %eax            # result = result + y
    ret
```

**第五步**：写成 C

注意 `0x4004c1`（case 4）的代码没有 `ret`，而是 `jmp 0x4004da` → 说明 case 4 **没有 break**，会 fall through 到 `0x4004da`。

而 `0x4004da` 是 case 5 的代码的第二部分。所以：
- case 4：`result = 3; result += y; break;`
- case 5：`result = 2*x + y; break;`

```c
int test(int x, int y, int z) {
    int result = 3;
    switch (z) {
        case 0:  result = x & 25; break;
        case 3:
        case 7:  result = x; break;
        case 5:  result = 2 * x + y; break;
        case 4:  result = 3; result += y; break;
        default: result = y;
    }
    return result;
}
```

**Switch 跳转表判断清单**：
- [ ] 找到 `cmp $N, %reg` → 确定 case 最大值
- [ ] 找到 `ja .L_default` → 确定 default 标签
- [ ] 找到 `jmpq *Table(,%reg,8)` → 确定跳转表基址
- [ ] 列出跳转表的每个条目 → 确定每个 case 的目标地址
- [ ] 标注每个目标地址的操作
- [ ] 注意 fall through（没有 ret 而是 jmp 到其他 case 的代码）

---

### 题型五：结构体偏移量计算

**特征**：汇编中出现 `Imm(%rdi)` 或 `lea Imm(%rdi), %reg` 模式，配合结构体指针。

**题目**（2018-2019 期中第七题）：

```c
struct my_struct {
    int *p;
    struct {
        int x;
        short y;
    } s;
    struct my_struct *next;
};
```

汇编：

```asm
# sp in %rdi
my_struct_init:
    movl 12(%rdi), %eax    # %eax = *(sp + 12) → sp->s.y
    movl %eax, 8(%rdi)     # *(sp + 8) = %eax → sp->s.x = sp->s.y
    leaq 8(%rdi), %rax     # %rax = &(sp->s.x)
    movq %rax, (%rdi)      # *sp = %rax → sp->p = &(sp->s.x)
    movq %rdi, 16(%rdi)    # *(sp + 16) = sp → sp->next = sp
    ret
```

**分析过程**：

1. 先确定各字段偏移：
   - `p`（指针，8字节）→ 偏移 0
   - `s.x`（int，4字节）→ 偏移 8（p 之后，需 4 字节对齐，8 满足）
   - `s.y`（short，2字节）→ 偏移 12（x 之后，2 字节对齐，12 满足）
   - `next`（指针，8字节）→ 偏移 16（需 8 字节对齐，16 满足）

2. 对照汇编：
   - `12(%rdi)` = sp + 12 → 偏移 12 是 `s.y` → `movl 12(%rdi), %eax` = `%eax = sp->s.y`
   - `8(%rdi)` = sp + 8 → 偏移 8 是 `s.x` → `movl %eax, 8(%rdi)` = `sp->s.x = sp->s.y`
   - `leaq 8(%rdi), %rax` → `%rax = sp + 8 = &(sp->s.x)`（不是读内存！这是 lea）
   - `(%rdi)` = sp + 0 → 偏移 0 是 `p` → `movq %rax, (%rdi)` = `sp->p = &(sp->s.x)`
   - `16(%rdi)` = sp + 16 → 偏移 16 是 `next` → `movq %rdi, 16(%rdi)` = `sp->next = sp`

**还原**：

```c
void my_struct_init(struct my_struct *sp) {
    sp->s.x = sp->s.y;
    sp->p = &(sp->s.x);
    sp->next = sp;
}
```

---

### 题型六：数组维度反推

**特征**：汇编中的多维数组索引计算包含 `sizeof(element) × N` 的模式，通过系数反推 N。

**题目**（2017-2018 期中第九题）：

```c
int array1[M][N];
int array2[N][M];
int copy(int i, int j) {
    array1[i][j] = array2[j][i];
}
```

汇编中的关键行（已标注注释）：

```asm
# 计算 array2[j][i] 的地址偏移
movl %ebx, %eax            # eax = j
sall $4, %eax              # eax = j * 16 = j * 4 * M → M = 4? 不对...
subl %ebx, %eax            # eax = j*16 - j = j*15
sall $2, %eax              # eax = j*15*4 = j*60 = j * sizeof(int) * M → M = 15
movl array2(%eax,%ecx,4), %eax   # array2 + 60*j + 4*i

# 计算 array1[i][j] 的地址偏移
leal (%ecx,%ecx,8), %edx   # edx = i*9
sall $2, %edx              # edx = i*9*4 = i*36 = i * sizeof(int) * N → N = 9
movl %eax, array1(%edx,%ebx,4)   # array1 + 36*i + 4*j
```

**推导**：
- `array2[j][i]` 的偏移 = `(j * M + i) * sizeof(int)` = `4M*j + 4*i`
- 汇编给出 `60*j + 4*i` → `4M = 60` → **M = 15**
- `array1[i][j]` 的偏移 = `(i * N + j) * sizeof(int)` = `4N*i + 4*j`
- 汇编给出 `36*i + 4*j` → `4N = 36` → **N = 9**

---

### 题型七：缓冲区溢出 / 栈布局

**特征**：给出输入字符串，画出栈上的字节布局（小端法）。

**题目**（2017-2018 期中第六题）：

```c
int evil_read_string() {
    int buf[2];          // 2 个 int = 8 字节
    scanf("%s", buf);    // 输入字符串到 buf
    return buf[1];       // 返回第二个 int
}
```

输入 `dr.evil`，小端法 x86。

**分析**：

1. 确定每个字符的 ASCII：
```
d = 0x64   r = 0x72   . = 0x2e   e = 0x65   v = 0x76   i = 0x69   l = 0x6c   \0 = 0x00
```

2. 画栈布局（低地址在左，高地址在右）：
```
|<------- buf[0] (4字节) ------>|<------- buf[1] (4字节) ------>|
+-----+-----+-----+-----+-----+-----+-----+-----+
| 0x64| 0x72| 0x2e| 0x65| 0x76| 0x69| 0x6c| 0x00|
+-----+-----+-----+-----+-----+-----+-----+-----+
  d     r     .     e     v     i     l    \0
```

3. 小端法读出：
- `buf[0]`：从低地址读 4 字节 → `0x652e7264`（低地址 0x64 是最低字节）
- `buf[1]`：接着读 4 字节 → `0x006c6976`

4. 函数返回 `buf[1]` → 输出 `0x6c6976`（printf 用 `%x` 打印 int）

---

## 第七部分：汇编常见模式速查表

### 初始化模式

| 汇编 | 含义 |
|------|------|
| `xorl %eax, %eax` | `x = 0` |
| `movl $0, %eax` | `x = 0`（等价但更长） |
| `movl $1, %eax` | `x = 1` |

### 比较与分支模式

| 汇编 | C 等价 |
|------|--------|
| `testq %rdi, %rdi` + `je L` | `if (x == 0) goto L` |
| `testq %rdi, %rdi` + `jne L` | `if (x != 0) goto L` |
| `cmpq %rsi, %rdi` + `jg L` | `if (x > y) goto L` |
| `cmpq %rsi, %rdi` + `jl L` | `if (x < y) goto L` |
| `cmpq $0x1, %rdi` + `jbe L` | `if (x <= 1) goto L` |

### 循环模式（for）

```asm
        movl $0, %eax        # i = 0
        jmp .L_test
.L_body:
        # 循环体
        incl %eax            # i++
.L_test:
        cmpl %edi, %eax      # cmp i, n
        jl .L_body           # i < n → continue
```

### 循环模式（while）

```asm
        jmp .L_test
.L_body:
        # 循环体
.L_test:
        cmpl ...
        jxx .L_body
```

### 数组访问模式

| 汇编 | C 等价 |
|------|--------|
| `movl (%rsi,%rcx,4), %edx` | `edx = a[i]`（a 在 %rsi，i 在 %rcx，int 4字节） |
| `movl (%rdi,%rax,8), %rbx` | `rbx = arr[idx]`（long 数组，8字节） |
| `leaq (%rax,%rax,2), %rdx` | `rdx = idx * 3`（纯算术，不是数组） |

### 函数调用模式

```asm
movq %rdi, %rsi     # 参数准备（如果 %rsi 是第二个参数）
call some_func      # 调用
# 返回后 %rax = 返回值
```

---

## 第八部分：考场检查清单

做汇编题时，逐项检查：

- [ ] **参数映射**：`%rdi` = 第1参？`%rsi` = 第2参？`%rax` = 返回值？
- [ ] **寄存器清零**：`xorl` / `movl $0` 对应什么变量的初始化？
- [ ] **lea vs mov**：有 `lea` 的地方，它不读内存，只是算地址！
- [ ] **条件跳转方向**：`jxx` 满足条件才跳，否则顺序执行
- [ ] **循环结构**：找到 `cmp` + 回跳 → 循环的测试条件
- [ ] **fall through**：`jmp` 到另一个 case 的中间 → 说明没有 break
- [ ] **比例因子**：`s=4`（int/float）、`s=8`（long/double/指针）→ 判断元素类型
- [ ] **栈操作**：`pushq` = 先减后存，`popq` = 先读后加
- [ ] **返回值**：最后设置 `%rax` 的指令是什么？

---

## 第九部分：综合练习题

### 练习 1：斐波那契变体

```asm
# on entry: %edi = n
func:
    movl $0, %eax
    movl $1, %ecx
    movl $0, %edx
    testl %edi, %edi
    jle .Lend
.Lloop:
    addl %ecx, %eax
    movl %ecx, %edx
    addl %eax, %ecx
    decl %edi
    jg .Lloop
.Lend:
    ret
```

试着写出对应的 C 代码。（提示：三个变量 a, b, 和一个递减的计数器）

### 练习 2：数组求和

```asm
# on entry: %rdi = arr, %rsi = n
sum:
    xorl %eax, %eax
    xorl %ecx, %ecx
    testl %esi, %esi
    jle .Ldone
.Lbody:
    addl (%rdi,%rcx,4), %eax
    incq %rcx
    cmpq %rsi, %rcx
    jl .Lbody
.Ldone:
    ret
```

（提示：%ecx 一直在递增，和 %rsi 比较 → 循环变量）

### 练习 3：指针遍历

```asm
# on entry: %rdi = head（链表头指针）
count:
    xorl %eax, %eax
    testq %rdi, %rdi
    je .Ldone
.Lloop:
    incl %eax
    movq (%rdi), %rdi      # 读内存，存的地址作为下一个节点
    testq %rdi, %rdi
    jne .Lloop
.Ldone:
    ret
```

（提示：`(%rdi)` = `*p` = 链表节点的 next 指针）

---

> **答案在下一节，先自己做再看。**

### 练习答案

**练习 1**：

```c
int func(int n) {
    int a = 0, b = 1, tmp;
    while (n-- > 0) {
        a = a + b;
        tmp = b;
        b = b + a;   // 实际上是 a+b 的新值再加 a? 仔细对：
                      // addl %ecx,%eax → a += b
                      // movl %ecx,%edx → tmp = b
                      // addl %eax,%ecx → b += a (此时 a 已是新值)
                      // 所以 b = 旧b + (旧a+旧b) = 旧a + 2*旧b
    }
    return a;
}
```

更准确地说，这段汇编做的是：每次迭代 `old_a = a; a = a + b; b = old_b + a;`

**练习 2**：

```c
int sum(int *arr, int n) {
    int total = 0;
    for (int i = 0; i < n; i++)
        total += arr[i];
    return total;
}
```

**练习 3**：

```c
int count(Node *head) {
    int n = 0;
    while (head != NULL) {
        n++;
        head = head->next;
    }
    return n;
}
```

关键观察：`movq (%rdi), %rdi` = `rdi = *rdi` = `head = head->next`（链表遍历的经典模式）。

---

> **最终建议**：把往年试卷中所有带汇编的题目找出来，遮住答案，用本文的五步法逐题做一遍。卡住了就看对应的题型讲解。做完 5 道以上，汇编题就不再是障碍。
