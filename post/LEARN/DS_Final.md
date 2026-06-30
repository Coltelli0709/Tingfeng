---
title: 数据结构复习
date: 2026-06-30
category: 数据结构
description: 但愿有用。
tags: [数据结构, 复习]
---

---

## 目录

1. [C++ 基础拾遗](#1-c-基础拾遗)
2. [指针、引用与动态内存](#2-指针引用与动态内存)
3. [Stack —— 栈](#3-stack--栈)
4. [Queue —— 队列](#4-queue--队列)
5. [Linked List —— 链表](#5-linked-list--链表)
6. [Recursion —— 递归与回溯](#6-recursion--递归与回溯)
7. [Polynomial —— 多项式](#7-polynomial--多项式)
8. [Template —— 模板](#8-template--模板)
9. [Sorting —— 排序](#9-sorting--排序)
10. [Hash Table —— 哈希表](#10-hash-table--哈希表)
11. [Binary Tree —— 二叉树](#11-binary-tree--二叉树)
12. [Binary Search Tree —— 二叉搜索树](#12-binary-search-tree--二叉搜索树)
13. [AVL Tree —— 平衡二叉搜索树](#13-avl-tree--平衡二叉搜索树)
14. [C++ OOP 进阶](#14-c-oop-进阶)
15. [经典错误自查表](#15-经典错误自查表)

---

## 1. C++ 基础拾遗

### 1.1 输入输出

```cpp
#include<bits/stdc++.h>
using namespace std;

int n; double d; string s;
cin >> n >> d;              // 用空格/换行分隔读入
getline(cin, s);            // 读一整行（含空格）
cout << n << " " << d;      // 连续输出

// I/O 加速（大输入时必加）
ios::sync_with_stdio(false);
cin.tie(nullptr);
```

> **注意**：`cin >>` 后接 `getline` 前必须清理换行符：
> ```cpp
> cin >> n;
> cin.ignore(numeric_limits<streamsize>::max(), '\n');
> ```

### 1.2 基本类型与常量

```cpp
int a = 2147483647;          // 2^31 - 1
long long b = 1LL << 60;     // 大整数要加 LL
const double PI = 3.1415926;
const int MOD = 1e9 + 7;
```

### 1.3 字符串处理

```cpp
string s = "hello";
s.size(); s.length();        // 长度
s.substr(pos, len);          // 子串
s.find(c);                   // 查找，返回下标或 string::npos

// 字符串流
stringstream ss(line);
string word;
while(ss >> word) { ... }
```

---

<details>
<summary>📝 题目 1-1：输入输出基础</summary>

**题目**：读入一个整数 n，再读入 n 个浮点数，用栈逆序输出。

**答案**：

```cpp
#include<bits/stdc++.h>
using namespace std;

int main(){
    int n; double t;
    stack<double> st;
    cin >> n;
    while(n--){
        cin >> t;
        st.push(t);
    }
    while(!st.empty()){
        cout << st.top() << " ";
        st.pop();
    }
    return 0;
}
```

</details>

---

## 2. 指针、引用与动态内存

### 2.1 指针基础

```cpp
char ch = 'b';
char *p = &ch;      // p 指向 ch
*p = 'm';           // 解引用修改 ch

char **p2 = &p1;    // 二级指针（指针的指针）
*p2 = &ch2;         // 通过二级指针改变一级指针的指向
```

### 2.2 引用

```cpp
int a = 5;
int &ref = a;       // ref 是 a 的别名
ref = 10;           // 等价于 a = 10

// 引用作为函数参数（可在函数内修改实参）
void swap(int &a, int &b) {
    int t = a; a = b; b = t;
}

// 引用作为返回值（避免拷贝）
int &getElement(vector<int> &v, int i) {
    return v[i];    // 返回左值引用
}
```

**关键区别**：
- 指针可以重新指向，引用一经初始化不可更改
- 指针可以为 `nullptr`，引用必须绑定有效对象
- 指针有多级（`**p`），引用没有"引用的引用"

### 2.3 动态内存

```cpp
int *p = new int;           // 单个对象
int *arr = new int[n];      // 数组
delete p;                   // 释放单个
delete[] arr;               // 释放数组

// 链表结点
struct Node {
    int data;
    Node *next;
    Node(int d, Node *n = nullptr) : data(d), next(n) {}
};
Node *head = new Node(5, nullptr);
delete head;
```

---

<details>
<summary>📝 题目 2-1：指针与引用</summary>

**题目**：解释以下代码的运行结果。

```cpp
char ch1 = 'b';
char ch2 = 'e';
char *p1 = &ch1;
char **p2 = &p1;
*p1 = 'm';
*p2 = &ch2;
*p1 = 'n';
cout << ch1 << ch2 << endl;
```

**答案**：

逐行分析：
1. `p1 = &ch1` → p1 指向 ch1
2. `p2 = &p1` → p2 指向 p1（二级指针）
3. `*p1 = 'm'` → ch1 变为 `'m'`
4. `*p2 = &ch2` → 通过 p2 修改 p1 指向 ch2（p1 不再指向 ch1）
5. `*p1 = 'n'` → 此时 p1 指向 ch2，所以 ch2 变为 `'n'`

输出：`b n`

</details>

---

<details>
<summary>📝 题目 2-2：引用参数</summary>

**题目**：写出以下代码的输出结果。

```cpp
void func(int &x) { x += 10; }

int main() {
    int a = 5;
    func(a);
    cout << a << endl;
    return 0;
}
```

**答案**：

输出 `15`。因为 `x` 是 `a` 的引用，`x += 10` 实际修改了 `a`。

</details>

---

## 3. Stack —— 栈

### 3.1 基本性质

- **LIFO**（Last In First Out）—— 后进先出
- 只能在栈顶操作：push（入栈）、pop（出栈）、top（取栈顶）
- 时间复杂度：所有操作 O(1)

### 3.2 C++ STL stack

```cpp
stack<int> st;
st.push(5);         // 入栈
st.top();           // 取栈顶（不删除）
st.pop();           // 出栈（无返回值）
st.empty();         // 判空
st.size();          // 元素个数
```

### 3.3 数组实现栈

```cpp
const int MAXN = 1000;
int st[MAXN];
int top = -1;         // 栈顶指针

void push(int x) { st[++top] = x; }
void pop() { top--; }
int topVal() { return st[top]; }
bool empty() { return top == -1; }
```

### 3.4 链式栈

```cpp
struct Node {
    int data;
    Node *next;
    Node(int d, Node *n = nullptr) : data(d), next(n) {}
};

class LinkedStack {
private:
    Node *top_node;
public:
    LinkedStack() : top_node(nullptr) {}
    void push(int x) {
        top_node = new Node(x, top_node);
    }
    void pop() {
        if(empty()) return;
        Node *tmp = top_node;
        top_node = top_node->next;
        delete tmp;
    }
    int top() {
        return top_node->data;
    }
    bool empty() {
        return top_node == nullptr;
    }
};
```

### 3.5 应用：括号匹配

```cpp
bool isMatching(string s) {
    stack<char> st;
    for(char c : s) {
        if(c == '(' || c == '[' || c == '{')
            st.push(c);
        else if(c == ')' || c == ']' || c == '}') {
            if(st.empty()) return false;
            char t = st.top(); st.pop();
            if((c == ')' && t != '(') ||
               (c == ']' && t != '[') ||
               (c == '}' && t != '{'))
                return false;
        }
    }
    return st.empty();
}
```

### 3.6 应用：中缀→后缀（逆波兰）

**算法**：从左到右扫描，数字直接输出；运算符与栈顶比较优先级，栈顶优先级不低于当前则弹出；括号特殊处理。

```cpp
// 简易中缀转后缀（仅含 + - * /）
int prec(char op) {
    if(op == '*' || op == '/') return 2;
    if(op == '+' || op == '-') return 1;
    return 0;
}

string infixToPostfix(string s) {
    string res;
    stack<char> st;
    for(char c : s) {
        if(isdigit(c)) res += c;    // 操作数直接输出
        else if(c == '(') st.push(c);
        else if(c == ')') {
            while(st.top() != '(') {
                res += st.top(); st.pop();
            }
            st.pop();  // 弹出 '('
        }
        else {  // 运算符
            while(!st.empty() && prec(st.top()) >= prec(c)) {
                res += st.top(); st.pop();
            }
            st.push(c);
        }
    }
    while(!st.empty()) { res += st.top(); st.pop(); }
    return res;
}
```

---

<details>
<summary>📝 题目 3-1：括号匹配</summary>

**题目**：判断字符串 `"({[()]})"` 是否括号匹配。

**答案**：

匹配。过程：
- `(` 入栈 → `{` 入栈 → `[` 入栈 → `(` 入栈 → `)` 匹配 `(`，弹出 → `]` 匹配 `[`，弹出 → `}` 匹配 `{`，弹出 → `)` 匹配 `(`，弹出
- 栈空，匹配成功 ✅

判断 `"({[})"` → 不匹配。读到 `}` 时栈顶是 `[`，类型不匹配。

</details>

---

<details>
<summary>📝 题目 3-2：逆波兰计算</summary>

**题目**：计算后缀表达式 `"3 4 + 2 * 7 /"` 的值。

**答案**：

1. 读 `3` → 入栈 [3]
2. 读 `4` → 入栈 [3, 4]
3. 读 `+` → 弹出 4, 3 → 3+4=7 → 入栈 [7]
4. 读 `2` → 入栈 [7, 2]
5. 读 `*` → 弹出 2, 7 → 7×2=14 → 入栈 [14]
6. 读 `7` → 入栈 [14, 7]
7. 读 `/` → 弹出 7, 14 → 14÷7=2 → 入栈 [2]

结果为 **2**

</details>

---

## 4. Queue —— 队列

### 4.1 基本性质

- **FIFO**（First In First Out）—— 先进先出
- 队尾入队（push/rear），队头出队（pop/front）

### 4.2 顺序队列的问题

```cpp
int q[MAXN];
int front = 0, rear = 0;
// 入队：q[rear++] = x;
// 出队：front++;
```
**问题**：出队后 front 前的空间无法复用 → **假溢出**

### 4.3 循环队列

利用取模运算将数组逻辑上视为环：

```cpp
const int MAXN = 100;
template <typename T>
class CirQueue {
private:
    T data[MAXN];
    int front, rear, cnt;   // cnt 记录元素个数
public:
    CirQueue() : front(0), rear(0), cnt(0) {}

    bool empty() { return cnt == 0; }
    bool full()  { return cnt == MAXN; }

    Error_code push(T x) {
        if(full()) return overflow;
        data[rear] = x;
        rear = (rear + 1) % MAXN;
        cnt++;
        return success;
    }

    Error_code pop(T &x) {
        if(empty()) return underflow;
        x = data[front];
        front = (front + 1) % MAXN;
        cnt--;
        return success;
    }

    T get_front() {
        return data[front];
    }

    int size() { return cnt; }
};
```

> **区分空与满的两种方法**：
> 1. 记录元素个数 `cnt`（如上）
> 2. 牺牲一个存储单元：`front == rear` 为空；`(rear+1) % MAXN == front` 为满

### 4.4 链式队列

```cpp
struct Node {
    int data;
    Node *next;
    Node(int d, Node *n = nullptr) : data(d), next(n) {}
};

class LinkedQueue {
private:
    Node *front_node, *rear_node;
public:
    LinkedQueue() : front_node(nullptr), rear_node(nullptr) {}

    void push(int x) {
        if(!front_node) {  // 空队列
            front_node = rear_node = new Node(x);
        } else {
            rear_node->next = new Node(x);
            rear_node = rear_node->next;
        }
    }

    void pop() {
        if(!front_node) return;
        Node *tmp = front_node;
        front_node = front_node->next;
        delete tmp;
        if(!front_node) rear_node = nullptr;
    }

    int front() { return front_node->data; }
    bool empty() { return front_node == nullptr; }
};
```

> **关键**：rear 和 front 同时为空或同时不为空。

---

<details>
<summary>📝 题目 4-1：循环队列判空判满</summary>

**题目**：若循环队列不记录 cnt，只使用 front 和 rear，如何区分空和满？

**答案**：

方案——**牺牲一个存储单元**：
- 初始化：`front = rear = 0`
- 判空：`front == rear`
- 判满：`(rear + 1) % MAXN == front`
- 入队：`data[rear] = x; rear = (rear + 1) % MAXN;`
- 出队：`x = data[front]; front = (front + 1) % MAXN;`

此时队列最多存储 `MAXN - 1` 个元素。

</details>

---

<details>
<summary>📝 题目 4-2：循环队列元素个数</summary>

**题目**：若 front = 3，rear = 1，MAXN = 8（不记录 cnt），队列中有几个元素？

**答案**：

公式：`(rear - front + MAXN) % MAXN = (1 - 3 + 8) % 8 = 6`

队列中有 **6** 个元素。

</details>

---

## 5. Linked List —— 链表

### 5.1 单链表结点

```cpp
template <typename T>
struct Node {
    T data;
    Node<T> *next;
    Node(T d, Node<T> *n = nullptr) : data(d), next(n) {}
};
```

### 5.2 单链表基本操作

```cpp
template <typename T>
class List {
private:
    Node<T> *head;
    int _size;

    void clear() {
        while(head) {
            Node<T> *tmp = head;
            head = head->next;
            delete tmp;
        }
        _size = 0;
    }

public:
    List() : head(nullptr), _size(0) {}
    ~List() { clear(); }

    int size() const { return _size; }

    // 指定位置插入
    void insert(int pos, T val) {
        if(pos < 0 || pos > _size) return;
        if(pos == 0) {
            head = new Node<T>(val, head);
        } else {
            Node<T> *prev = head;
            for(int i = 0; i < pos - 1; i++) prev = prev->next;
            prev->next = new Node<T>(val, prev->next);
        }
        _size++;
    }

    // 指定位置删除
    void remove(int pos, T &val) {
        if(pos < 0 || pos >= _size) return;
        Node<T> *target;
        if(pos == 0) {
            target = head;
            head = head->next;
        } else {
            Node<T> *prev = head;
            for(int i = 0; i < pos - 1; i++) prev = prev->next;
            target = prev->next;
            prev->next = target->next;
        }
        val = target->data;
        delete target;
        _size--;
    }

    // 遍历
    void traverse(void (*visit)(T &)) {
        Node<T> *curr = head;
        while(curr) {
            visit(curr->data);
            curr = curr->next;
        }
    }
};
```

### 5.3 链表反转

```cpp
// 迭代版
void reverse() {
    Node<T> *prev = nullptr, *curr = head;
    while(curr) {
        Node<T> *next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    head = prev;
}
```

### 5.4 双链表

```cpp
template <typename T>
struct DNode {
    T data;
    DNode<T> *prev;
    DNode<T> *next;
    DNode(T d, DNode<T> *p = nullptr, DNode<T> *n = nullptr)
        : data(d), prev(p), next(n) {}
};

// 在 p 之后插入
void insertAfter(DNode<T> *p, T val) {
    DNode<T> *newNode = new DNode<T>(val, p, p->next);
    if(p->next) p->next->prev = newNode;
    p->next = newNode;
}

// 删除 p 之后的结点
void removeAfter(DNode<T> *p) {
    if(!p->next) return;
    DNode<T> *target = p->next;
    p->next = target->next;
    if(target->next) target->next->prev = p;
    delete target;
}
```

### 5.5 应用：约瑟夫问题（循环链表）

```cpp
// n 个人围一圈，从第一个人开始报数，数到 m 的人出列
void Josephus(int n, int m) {
    list<int> people;
    for(int i = 1; i <= n; i++) people.push_back(i);

    auto it = people.begin();
    while(people.size() > 1) {
        for(int i = 1; i < m; i++) {
            it++;
            if(it == people.end()) it = people.begin();
        }
        it = people.erase(it);
        if(it == people.end()) it = people.begin();
    }
    cout << "幸存者: " << people.front() << endl;
}
```

---

<details>
<summary>📝 题目 5-1：链表反转</summary>

**题目**：对于链表 1 → 2 → 3 → 4 → nullptr，写出迭代反转每步后的结果。

**答案**：

初始: `head → 1 → 2 → 3 → 4 → nullptr`
- prev = nullptr, curr = 1

第1步: `1 → nullptr`  ← 断开原链
- prev = 1, curr = 2

第2步: `2 → 1 → nullptr`
- prev = 2, curr = 3

第3步: `3 → 2 → 1 → nullptr`
- prev = 3, curr = 4

第4步: `4 → 3 → 2 → 1 → nullptr`
- prev = 4, curr = nullptr

最终 head = 4：`4 → 3 → 2 → 1 → nullptr`

</details>

---

<details>
<summary>📝 题目 5-2：双链表插入</summary>

**题目**：已知双链表中有结点 a 和 c（a ↔ c），在 a 之后插入 b，请写出代码。

**答案**：

```cpp
// a ↔ c 中插入 b 得到 a ↔ b ↔ c
DNode<int> *b = new DNode<int>(val, a, a->next);
// 或者：
// b->prev = a;
// b->next = a->next;
if(a->next) a->next->prev = b;  // 如果 a 后面有结点，让它的 prev 指向 b
a->next = b;                     // a 的 next 指向 b
```

</details>

---

## 6. Recursion —— 递归与回溯

### 6.1 递归三要素

1. **基本情况**（Base Case）—— 最小规模直接返回
2. **递归调用** —— 向基本情况逼近
3. **问题分解** —— 每次调用让规模减小

### 6.2 经典递归：阶乘

```cpp
int factorial(int n) {
    if(n <= 1) return 1;             // base case
    return n * factorial(n - 1);     // 递归
}
```

### 6.3 回溯：八皇后问题

回溯 = 递归 + 试错 + 撤销

```cpp
const int MAX = 30;
class Queens {
private:
    int count;                // 已放置的皇后数 / 当前行
    bool queen[MAX][MAX];     // 棋盘
public:
    int board_size;

    Queens(int sz) : board_size(sz), count(0) {
        memset(queen, 0, sizeof(queen));
    }

    bool is_solved() { return count == board_size; }

    bool unguarded(int col) {
        for(int r = 0; r < count; r++) {
            for(int c = 0; c < board_size; c++) {
                if(!queen[r][c]) continue;
                if(c == col) return false;                       // 同列
                if(abs(c - col) == abs(r - count)) return false;  // 对角线
            }
        }
        return true;
    }

    void insert(int col) {
        queen[count][col] = true;
        count++;
    }

    void remove(int col) {
        count--;
        queen[count][col] = false;
    }
};

// DFS 回溯
void enumerate(Queens &q, long long &ans) {
    if(q.is_solved()) { ans++; return; }
    for(int c = 0; c < q.board_size; c++) {
        if(q.unguarded(c)) {
            q.insert(c);      // 尝试放置
            enumerate(q, ans); // 递归
            q.remove(c);       // 撤销
        }
    }
}
```

### 6.4 分治思想

把大问题分解为独立子问题，分别解决后合并。

---

<details>
<summary>📝 题目 6-1：八皇后计数</summary>

**题目**：8×8 棋盘上放 8 个皇后，使它们互不攻击，共有多少种解法？用回溯法搜索过程中，每个皇后在放置时最多检查几次冲突？

**答案**：

- 8 皇后共有 **92** 种解（经典结论）
- 每个皇后在第 count 行放置时，需检查该行所有列（0 到 board_size-1），即最多 8 次；每次 unguarded 检查需要遍历之前的每一行（最多 7 行），每行检查一列和两条对角线，共 O(n) 次。
- 总复杂度约为 O(n!)，n=8 时搜 92 个解约 15,720 次递归调用。

</details>

---

<details>
<summary>📝 题目 6-2：递归递推</summary>

**题目**：写出斐波那契数列的递归和递推实现，并说明各自的复杂度。

**答案**：

```cpp
// 递归（指数级 O(2^n)）
int fib_rec(int n) {
    if(n <= 1) return n;
    return fib_rec(n-1) + fib_rec(n-2);
}

// 递推（线性 O(n)）
int fib_iter(int n) {
    if(n <= 1) return n;
    int a = 0, b = 1, c;
    for(int i = 2; i <= n; i++) {
        c = a + b;
        a = b;
        b = c;
    }
    return b;
}
```

递归版因为大量重复计算（如 fib(5) 多次计算 fib(3)），复杂度 O(2^n)；递推版每个值只算一次，O(n)。

</details>

---

## 7. Polynomial —— 多项式

### 7.1 多项式链表表示

利用链表存储非零项（系数 + 指数），节省空间：

```cpp
struct Term {
    int coef;    // 系数
    int exp;     // 指数
    Term *next;
    Term(int c, int e, Term *n = nullptr) : coef(c), exp(e), next(n) {}
};
```

### 7.2 多项式加法

```cpp
Term* addPoly(Term *a, Term *b) {
    Term dummy(0, 0), *tail = &dummy;
    while(a && b) {
        if(a->exp > b->exp) {
            tail->next = new Term(a->coef, a->exp);
            a = a->next;
        } else if(a->exp < b->exp) {
            tail->next = new Term(b->coef, b->exp);
            b = b->next;
        } else {
            int sum = a->coef + b->coef;
            if(sum != 0)
                tail->next = new Term(sum, a->exp);
            a = a->next;
            b = b->next;
        }
        if(tail->next) tail = tail->next;
    }
    while(a) { tail->next = new Term(a->coef, a->exp); tail = tail->next; a = a->next; }
    while(b) { tail->next = new Term(b->coef, b->exp); tail = tail->next; b = b->next; }
    return dummy.next;
}
```

---

<details>
<summary>📝 题目 7-1：多项式加法</summary>

**题目**：用链表计算 `3x^5 + 2x^3 + x` 加 `4x^4 - x^3 + 2x` 的结果。

**答案**：

```
(3x^5 + 2x^3 + x) + (4x^4 - x^3 + 2x)

逐项合并：
x^5:    3        → 3x^5
x^4:    4        → 4x^4
x^3:    2 + (-1) = 1  → x^3
x^1:    1 + 2   = 3  → 3x

结果：3x^5 + 4x^4 + x^3 + 3x
```

</details>

---

## 8. Template —— 模板

### 8.1 函数模板

```cpp
template <typename T>
T max(T a, T b) {
    return a > b ? a : b;
}

// 使用
cout << max(3, 5);        // T = int
cout << max(3.14, 2.71);  // T = double
```

### 8.2 类模板

```cpp
template <typename T>
class Stack {
private:
    vector<T> data;
public:
    void push(T x) { data.push_back(x); }
    void pop() { data.pop_back(); }
    T top() { return data.back(); }
    bool empty() { return data.empty(); }
};
```

### 8.3 模板+函数指针遍历

```cpp
template <typename T>
void traverse(Node<T> *head, void (*visit)(T &)) {
    Node<T> *curr = head;
    while(curr) {
        visit(curr->data);
        curr = curr->next;
    }
}

// 使用
void print(int &x) { cout << x << endl; }
void update(int &x) { x *= 2; }
traverse(head, print);
traverse(head, update);
```

---

<details>
<summary>📝 题目 8-1：模板使用</summary>

**题目**：写出一个泛型函数 `swap`，交换两个同类型变量的值。

**答案**：

```cpp
template <typename T>
void my_swap(T &a, T &b) {
    T t = a;
    a = b;
    b = t;
}

// 使用
int x = 1, y = 2;
my_swap(x, y);     // x=2, y=1

double p = 3.14, q = 2.71;
my_swap(p, q);     // p=2.71, q=3.14
```

</details>

---

## 9. Sorting —— 排序

> Wk12 要求实现 6 种排序，对比运行结果。

### 9.1 选择排序 (Selection Sort)

```cpp
void selection_sort(int arr[], int n) {
    for(int i = 0; i < n-1; i++) {
        int mn = i;
        for(int j = i+1; j < n; j++)
            if(arr[j] < arr[mn]) mn = j;
        if(mn != i) swap(arr[i], arr[mn]);
    }
}
// 复杂度: O(n²) 稳定×
```

### 9.2 插入排序 (Insertion Sort)

```cpp
void insertion_sort(int arr[], int n) {
    for(int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i-1;
        while(j >= 0 && arr[j] > key) {
            arr[j+1] = arr[j];
            j--;
        }
        arr[j+1] = key;
    }
}
// 复杂度: 最好 O(n), 最坏 O(n²) 稳定√
```

### 9.3 希尔排序 (Shell Sort)

```cpp
void shell_sort(int arr[], int n) {
    for(int gap = n/2; gap > 0; gap /= 2) {
        for(int i = gap; i < n; i++) {
            int temp = arr[i];
            int j;
            for(j = i; j >= gap && arr[j-gap] > temp; j -= gap)
                arr[j] = arr[j-gap];
            arr[j] = temp;
        }
    }
}
// 复杂度: O(n log n) ~ O(n²) 取决于增量序列
```

### 9.4 快速排序 (Quick Sort)

```cpp
void quick_sort(int arr[], int l, int r) {
    if(l >= r) return;
    int p = arr[l + (r-l)/2];  // 中间值作 pivot
    int i = l, j = r;
    while(i <= j) {
        while(arr[i] < p) i++;
        while(arr[j] > p) j--;
        if(i <= j) {
            swap(arr[i], arr[j]);
            i++; j--;
        }
    }
    if(l < j) quick_sort(arr, l, j);
    if(i < r) quick_sort(arr, i, r);
}
// 复杂度: 平均 O(n log n), 最坏 O(n²)
```

### 9.5 归并排序 (Merge Sort)

```cpp
void merge(int arr[], int l, int m, int r) {
    int n1 = m-l+1, n2 = r-m;
    int L[n1], R[n2];
    for(int i = 0; i < n1; i++) L[i] = arr[l+i];
    for(int i = 0; i < n2; i++) R[i] = arr[m+1+i];
    int i = 0, j = 0, k = l;
    while(i < n1 && j < n2) {
        if(L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while(i < n1) arr[k++] = L[i++];
    while(j < n2) arr[k++] = R[j++];
}

void merge_sort(int arr[], int l, int r) {
    if(l >= r) return;
    int m = l + (r-l)/2;
    merge_sort(arr, l, m);
    merge_sort(arr, m+1, r);
    merge(arr, l, m, r);
}
// 复杂度: O(n log n) 稳定√ 空间 O(n)
```

### 9.6 堆排序 (Heap Sort)

```cpp
void heapify(int arr[], int n, int i) {
    int mx = i;
    int l = 2*i+1, r = 2*i+2;
    if(l < n && arr[l] > arr[mx]) mx = l;
    if(r < n && arr[r] > arr[mx]) mx = r;
    if(mx != i) {
        swap(arr[i], arr[mx]);
        heapify(arr, n, mx);
    }
}

void heap_sort(int arr[], int n) {
    // 建最大堆
    for(int i = n/2-1; i >= 0; i--) heapify(arr, n, i);
    // 逐个取最大值放到末尾
    for(int i = n-1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}
// 复杂度: O(n log n)
```

### 9.7 排序总结

| 算法 | 平均时间 | 最坏时间 | 稳定 | 原地 |
|------|---------|---------|------|------|
| 选择排序 | O(n²) | O(n²) | × | √ |
| 插入排序 | O(n²) | O(n²) | √ | √ |
| 希尔排序 | O(n¹·³) | O(n²) | × | √ |
| 快速排序 | O(n log n) | O(n²) | × | √ |
| 归并排序 | O(n log n) | O(n log n) | √ | × |
| 堆排序 | O(n log n) | O(n log n) | × | √ |

---

<details>
<summary>📝 题目 9-1：排序过程</summary>

**题目**：对数组 `[5, 3, 8, 6, 2, 7]` 写出快速排序第一趟划分后的结果（pivot 选中间值）。

**答案**：

pivot = 6（第 3 个元素，下标 2）：
- i=0, j=5: arr[0]=5 < 6 → i=1; arr[5]=7 > 6 → j=4
- i=1, j=4: arr[1]=3 < 6 → i=2; arr[4]=2 < 6 → j=3
- i=2, j=3: arr[2]=8 > 6, arr[3]=6 <=6 (不满足 arr[j]>6) → j=2 → 循环结束

交换 arr[2] 和 arr[4] → `[5, 3, 2, 6, 8, 7]`
第一趟后：左边 [5, 3, 2] 均 ≤ 6，右边 [8, 7] 均 ≥ 6

</details>

---

<details>
<summary>📝 题目 9-2：堆排序建堆</summary>

**题目**：数组 [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] 已是最大堆，不用建堆。写出堆排序前两次交换后的数组。

**答案**：

初始已建好最大堆 [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

第一次交换：swap(10, 1) → [1, 9, 8, 7, 6, 5, 4, 3, 2, 10]
- 堆大小减为 9，对根 heapify：
  - 9 > 1 → swap(1, 9) → [9, 1, 8, 7, 6, 5, 4, 3, 2, 10]
  - 1 < 7, 1 < 6 → swap(1, 7) → [9, 7, 8, 1, 6, 5, 4, 3, 2, 10]
  - 1 < 3 → swap(1, 3) → [9, 7, 8, 3, 6, 5, 4, 1, 2, 10]

第二次交换：swap(9, 2) → [2, 7, 8, 3, 6, 5, 4, 1, 9, 10]
- 堆大小减为 8，对根 heapify：
  - 8 > 2, 7 > 2 → swap(2, 8) → [8, 7, 2, 3, 6, 5, 4, 1, 9, 10]
  - 2 < 5, 2 < 4 → swap(2, 5) → [8, 7, 5, 3, 6, 2, 4, 1, 9, 10]

结果：[8, 7, 5, 3, 6, 2, 4, 1, 9, 10]

</details>

---

## 10. Hash Table —— 哈希表

### 10.1 基本概念

- **哈希函数**：将关键字映射到数组下标
  - 除留余数法：`hash(key) = key % table_size`
- **冲突**：不同关键字映射到同一位置
- **装填因子**：α = 已有元素数 / 表大小

### 10.2 开放定址法 —— 二次探测

```cpp
const int hash_size = 7;

int hash(Key k) { return k % hash_size; }

// 二次探测: pos = (h + i²) % hash_size
class Hash_table {
private:
    Record table[hash_size];
    bool empty[hash_size];
    bool deleted[hash_size];

public:
    void clear() {
        for(int i = 0; i < hash_size; i++) {
            empty[i] = true;
            deleted[i] = false;
        }
    }

    Error_code insert(const Record &new_entry, int &pos) {
        Key target = new_entry.the_key();
        int h = hash(target);
        int first_deleted = -1;

        for(int i = 0; i < hash_size; i++) {
            pos = (h + i*i) % hash_size;

            if(empty[pos]) {  // 空位，插入
                if(first_deleted != -1) pos = first_deleted;
                table[pos] = new_entry;
                empty[pos] = false;
                return success;
            }
            if(deleted[pos]) {  // 标记删除位
                if(first_deleted == -1) first_deleted = pos;
                continue;
            }
            if(table[pos].the_key() == target)
                return duplicate_error;  // 重复
        }
        // 有空位但之前标记删除的位置
        if(first_deleted != -1) {
            pos = first_deleted;
            table[pos] = new_entry;
            empty[pos] = false;
            deleted[pos] = false;
            return success;
        }
        return overflow;  // 表满
    }

    Error_code retrieve(const Key &target, Record &found, int &pos) {
        int h = hash(target);
        for(int i = 0; i < hash_size; i++) {
            pos = (h + i*i) % hash_size;
            if(empty[pos]) return not_present;
            if(!deleted[pos] && table[pos].the_key() == target) {
                found = table[pos];
                return success;
            }
        }
        return not_present;
    }
};
```

### 10.3 线性探测 vs 二次探测

| 方法 | 探测序列 | 优点 | 缺点 |
|------|---------|------|------|
| 线性探测 | (h+1), (h+2), ... | 实现简单 | 容易产生聚集 |
| 二次探测 | (h+1²), (h+2²), ... | 减少聚集 | 不一定能遍历所有空位 |

### 10.4 链地址法（Separate Chaining）

```cpp
vector<int> table[hash_size];

void insert(int key) {
    int h = key % hash_size;
    table[h].push_back(key);
}

bool search(int key) {
    int h = key % hash_size;
    for(int x : table[h])
        if(x == key) return true;
    return false;
}
```

---

<details>
<summary>📝 题目 10-1：二次探测插入</summary>

**题目**：哈希表大小 7，哈希函数 h(k) = k % 7，使用二次探测。插入关键字 10, 22, 31, 4, 15，写出每步的插入位置。

**答案**：

- h(10) = 3 → 空，插到位置 3
- h(22) = 1 → 空，插到位置 1
- h(31) = 3 → 冲突！探索序列：
  - i=1: (3+1) % 7 = 4 → 空，插到位置 4
- h(4) = 4 → 冲突！i=1: (4+1) % 7 = 5 → 空，插到位置 5
- h(15) = 1 → 冲突！i=1: (1+1) % 7 = 2 → 空，插到位置 2

最终位置：10→3, 22→1, 31→4, 4→5, 15→2

</details>

---

<details>
<summary>📝 题目 10-2：哈希检索</summary>

**题目**：使用 10-1 的哈希表，检索关键字 31 的过程是什么？

**答案**：

h(31) = 3，位置 3 存的是 10（不是 31）
- i=1: (3+1) % 7 = 4，位置 4 存的是 31 ✅ 找到

共探测 2 次。

</details>

---

## 11. Binary Tree —— 二叉树

### 11.1 二叉树结点

```cpp
template <class Entry>
struct Binary_node {
    Entry data;
    Binary_node<Entry> *left;
    Binary_node<Entry> *right;
    Binary_node() : left(nullptr), right(nullptr) {}
    Binary_node(const Entry &d)
        : data(d), left(nullptr), right(nullptr) {}
};
```

### 11.2 二叉树类

```cpp
template <class Entry>
class Binary_tree {
public:
    Binary_tree() : root(nullptr), cnt(0) {}
    bool empty() const { return cnt == 0; }
    int size() const { return cnt; }
    int height() const { return height_aux(root); }

    // 三种遍历
    void preorder(void (*visit)(Entry &))  { preorder_aux(root, visit); }
    void inorder(void (*visit)(Entry &))   { inorder_aux(root, visit); }
    void postorder(void (*visit)(Entry &)) { postorder_aux(root, visit); }

protected:
    Binary_node<Entry> *root;
    int cnt;

    void clear(Binary_node<Entry> *&t) {
        if(!t) return;
        clear(t->left);
        clear(t->right);
        delete t;
        t = nullptr;
    }

    void preorder_aux(Binary_node<Entry> *t, void (*visit)(Entry &)) {
        if(!t) return;
        visit(t->data);
        preorder_aux(t->left, visit);
        preorder_aux(t->right, visit);
    }

    void inorder_aux(Binary_node<Entry> *t, void (*visit)(Entry &)) {
        if(!t) return;
        inorder_aux(t->left, visit);
        visit(t->data);
        inorder_aux(t->right, visit);
    }

    void postorder_aux(Binary_node<Entry> *t, void (*visit)(Entry &)) {
        if(!t) return;
        postorder_aux(t->left, visit);
        postorder_aux(t->right, visit);
        visit(t->data);
    }

    int height_aux(Binary_node<Entry> *t) const {
        if(!t) return 0;
        return 1 + max(height_aux(t->left), height_aux(t->right));
    }
};
```

### 11.3 三种遍历

```
       A
      / \
     B   C
    / \   \
   D   E   F

前序 (根左右):   A B D E C F
中序 (左根右):   D B E A C F
后序 (左右根):   D E B F C A
```

---

<details>
<summary>📝 题目 11-1：二叉树遍历</summary>

**题目**：已知二叉树前序遍历为 `ABDECF`，中序遍历为 `DBEAFC`，画出该二叉树。

**答案**：

由前序知根为 A；由中序知左子树为 DBE，右子树为 FC。

递归：
- 前序第二个 B 为左子树根；中序 DBE 中 B 在中间，左 D 右 E
- 前序中 A 后第 4 个 C 为右子树根；中序 FC 中 C 在右边，F 为左

```
       A
      / \
     B   C
    / \   \
   D   E   F
```

</details>

---

<details>
<summary>📝 题目 11-2：求二叉树高度</summary>

**题目**：写出递归计算二叉树高度的代码。

**答案**：

```cpp
int height(Binary_node<Entry> *t) {
    if(!t) return 0;
    return 1 + max(height(t->left), height(t->right));
}
```

时间复杂度 O(n)，每个结点访问一次。

</details>

---

## 12. Binary Search Tree —— 二叉搜索树

### 12.1 BST 性质

对于任意结点，其**左子树所有值 < 结点值 < 右子树所有值**

### 12.2 BST 基本操作

```cpp
template <class Record>
class Search_tree : public Binary_tree<Record> {
public:
    Error_code insert(const Record &new_data) {
        return insert_aux(this->root, new_data);
    }
    Error_code remove(const Record &target) {
        return remove_aux(this->root, target);
    }
    Error_code tree_search(Record &target) const {
        // 查找并返回记录
        Binary_node<Record> *found = search_for_node(this->root, target);
        if(!found) return not_present;
        target = found->data;
        return success;
    }
    // 额外接口：求叶子数、求和
    int Leaves() const { return leaves_aux(this->root); }
    int GetSum() const { return get_sum_aux(this->root); }

private:
    // 搜索
    Binary_node<Record>* search_for_node(Binary_node<Record> *t,
                                         const Record &target) const {
        if(!t || t->data == target) return t;
        if(target < t->data)
            return search_for_node(t->left, target);
        else
            return search_for_node(t->right, target);
    }

    // 插入（递归找到空位）
    Error_code insert_aux(Binary_node<Record> *&t,
                          const Record &new_data) {
        if(!t) {
            t = new Binary_node<Record>(new_data);
            this->cnt++;
            return success;
        }
        if(new_data < t->data)
            return insert_aux(t->left, new_data);
        else if(new_data > t->data)
            return insert_aux(t->right, new_data);
        else
            return duplicate_error;
    }

    // 删除（三种情况）
    Error_code remove_aux(Binary_node<Record> *&t,
                          const Record &target) {
        if(!t) return not_present;
        if(target < t->data)
            return remove_aux(t->left, target);
        if(target > t->data)
            return remove_aux(t->right, target);
        // 找到目标
        return remove_root(t);
    }

    Error_code remove_root(Binary_node<Record> *&t) {
        if(!t) return not_present;
        // 情况 1: 叶子
        if(!t->left && !t->right) {
            delete t; t = nullptr; this->cnt--;
            return success;
        }
        // 情况 2: 只有右子树
        if(!t->left) {
            Binary_node<Record> *tmp = t;
            t = t->right;
            delete tmp; this->cnt--;
            return success;
        }
        // 情况 2: 只有左子树
        if(!t->right) {
            Binary_node<Record> *tmp = t;
            t = t->left;
            delete tmp; this->cnt--;
            return success;
        }
        // 情况 3: 左右子树都有 → 找右子树最小值
        Binary_node<Record> *parent = t;
        Binary_node<Record> *succ = t->right;
        while(succ->left) {
            parent = succ;
            succ = succ->left;
        }
        t->data = succ->data;
        // 删除 succ
        if(parent == t) parent->right = succ->right;
        else parent->left = succ->right;
        delete succ; this->cnt--;
        return success;
    }

    int leaves_aux(Binary_node<Record> *t) const {
        if(!t) return 0;
        if(!t->left && !t->right) return 1;
        return leaves_aux(t->left) + leaves_aux(t->right);
    }

    int get_sum_aux(Binary_node<Record> *t) const {
        if(!t) return 0;
        return t->data + get_sum_aux(t->left) + get_sum_aux(t->right);
    }
};
```

### 12.3 BST 删除的三种情况

| 情况 | 操作 |
|------|------|
| ❌ 叶子结点 | 直接 delete 置空 |
| ✅ 只有一个孩子 | 用孩子替代当前结点 |
| 🔄 有两个孩子 | 找右子树最小结点（中序后继）替换值，删除该后继结点 |

### 12.4 Buildable Tree（平衡构建）

将有序列表递归构建为平衡 BST：

```cpp
template <class Record>
class Buildable_tree : public Search_tree<Record> {
public:
    Error_code build_tree(List<Record> &list) {
        // 清空旧树
        this->clear(this->root);
        return build_subtree(list, 0, list.size() - 1);
    }
private:
    Binary_node<Record>* build_subtree(List<Record> &list,
                                        int low, int high) {
        if(low > high) return nullptr;
        int mid = (low + high) / 2;
        Binary_node<Record> *node = new Binary_node<Record>;
        // 获取 mid 位置的值
        Record val; list.retrieve(mid, val);
        node->data = val;
        node->left = build_subtree(list, low, mid - 1);
        node->right = build_subtree(list, mid + 1, high);
        return node;
    }
};
```

---

<details>
<summary>📝 题目 12-1：BST 插入</summary>

**题目**：将关键字序列 [5, 3, 7, 2, 4, 6, 8] 依次插入空 BST，画出最终树形。

**答案**：

```
        5
       / \
      3   7
     / \ / \
    2  4 6  8
```

插入顺序：
- 5 作为根
- 3 < 5 → 左
- 7 > 5 → 右
- 2 < 5 → 左 → 2 < 3 → 左
- 4 < 5 → 左 → 4 > 3 → 右
- 6 > 5 → 右 → 6 < 7 → 左
- 8 > 5 → 右 → 8 > 7 → 右

</details>

---

<details>
<summary>📝 题目 12-2：BST 删除</summary>

**题目**：在 12-1 的树中删除根结点 5，画出删除后的树。

**答案**：

删除 5（有两个孩子）：
- 找右子树最小值：6（右子树的最左结点）
- 将 5 的值替换为 6
- 删除原来的 6（叶子结点，直接删除）

```
        6
       / \
      3   7
     / \   \
    2  4    8
```

</details>

---

<details>
<summary>📝 题目 12-3：BST 查找与性能</summary>

**题目**：BST 中查找一个元素的平均和最坏时间复杂度是多少？

**答案**：

- **平均**：O(log n) —— 树较平衡时
- **最坏**：O(n) —— 树退化为链表时（如插入有序序列 1,2,3,...,n）

提高平衡性的方法：用 Buildable_tree 预先建树，或使用 AVL / 红黑树等平衡 BST。

</details>

---

## 13. AVL Tree —— 平衡二叉搜索树

### 13.1 AVL 树定义

AVL 树是**自平衡二叉搜索树**，任一结点的左右子树高度差不超过 1。

```
平衡因子 = 左子树高度 - 右子树高度
bf ∈ {-1, 0, 1}
```

```cpp
enum Balance_factor { left_higher, equal_height, right_higher };
// left_higher  = +1 (左高)
// equal_height =  0 (等高)
// right_higher = -1 (右高)
```

### 13.2 AVL 结点（继承 Binary_node）

```cpp
template <class Record>
struct AVL_node : public Binary_node<Record> {
    Balance_factor balance;
    AVL_node() : balance(equal_height) {
        this->left = nullptr;
        this->right = nullptr;
    }
    AVL_node(const Record &x) : balance(equal_height) {
        this->data = x;
        this->left = nullptr;
        this->right = nullptr;
    }
    void set_balance(Balance_factor b) { balance = b; }
    Balance_factor get_balance() const { return balance; }
};
```

> **注意**：`Binary_node` 中也要提供虚函数版本，但返回 `equal_height` 以区分普通结点和 AVL 结点。

### 13.3 四种失衡类型与旋转

| 失衡类型 | 描述 | 操作 | 形象记忆 |
|---------|------|------|---------|
| **LL** | 插入在左子树的左子树 | 右旋一次 | "左边太重，往右扳" |
| **RR** | 插入在右子树的右子树 | 左旋一次 | "右边太重，往左扳" |
| **LR** | 插入在左子树的右子树 | 先左旋后右旋 | "先掰直再扳正" |
| **RL** | 插入在右子树的左子树 | 先右旋后左旋 | "先掰直再扳正" |

#### 左旋 (Rotate Left)

```
     A               B
      \    左旋      / \
       B   ────→    A   C
        \
         C
```

```cpp
void rotate_left(Binary_node<Record> *&sub_root) {
    Binary_node<Record> *right_tree = sub_root->right;
    sub_root->right = right_tree->left;
    right_tree->left = sub_root;
    sub_root = right_tree;
}
```

#### 右旋 (Rotate Right)

```
       A             B
      /    右旋     / \
     B     ────→   C   A
    /
   C
```

```cpp
void rotate_right(Binary_node<Record> *&sub_root) {
    Binary_node<Record> *left_tree = sub_root->left;
    sub_root->left = left_tree->right;
    left_tree->right = sub_root;
    sub_root = left_tree;
}
```

### 13.4 Insert 后的再平衡

插入新结点后沿路径回溯，遇到平衡因子变为 ±2 时再平衡。

#### right_balance —— 右子树过高的处理

适用于从右子树插入后 `sub_root` 变为 `right_higher` 且 `taller == true`：

```cpp
void right_balance(Binary_node<Record> *&sub_root) {
    Binary_node<Record> *&right_tree = sub_root->right;
    switch(right_tree->get_balance()) {
        case right_higher:      // RR → 单左旋
            sub_root->set_balance(equal_height);
            right_tree->set_balance(equal_height);
            rotate_left(sub_root);
            break;
        case equal_height:      // 理论上不会发生（taller==true 时不可能）
            break;
        case left_higher: {     // RL → 先右旋再左旋（双旋）
            Binary_node<Record> *sub_tree = right_tree->left;
            switch(sub_tree->get_balance()) {
                case equal_height:
                    sub_root->set_balance(equal_height);
                    right_tree->set_balance(equal_height);
                    break;
                case left_higher:
                    sub_root->set_balance(equal_height);
                    right_tree->set_balance(right_higher);
                    break;
                case right_higher:
                    sub_root->set_balance(left_higher);
                    right_tree->set_balance(equal_height);
                    break;
            }
            sub_tree->set_balance(equal_height);
            rotate_right(right_tree);
            rotate_left(sub_root);
            break;
        }
    }
}
```

#### left_balance —— 左子树过高的处理（right_balance 的镜像）

```cpp
void left_balance(Binary_node<Record> *&sub_root) {
    Binary_node<Record> *&left_tree = sub_root->left;
    switch(left_tree->get_balance()) {
        case left_higher:       // LL → 单右旋
            sub_root->set_balance(equal_height);
            left_tree->set_balance(equal_height);
            rotate_right(sub_root);
            break;
        case equal_height:
            break;
        case right_higher: {    // LR → 先左旋再右旋（双旋）
            Binary_node<Record> *sub_tree = left_tree->right;
            switch(sub_tree->get_balance()) {
                case equal_height:
                    sub_root->set_balance(equal_height);
                    left_tree->set_balance(equal_height);
                    break;
                case right_higher:
                    sub_root->set_balance(equal_height);
                    left_tree->set_balance(left_higher);
                    break;
                case left_higher:
                    sub_root->set_balance(right_higher);
                    left_tree->set_balance(equal_height);
                    break;
            }
            sub_tree->set_balance(equal_height);
            rotate_left(left_tree);
            rotate_right(sub_root);
            break;
        }
    }
}
```

### 13.5 Insert 完整流程

```cpp
Error_code avl_insert(Binary_node<Record> *&sub_root,
                      const Record &new_data, bool &taller) {
    if(sub_root == nullptr) {
        sub_root = new AVL_node<Record>(new_data);
        taller = true;
    }
    else if(new_data == sub_root->data) {
        return duplicate_error;   // 不允许重复
        taller = false;
    }
    else if(new_data < sub_root->data) {
        // 在左子树插入
        result = avl_insert(sub_root->left, new_data, taller);
        if(taller) {
            switch(sub_root->get_balance()) {
                case left_higher:   // 原本左高 → 变左左高 → 再平衡
                    left_balance(sub_root);
                    taller = false;
                    break;
                case equal_height:  // 原本等高 → 变左高
                    sub_root->set_balance(left_higher);
                    break;
                case right_higher:  // 原本右高 → 变等高
                    sub_root->set_balance(equal_height);
                    taller = false;
                    break;
            }
        }
    }
    else {
        // 在右子树插入（对称逻辑）
        result = avl_insert(sub_root->right, new_data, taller);
        if(taller) {
            switch(sub_root->get_balance()) {
                case left_higher:
                    sub_root->set_balance(equal_height);
                    taller = false;
                    break;
                case equal_height:
                    sub_root->set_balance(right_higher);
                    break;
                case right_higher:
                    right_balance(sub_root);
                    taller = false;
                    break;
            }
        }
    }
    return result;
}
```

### 13.6 Remove 后的再平衡

删除操作的再平衡与插入对称但更复杂，因为删除导致子树变矮后，失衡可能向上传播。

删除再平衡的平衡因子调整规则（以从**左子树删除**导致 `shorter == true` 为例）：

```
sub_root 原平衡因子   操作                shorter
left_higher (+1)   → 设为 equal_height    true（继续向上传播）
equal_height  (0)  → 设为 right_higher    false（停止传播）
right_higher (-1)  → right_balance2()    由旋转决定
```

#### right_balance2 —— 删除场景的右侧再平衡

与 `right_balance` 的区别：多了一种 `equal_height` 情况（插入时不可能，但删除时可能）：

```cpp
bool right_balance2(Binary_node<Record> *&sub_root) {
    bool shorter;
    Binary_node<Record> *&right_tree = sub_root->right;
    switch(right_tree->get_balance()) {
        case right_higher:      // RR → 单左旋，树变矮
            sub_root->set_balance(equal_height);
            right_tree->set_balance(equal_height);
            rotate_left(sub_root);
            shorter = true;
            break;
        case equal_height:      // 单左旋，树不变矮（删除独有）
            right_tree->set_balance(left_higher);
            rotate_left(sub_root);
            shorter = false;
            break;
        case left_higher: {     // RL → 双旋，树变矮
            // ... 与 right_balance 的 left_higher 分支一致 ...
            shorter = true;
            break;
        }
    }
    return shorter;
}
```

### 13.7 AVL 类全貌

```cpp
template <class Record>
class AVL_tree : public Search_tree<Record> {
public:
    Error_code insert(const Record &new_data);
    Error_code remove(Record &old_data);
private:
    Error_code avl_insert(Binary_node<Record> *&sub_root,
                          const Record &new_data, bool &taller);
    void rotate_left(Binary_node<Record> *&sub_root);
    void rotate_right(Binary_node<Record> *&sub_root);
    void right_balance(Binary_node<Record> *&sub_root);
    void left_balance(Binary_node<Record> *&sub_root);
    // 删除相关
    Error_code avl_remove(Binary_node<Record> *&sub_root,
                          Record &new_data, bool &shorter);
    bool right_balance2(Binary_node<Record> *&sub_root);
    bool left_balance2(Binary_node<Record> *&sub_root);
};
```

### 13.8 课件参考代码的常见漏洞

> 这是 Wk15 作业的核心——找出并修复参考代码中的遗留 bug。

| # | 漏洞 | 表现 | 修复 |
|---|------|------|------|
| 1 | `right_balance` 中 `case equal_height` 无 `break` | fallthrough 执行双旋 | 加 `break` |
| 2 | `left_balance` 中 `case equal_height` 无 `break` + 错误信息写错 | fallthrough + 提示"right balance" | 加 `break`，改为"left_balance" |
| 3 | case 标签内声明变量无作用域括号 | 编译错误 "crosses initialization" | 用 `{}` 包裹 |
| 4 | `left_balance2` 函数体完全为空 | 删除后无法再平衡 | 完整实现（镜像 `right_balance2`） |
| 5 | `sub_record.the_key()!=0` 哨兵检查 | key=0 时数据替换被跳过 | 改用 `bool has_sub_record` |
| 6 | 头文件缺少 include 守卫 | 重复定义 | 加 `#pragma once` |
| 7 | `using namespace std` 导致 `left`/`right` 命名冲突 | 与 `std::left`/`std::right` 冲突 | 用 `this->` 限定 |

---

<details>
<summary>📝 题目 13-1：AVL 插入与旋转</summary>

**题目**：依次将关键字 [7, 4, 9, 2, 5, 8, 11, 1, 3, 6] 插入空 AVL 树。当插入 1 时触发了什么旋转？画出最终 AVL 树。

**答案**：

插入过程：
- 7 → 根
- 4 → 左
- 9 → 右
- 2 → 7左→4左
- 5 → 7左→4右
- 8 → 7右→9左
- 11 → 7右→9右
- 1 → 7左→4左→2左

此时结点 2 平衡因子变为 left_higher，沿路径回溯：
- 结点 4 左子树高度 2，右子树高度 1 → bf = left_higher（正常）
- 结点 7 左子树高度 3（4→2→1），右子树高度 2（9→8,11） → bf = left_higher（正常）

继续回溯到...等一下，再仔细算。

```
插入 1 后的树（1 为 2 的左孩子）：
        7
       / \
      4   9
     / \ / \
    2  5 8 11
   /
  1
```

结点 4 的左子树高=2 (2→1)，右子树高=1 (5) → bf = left_higher (+1) ✅
结点 7 的左子树高=3 (4→2→1)，右子树高=2 (9→8,11) → bf = left_higher (+1) ✅

再插入 3：
```
        7
       / \
      4   9
     / \ / \
    2  5 8 11
   / \
  1   3
```

结点 2 平衡因子 = 0 ✅
结点 4 左子树高=2 (2→1,3)，右子树高=1 → bf = left_higher ✅
结点 7 左子树高=3，右子树高=2 → bf = left_higher ✅

再插入 6：
```
        7
       / \
      4   9
     / \ / \
    2  5 8 11
   / \  \
  1   3  6
```

结点 5 → bf = right_higher → 回溯到 4：
结点 4 左子树高=2 (2→1,3)，右子树高=2 (5→6) → bf = equal_height ✅

最终 AVL 树：

```
        7
       / \
      4   9
     / \ / \
    2  5 8 11
   / \  \
  1  3  6
```

全程没有触发旋转，因为树始终保持平衡。

但若按另一种顺序插入 `[1, 2, 3, 4, 5, 6, 7]`：
- 1 → 根
- 2 → 右 → 平衡 ✅
- 3 → 右 → 结点 1 失衡，RR → 左旋

```
左旋后：
    2
   / \
  1   3
```

- 4 → 右 → 结点 2 失衡，RR → 左旋

```
    2                4
   / \              / \
  1   3    →       2  ...
        \         / \
         4       1   3
```

最终逐步构造出平衡树。

</details>

---

<details>
<summary>📝 题目 13-2：AVL 删除与再平衡</summary>

**题目**：在以下 AVL 树中删除结点 9，描述再平衡过程。

```
        8
       / \
      4   12
     / \  / \
    2  6 10 14
   /|\
  1 3 5 7
```

**答案**：

删除 9（不在树中，假设删除 12 吧... 删除 10 吧）：

删除 10（叶子结点，直接删除）：
```
        8
       / \
      4   12
     / \    \
    2  6    14
   /|\
  1 3 5 7
```

结点 12 的 bf 从 `equal_height` 变为 `right_higher` ✅
结点 8 左子树高=3，右子树高=2 → bf = left_higher ✅
未失衡。

---

换个例子：在上树中删除 14（叶子 → 直接删）：

```
        8
       / \
      4   12
     / \  /
    2  6 10
   /|\
  1 3 5 7
```

结点 12 的 bf 变为 left_higher ✅
结点 8 左右子树均为高 3 → bf = equal_height ✅

再删除 10（叶子）：

```
        8
       / \
      4   12
     / \
    2  6
   /|\
  1 3 5 7
```

结点 12 的 bf 变为 equal_height，但 shorter = true
回溯到 8：左子树高=3，右子树高=1（12 没有孩子）
→ bf = left_higher 且 shorter = true → 从右子树删除导致左子树过高

进入 `left_balance2`：
- 左子树 4 的平衡因子？左子树 2 高 2，右子树 6 高 2 → equal_height
- `case equal_height`：单右旋，shorter = false

```
单右旋后：
        4
       / \
      2   8
     /|\  /
    1 3 6 12
       /\
      5  7
```

</details>

---

<details>
<summary>📝 题目 13-3：四类失衡判断</summary>

**题目**：判断以下每种情况属于 LL / RR / LR / RL 中的哪一类，以及对应的旋转操作。

(a) 在 AVL 树的右子树的右子树上插入
(b) 在 AVL 树的左子树的右子树上插入
(c) 在 AVL 树的左子树的左子树上插入
(d) 在 AVL 树的右子树的左子树上插入

**答案**：

| 情况 | 类型 | 操作 |
|------|------|------|
| (a) 右子树的右子树 | **RR** | 单左旋 |
| (b) 左子树的右子树 | **LR** | 先左旋再右旋（双旋） |
| (c) 左子树的左子树 | **LL** | 单右旋 |
| (d) 右子树的左子树 | **RL** | 先右旋再左旋（双旋） |

记忆口诀：**"左左→右旋，右右→左旋，左右→左右旋，右左→右左旋"**

</details>

---

## 14. C++ OOP 进阶

### 14.1 深拷贝 vs 浅拷贝

```cpp
class List {
private:
    Node *head;
    int _size;

    void copyFrom(const List &other) {
        if(!other.head) { head = nullptr; _size = 0; return; }
        head = new Node(other.head->data);
        Node *curr = head;
        Node *ocurr = other.head->next;
        while(ocurr) {
            curr->next = new Node(ocurr->data);
            curr = curr->next;
            ocurr = ocurr->next;
        }
        _size = other._size;
    }

public:
    // 拷贝构造函数
    List(const List &other) : head(nullptr), _size(0) {
        copyFrom(other);
    }

    // 赋值运算符
    List& operator=(const List &other) {
        if(this != &other) {   // 防止自赋值
            clear();           // 释放已有资源
            copyFrom(other);   // 深拷贝
        }
        return *this;
    }

    // 析构函数
    ~List() { clear(); }
};
```

**三/五法则（Rule of Three/Five）**：若类需要自定义析构函数，则也必须自定义拷贝构造函数和拷贝赋值运算符。

### 14.2 Error_code 枚举

```cpp
enum Error_code {
    success,       // 操作成功
    underflow,     // 下溢：容器已空
    overflow,      // 上溢：容器已满
    range_error,   // 范围错误
    not_present,   // 找不到
    duplicate_error // 重复
};
```

### 14.3 运算符重载

```cpp
// 重载 << 用于自定义类输出
ostream& operator<<(ostream &out, const Record &r) {
    out << "(" << r.key << ", " << r.other << ")";
    return out;
}

// 重载 < 用于比较
bool operator<(const Record &a, const Record &b) {
    return a.key < b.key;
}
```

### 14.4 继承

```cpp
// Search_tree 继承 Binary_tree
template <class Record>
class Search_tree : public Binary_tree<Record> {
    // 继承所有 public/protected 成员
    // 可以访问 this->root、this->cnt
public:
    Error_code insert(const Record &new_data);
    Error_code remove(const Record &target);
    Error_code tree_search(Record &target) const;
};
```

### 14.5 函数指针遍历模式

```cpp
// 遍历时通过函数指针自定义操作
template <typename T>
void traverse(Node<T> *head, void (*visit)(T &)) {
    Node<T> *curr = head;
    while(curr) {
        visit(curr->data);
        curr = curr->next;
    }
}

void print(int &x) { cout << x << endl; }
void update(int &x) { x *= 2; }

// 使用
List<int> mylist;
mylist.traverse(print);   // 遍历输出
mylist.traverse(update);  // 遍历更新
```

---

<details>
<summary>📝 题目 14-1：深拷贝 vs 浅拷贝</summary>

**题目**：一个链表类含有 `Node *head` 成员，若不定义拷贝构造函数，以下代码会出什么问题？

```cpp
List a;
a.insert(0, 5);
List b = a;   // 浅拷贝
```

**答案**：

浅拷贝导致 a 和 b 的 head 指向同一内存。问题：
1. 修改 b 会同时影响 a
2. 析构时 a 和 b 都会 delete 同一块内存 → **double free**
3. 若先析构 a，b 的 head 变为悬空指针 → **use after free**

解决方案：实现深拷贝构造函数和赋值运算符。

</details>

---

<details>
<summary>📝 题目 14-2：三/五法则</summary>

**题目**：为什么链表类需要同时定义析构函数、拷贝构造函数和赋值运算符？

**答案**：

因为链表使用动态内存（new/delete），编译器默认生成的拷贝构造只是浅拷贝（复制指针值）。三条必须同时定义：
1. **析构函数**：释放动态分配的结点内存，防止内存泄漏
2. **拷贝构造函数**：创建新链表时深拷贝所有结点
3. **赋值运算符**：处理已存在的链表对象赋值，需先释放旧资源再深拷贝，并处理自赋值情况

</details>

---

## 15. 经典错误自查表

> 来自 Wk1~Wk14 实际调试经验

| # | 错误 | 原因 | 解决方案 |
|---|------|------|---------|
| 1 | vector 越界 | 声明后未 `resize` 直接用 `cin >> v[j]` | `v.resize(n)` 或 `push_back` |
| 2 | getline 读空行 | `cin >>` 后未清理换行符 | 加 `cin.ignore(...)` |
| 3 | 循环脏数据 | 字符串未清空累积 | 每次循环后 `s = ""` 或用副本 |
| 4 | DP 下标偏移 | `dp[i][j]` 对应 `A[i-1]B[j-1]` 混淆 | 边界 +1，注意一一对应 |
| 5 | 数组越界 | VLA 访问到 `[n]` 以外 | 循环边界精确对应 `<=n` |
| 6 | 比较器传值 | 排序比较器没用引用，大量拷贝 | 使用 `const &` |
| 7 | 整数除法 | `a/b` 截断为整数 | 交叉相乘避免浮点 |
| 8 | 队列判空判满 | 边界条件遗漏 | `front == rear` 为空 |
| 9 | 哈希表标记删除 | 线性探测删除后查找中断 | 使用删除标记而非直接置空 |
| 10 | BST 删除双孩子 | 只替换值未删除后继结点 | 找右子树最小值替换后删除之 |

---

> 💡 **复习建议**：
> - 每个知识点的代码**手写 2~3 遍**，不要只看
> - 重点掌握：栈与队列的应用、链表操作、八皇后回溯、六种排序、哈希表二次探测、BST 插入删除
> - 最后的 OJ 题多体现 **三段式结构**：读入 → 处理 → 输出

---

*期末加油！ —— 来自 Wk1~Wk15 的全部精华*
