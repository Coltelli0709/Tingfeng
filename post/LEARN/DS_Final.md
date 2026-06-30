---
title: 数据结构复习
date: 2026-06-30
category: 数据结构
description: 但愿有用。
tags: [数据结构, 复习]
---

# 数据结构与程序设计

---

## 目录

1. [指针、引用与动态内存](#ch1-p)
2. [Error_code 错误码体系](#ch2-e)
3. [Stack 栈 —— 三种实现 + 括号匹配 + 逆波兰](#ch3-s)
4. [Queue 队列 —— 循环队列 + 链队列 + 假溢出](#ch4-q)
5. [Linked List 链表 —— 单链表 + 双链表 + 约瑟夫](#ch5-l)
6. [Recursion 递归与回溯 —— 八皇后 + DFS 框架](#ch6-r)
7. [Polynomial 多项式 —— 链表表示 + 加法](#ch7-po)
8. [Template 模板 —— 函数模板 + 类模板 + 函数指针遍历](#ch8-t)
9. [Sorting 排序 —— 六种排序全代码 + 对比表](#ch9-so)
10. [Hash Table 哈希表 —— 二次探测 + 线性探测 + 链地址](#ch10-h)
11. [Binary Tree 二叉树 —— 三遍历 + 高度](#ch11-b)
12. [Binary Search Tree 二叉搜索树 —— 插入 + 三种删除 + BuildableTree](#ch12-bst)
13. [AVL Tree 平衡二叉搜索树 —— 四种旋转 + 插入删除再平衡 + 课件七漏洞](#ch13-a)
14. [C++ OOP 进阶 —— 深拷贝 + 三/五法则 + 继承](#ch14-oop)
15. [经典错误自查表](#ch15-err)

---

<a id="ch1-p"></a>
## 1. 指针、引用与动态内存

### 1.1 指针是「地址变量」

```cpp
int a = 10;            // a 是一个 int 变量，里面存着整数值 10
int *p = &a;           // p 是一个指针变量，存的是 a 的内存地址
                       // & 是取地址符：「&a」就是「a 的地址是多少」
*p = 20;               // * 是解引用符：「*p」就是「去 p 存的地址那里，操作那个变量」
                       // 等价于 a = 20

// 多级指针：指针变量自己也有地址，也能被别的指针指着
char **pp;             // 两个星号 = 二级指针 = 指向指针的指针
```

### 1.2 引用是「别名」

```cpp
int a = 5;
int &ref = a;          // ref 不是新变量，是 a 的别名
ref = 10;              // 等价于 a = 10

// 最常见用法：函数参数传引用，函数内直接改外部变量
void swap(int &x, int &y) { int t = x; x = y; y = t; }
```

**指针 vs 引用**：指针能换指向、能是 nullptr；引用初始化后不可换、必须绑定有效对象。

### 1.3 动态内存 —— 堆上的手动空间

```cpp
int *p = new int;        // 在堆上申请 4 字节，返回地址
*p = 42;
delete p;                // 归还

int *arr = new int[10];  // 申请数组
delete[] arr;            // new/delete 和 new[]/delete[] 必须配对
```

链表、树的大小预先不确定，全靠 `new`/`delete` 在堆上生存。

### 1.4 I/O 速查

```cpp
int n; double d; string s;
cin >> n >> d;           // 空格/换行分隔
getline(cin, s);         // 读整行

// ⚠️ cin>> 后直接 getline 会读到换行符残留！
cin >> n;
cin.ignore(numeric_limits<streamsize>::max(), '\n');
getline(cin, s);

// 大数据量加速
ios::sync_with_stdio(false);
cin.tie(nullptr);
```

---

<details>
<summary>📝 题目 1-1：推演二级指针</summary>

**题目**：以下代码输出什么？

```cpp
char a='b', b='e';
char *p1=&a, **p2=&p1;
*p1='m'; *p2=&b; *p1='n';
cout<<a<<b;
```

**答案**：输出 **mn**。一步步推：

| 步骤 | 效果 |
|------|------|
| p1=&a | p1 指向 a |
| p2=&p1 | p2 指向 p1 |
| *p1='m' | a='m' |
| *p2=&b | 通过 p2 修改 p1→p1 改为指向 b |
| *p1='n' | 此时 p1 指向 b → b='n' |

a 始终是 'm'，b 变成了 'n'。

</details>

---

<a id="ch2-e"></a>
## 2. Error_code 错误码体系

### 含义与定义

```cpp
enum Error_code {
    success,          // 操作成功 —— 常用
    underflow,        // 下溢：空容器上取元素 —— 如空栈 pop
    overflow,         // 上溢：满容器上放元素 —— 如满队列 push
    range_error,      // 参数范围不对
    not_present,      // 要找的东西不在 —— 如哈希表检索不到
    duplicate_error   // 你插入一个已存在的 key
};
```

### 使用模式

函数返回 Error_code 表示状态，真正的数据通过引用参数传出来：

```cpp
Error_code Stack::pop(int &val) {
    if(empty()) return underflow;   // 「失败原因：空了」
    val = data[top--];              // 通过引用传出实际值
    return success;                 // 「成功取出来了」
}

// 调用方：
int x;
Error_code ec = st.pop(x);
if(ec == success) cout << "pop 成功：" << x;
else cout << "栈空无法 pop";
```

---

<a id="ch3-s"></a>
## 3. Stack 栈

### 核心概念

栈 = 一摞盘子。只能在最上面放（push），也只能从最上面取（pop）。最后放的最先被拿走 —— **LIFO**。

### 3.1 必须掌握的五种操作

| 操作 | 做什么 | 返回值 |
|------|--------|--------|
| `push(x)` | 把 x 压入栈顶 | void 或 Error_code |
| `pop()` | 删除栈顶元素 | void 或 Error_code |
| `top()` | 只看栈顶，不删除 | 元素值 |
| `empty()` | 栈空否 | bool |
| `size()` | 几个元素 | int |

> `pop()` 只删不返回！要拿值必须先 `top()` 再 `pop()`。

### 3.2 实现一：STL stack（直接用）

```cpp
#include <stack>
stack<int> st;
st.push(10);             // 入
st.push(20);
cout << st.top();        // 看栈顶 → 20
st.pop();                // 删栈顶
cout << st.size();       // 个数 → 1
cout << st.empty();      // 空否 → 0（false）
```

### 3.3 实现二：数组栈（底层原理）

```cpp
const int MAX = 1000;
int arr[MAX];            // 存数据的数组
int sp = -1;             // 栈顶指针，-1=空

void push(int x) { arr[++sp] = x; }     // 先上移指针再放值
void pop()  { if(sp>=0) sp--; }         // 下移=逻辑删除
int  top()  { return arr[sp]; }         // sp 指向的位置
bool empty(){ return sp == -1; }        // 指针在-1就是空
int  size() { return sp + 1; }          // 下标+1=个数
```

**图演 push(1) push(2) pop()**：
```
sp=-1    push(1)    sp=0     push(2)    sp=1     pop()    sp=0
+---+              +---+              +---+              +---+
| ? |              | 1 | ←sp          | 1 |              | 1 | ←sp
+---+              +---+              | 2 | ←sp          | 2 | (逻辑消失)
| ? |              | ? |              +---+              +---+
+---+              +---+              | ? |
                                       +---+
```

### 3.4 实现三：链式栈（不限容量）

```cpp
struct Node {
    int data;                     // 存的值
    Node *next;                   // 指向下一个结点（往下的结点）
    Node(int d, Node *n=nullptr):data(d),next(n){}
};

class LinkedStack {
    Node *top_node;               // 栈顶指针，nullptr=空
public:
    LinkedStack():top_node(nullptr){}
    bool empty(){ return top_node==nullptr; }

    void push(int x){
        // 新结点指旧栈顶 → 新结点变成新栈顶
        top_node = new Node(x, top_node);
    }
    void pop(){
        if(empty())return;
        Node *tmp=top_node;        // 记住要删的
        top_node=top_node->next;   // 栈顶下移
        delete tmp;                // 归还内存
    }
    int top(){ return top_node->data; }
};
```

### 3.5 应用：括号匹配

```cpp
bool match(string s){
    stack<char> st;
    for(char c:s){
        if(c=='('||c=='['||c=='{')st.push(c);  // 左括号=入栈等待
        else{                                    // 右括号=必须配对
            if(st.empty())return false;          // 没人配它
            char t=st.top();st.pop();
            if((c==')'&&t!='(')||(c==']'&&t!='[')||(c=='}'&&t!='{'))
                return false;                    // 类型不对
        }
    }
    return st.empty();              // 全配对完=栈空
}
```

### 3.6 应用：逆波兰计算

用栈计算 `"3 4 2 * +"`：
- 数字直接入栈
- 遇运算符弹出栈顶两个数（先出的是右操作数！），算完入栈

| 读入 | 操作 | 栈 |
|------|------|-----|
| 3 | push | [3] |
| 4 | push | [3,4] |
| 2 | push | [3,4,2] |
| * | pop 2,4 → 4×2=8 → push | [3,8] |
| + | pop 8,3 → 3+8=11 → push | [11] |

---

<details>
<summary>📝 题目 3-1：括号匹配判断</summary>

**题**：`"({[()]})"` 是否匹配？`"({[})"` 呢？

**答**：前者匹配（最后栈空），后者不匹配——读到 `}` 时栈顶是 `[`，类型错。

</details>

<details>
<summary>📝 题目 3-2：逆波兰计算</summary>

**题**：算 `"5 1 2 + 4 * + 3 -"`

**答**：| `1 2 +` → 3 → [5,3] | `4 *` → 12 → [5,12] | `+` → 17 | `3 -` → **14** |

</details>

---

<a id="ch4-q"></a>
## 4. Queue 队列

### 核心概念

队列 = 排队。队尾进（push），队头出（pop）。先进先出 —— **FIFO**。

### 4.1 五种操作

| 操作 | 做什么 |
|------|--------|
| `push(x)` | x 入队尾 |
| `pop()` | 队头出列（删除） |
| `front()` | 只看队头，不删除 |
| `empty()` | 空否 |
| `size()` | 几个元素 |

### 4.2 普通数组队列的问题

```cpp
int q[MAX]; int front=0, rear=0;
// 入队：q[rear++] = x;
// 出队：front++;
```

问题：出队后 front 前面那段空间没法再用了 ← **假溢出**。解决：**循环队列**。

### 4.3 循环队列

用取模 `%` 让数组逻辑上首尾相接：

```cpp
const int MAX=100;
template<typename T>
class CirQueue{
    T data[MAX];
    int front, rear, cnt;       // cnt 记录元素数（区分空/满的方案一）
public:
    CirQueue():front(0),rear(0),cnt(0){}
    bool empty(){ return cnt==0; }
    bool full(){  return cnt==MAX; }

    Error_code push(T x){
        if(full())return overflow;
        data[rear]=x;
        rear=(rear+1)%MAX;      // 取模实现回绕
        cnt++;
        return success;
    }
    Error_code pop(T &x){
        if(empty())return underflow;
        x=data[front];
        front=(front+1)%MAX;
        cnt--;
        return success;
    }
    T get_front(){ return data[front]; }
    int size(){ return cnt; }
};
```

**区分空/满的两种方法**：
1. 记录 cnt（上面用的）
2. 牺牲一格：`front==rear` 是空，`(rear+1)%MAX==front` 是满

### 4.4 链式队列

```cpp
struct Node{int data; Node *next; Node(int d,Node*n=nullptr):data(d),next(n){}};

class LinkedQueue{
    Node *front_node, *rear_node;
public:
    LinkedQueue():front_node(nullptr),rear_node(nullptr){}
    bool empty(){ return front_node==nullptr; }

    void push(int x){
        if(!front_node)           // 空队列：前后指针都指向同一个新结点
            front_node=rear_node=new Node(x);
        else{                     // 非空：挂在队尾后面，更新队尾
            rear_node->next=new Node(x);
            rear_node=rear_node->next;
        }
    }
    void pop(){
        if(!front_node)return;
        Node *tmp=front_node;
        front_node=front_node->next;  // 队头后移
        delete tmp;
        if(!front_node)rear_node=nullptr; // 删光了，队尾也清掉
    }
    int front(){ return front_node->data; }
};
```

---

<details>
<summary>📝 题目 4-1：循环队列判空满</summary>

**题**：不用 cnt，怎么区分空和满？

**答**：牺牲一个单元格。`front==rear` 为空，`(rear+1)%MAX==front` 为满。此时最多存 MAX-1 个。

</details>

<details>
<summary>📝 题目 4-2：元素个数</summary>

**题**：front=3, rear=1, MAX=8。几个元素？

**答**：`(1-3+8)%8 = 6` 个。

</details>

---

<a id="ch5-l"></a>
## 5. Linked List 链表

### 核心概念

链表 = 用指针把一堆独立结点串起来。每个结点存数据 + 一个指向下一个的指针。

### 5.1 单链表结点

```cpp
template<typename T>
struct Node{
    T data;                 // 存的数据
    Node<T> *next;          // 指向下一个结点的指针
    Node(T d,Node<T>*n=nullptr):data(d),next(n){}
};
```

### 5.2 单链表类（含全部操作）

```cpp
template<typename T>
class List{
    Node<T> *head;          // 头指针：指向第一个结点
    int _size;              // 结点个数

    // 辅助：释放所有结点
    void clear(){
        while(head){
            Node<T> *tmp=head;
            head=head->next; // 先挪头指针再删
            delete tmp;
        }
        _size=0;
    }

    // 辅助：深拷贝（从另一条链表复制过来）
    void copyFrom(const List<T> &other){
        if(!other.head){head=nullptr;_size=0;return;}
        head=new Node<T>(other.head->data);      // 复制第一个
        Node<T> *cur=head,*ocur=other.head->next;
        while(ocur){
            cur->next=new Node<T>(ocur->data);   // 逐个复制
            cur=cur->next;
            ocur=ocur->next;
        }
        _size=other._size;
    }

public:
    List():head(nullptr),_size(0){}
    ~List(){ clear(); }

    // 拷贝构造：List b = a; 时自动调用
    List(const List<T> &other):head(nullptr),_size(0){ copyFrom(other); }

    // 赋值：b = a; 时自动调用
    List<T>& operator=(const List<T> &other){
        if(this!=&other){          // 防自赋值
            clear();               // 先扔掉自己的
            copyFrom(other);       // 复制别人的
        }
        return *this;
    }

    int size()const{ return _size; }

    // ----- 插入 -----
    void insert(int pos,T val){
        if(pos<0||pos>_size)return;   // 范围检查
        if(pos==0)                     // 插头部：直接换头
            head=new Node<T>(val,head);
        else{                          // 插中间：找前驱
            Node<T> *prev=head;
            for(int i=0;i<pos-1;i++)prev=prev->next;
            prev->next=new Node<T>(val,prev->next);
        }
        _size++;
    }

    // ----- 删除 -----
    void remove(int pos,T &val){
        if(pos<0||pos>=_size)return;
        Node<T> *target;
        if(pos==0){                    // 删头
            target=head;
            head=head->next;
        }else{                         // 删中间：找前驱
            Node<T> *prev=head;
            for(int i=0;i<pos-1;i++)prev=prev->next;
            target=prev->next;
            prev->next=target->next;
        }
        val=target->data;              // 通过引用传出值
        delete target;
        _size--;
    }

    // ----- 遍历 -----
    // visit 是函数指针：每路过一个结点就调一次
    void traverse(void (*visit)(T&)){
        Node<T> *cur=head;
        while(cur){ visit(cur->data); cur=cur->next; }
    }
};
```

### 5.3 链表反转

```cpp
void reverse(){
    Node<T> *prev=nullptr,*cur=head;
    while(cur){
        Node<T> *next=cur->next;   // 先记住下一站
        cur->next=prev;            // 把箭头反过来
        prev=cur;                  // 前驱前进
        cur=next;                  // 当前前进
    }
    head=prev;                     // 最后 prev 就是新头
}
```

图解：`1→2→3→nullptr` 变成 `3→2→1→nullptr`

### 5.4 双链表

多一个 `prev` 指针指向前驱，方便前后双向移动。

```cpp
template<typename T>
struct DNode{
    T data;
    DNode<T> *prev,*next;
    DNode(T d,DNode<T>*p=nullptr,DNode<T>*n=nullptr):data(d),prev(p),next(n){}
};

// 在 p 之后插入 val
void insertAfter(DNode<T> *p,T val){
    DNode<T> *n=new DNode<T>(val,p,p->next);
    if(p->next)p->next->prev=n;    // 原后继的 prev 要更新
    p->next=n;
}
```

### 5.5 应用：约瑟夫环

n 人围圈，报数到 m 出局，求最后一人。用 STL list 模拟：

```cpp
void Josephus(int n,int m){
    list<int> ppl;
    for(int i=1;i<=n;i++)ppl.push_back(i);

    auto it=ppl.begin();
    while(ppl.size()>1){
        for(int i=1;i<m;i++){      // 报数移动
            ++it;
            if(it==ppl.end())it=ppl.begin();  // 环形
        }
        it=ppl.erase(it);          // 出局
        if(it==ppl.end())it=ppl.begin();
    }
    cout<<"幸存者:"<<ppl.front();
}
```

---

<details>
<summary>📝 题目 5-1：反转推演</summary>

**题**：`1→2→3→4→nullptr` 迭代反转每步结果。

**答**：初始 prev=null,cur=1。第1步：1→null, prev=1,cur=2；第2步：2→1→null, prev=2,cur=3；第3步：3→2→1→null, prev=3,cur=4；第4步：4→3→2→1→null。head=4。

</details>

---

<a id="ch6-r"></a>
## 6. Recursion 递归与回溯

### 核心概念

递归 = 函数自己调用自己。三要素：**基本情况**（最小规模直接返回）、**递归调用**（向基本情况逼近）、**问题分解**（规模减小）。

### 6.1 经典递归

```cpp
int factorial(int n){
    if(n<=1)return 1;                  // 基本情况
    return n*factorial(n-1);           // 递归
}

int fib(int n){
    if(n<=1)return n;                  // 基本情况
    return fib(n-1)+fib(n-2);          // 递归（但 O(2ⁿ)，要优化）
}
```

**递归 vs 迭代**：递归的 fib 有大量重复计算（如 fib(5) 多次算 fib(3)），可用递推 O(n) 优化或用数组存已算结果（记忆化）。

### 6.2 回溯框架 —— 八皇后问题

回溯 = 递归 + 试错 + 撤销。关键四步：尝试 → 检查 → 递归 → 撤销。

```cpp
const int MAX=30;
class Queens{
    int cnt;                     // 已放皇后数 = 当前行号
    bool q[MAX][MAX];            // 棋盘：true=有皇后
public:
    int sz;
    Queens(int s):sz(s),cnt(0){ memset(q,0,sizeof(q)); }
    bool solved(){ return cnt==sz; }

    // 检查 (cnt, col) 安全否
    bool safe(int col){
        for(int r=0;r<cnt;r++)         // 扫所有已放的行
            for(int c=0;c<sz;c++)
                if(q[r][c]){
                    if(c==col)return false;             // 同列冲突
                    if(abs(c-col)==abs(r-cnt))return false; // 对角线冲突
                }
        return true;
    }

    void put(int col){ q[cnt][col]=1; cnt++; }   // 放置
    void undo(int col){ cnt--; q[cnt][col]=0; }  // 撤销
};

// DFS 回溯
void enumerate(Queens &q,long long &ans){
    if(q.solved()){ ans++; return; }         // 找到一解
    for(int c=0;c<q.sz;c++){
        if(q.safe(c)){
            q.put(c);                        // 尝试
            enumerate(q,ans);                // 递归
            q.undo(c);                       // 撤销 ← 回溯关键
        }
    }
}
```

---

<details>
<summary>📝 题目 6-1：递归 vs 递推</summary>

**题**：fib(10) 递归和递推各多少计算量？

**答**：递归 O(2¹⁰)≈1024 次调用；递推 O(10)=10 步。递推远优。

</details>

---

<a id="ch7-po"></a>
## 7. Polynomial 多项式

### 核心概念

用链表存多项式：每个结点存一个非零项的系数 + 指数。避免存零项浪费空间。

```cpp
struct Term{
    int coef;              // 系数
    int exp;               // 指数
    Term *next;
    Term(int c,int e,Term*n=nullptr):coef(c),exp(e),next(n){}
};
```

### 多项式加法

两链表各自按指数降序排列，双指针归并：

```cpp
Term* addPoly(Term *a,Term *b){
    Term dummy(0,0),*tail=&dummy;    // 哑结点简化头部处理
    while(a&&b){
        if(a->exp > b->exp){         // a 的指数大：直接挂 a
            tail->next=new Term(a->coef,a->exp);
            a=a->next;
        }else if(a->exp < b->exp){   // b 的指数大：挂 b
            tail->next=new Term(b->coef,b->exp);
            b=b->next;
        }else{                       // 指数相同：系数相加
            int sum=a->coef+b->coef;
            if(sum!=0) tail->next=new Term(sum,a->exp); // 抵消为 0 则跳过
            a=a->next; b=b->next;
        }
        if(tail->next)tail=tail->next;
    }
    while(a){tail->next=new Term(a->coef,a->exp);tail=tail->next;a=a->next;}
    while(b){tail->next=new Term(b->coef,b->exp);tail=tail->next;b=b->next;}
    return dummy.next;
}
```

---

<details>
<summary>📝 题目 7-1：加法推演</summary>

**题**：`3x⁵ + 2x³ + x` 加 `4x⁴ - x³ + 2x`

**答**：x⁵→3、x⁴→4、x³→2+(-1)=1、x→1+2=3。结果：**3x⁵ + 4x⁴ + x³ + 3x**。

</details>

---

<a id="ch8-t"></a>
## 8. Template 模板

### 写一次，适配所有类型

```cpp
// 函数模板
template<typename T>
T myMax(T a,T b){ return a>b?a:b; }

cout<<myMax(3,5);        // T 推导为 int
cout<<myMax(3.14,2.71);  // T 推导为 double

// 类模板
template<typename T>
class Stack{
    vector<T> data;
public:
    void push(T x){data.push_back(x);}
    void pop(){data.pop_back();}
    T top(){return data.back();}
};

Stack<int> si;            // 装 int 的栈
Stack<string> ss;         // 装 string 的栈
```

### 函数指针遍历模式

```cpp
template<typename T>
void traverse(Node<T>*head,void(*visit)(T&)){
    Node<T>*cur=head;
    while(cur){visit(cur->data);cur=cur->next;}
}

void print(int&x){cout<<x<<endl;}
void upd(int&x){x*=2;}

List<int> l;
l.traverse(print);     // 打印每个元素
l.traverse(upd);       // 每个元素翻倍
```

---

<a id="ch9-so"></a>
## 9. Sorting 排序

### 9.1 选择排序 —— 每次找最小的放到前面

```cpp
void selection_sort(int a[],int n){
    for(int i=0;i<n-1;i++){             // i=当前要填的位置
        int mn=i;                        // 假设 i 处就是最小
        for(int j=i+1;j<n;j++)           // 在 i 后面找更小的
            if(a[j]<a[mn])mn=j;
        if(mn!=i)swap(a[i],a[mn]);       // 把最小的换到 i 处
    }
}
// O(n²)，不稳定
```

### 9.2 插入排序 —— 像整理扑克牌

```cpp
void insertion_sort(int a[],int n){
    for(int i=1;i<n;i++){                // 从第二张开始
        int key=a[i];                    // 抽出这张牌
        int j=i-1;
        while(j>=0&&a[j]>key){          // 把比它大的往后挪
            a[j+1]=a[j];
            j--;
        }
        a[j+1]=key;                      // 插入到正确位置
    }
}
// 最好 O(n)（已排好），最坏 O(n²)，稳定
```

### 9.3 希尔排序 —— 插入排序的升级版

```cpp
void shell_sort(int a[],int n){
    for(int gap=n/2;gap>0;gap/=2){       // gap 逐步缩小
        for(int i=gap;i<n;i++){           // 对每个子序列做插排
            int t=a[i],j;
            for(j=i;j>=gap&&a[j-gap]>t;j-=gap)
                a[j]=a[j-gap];
            a[j]=t;
        }
    }
}
```

### 9.4 快速排序 —— 基准左右分治

```cpp
void quick_sort(int a[],int l,int r){
    if(l>=r)return;
    int p=a[l+(r-l)/2];                  // 取中间当 pivot
    int i=l,j=r;
    while(i<=j){
        while(a[i]<p)i++;                // 找左边比 pivot 大的
        while(a[j]>p)j--;                // 找右边比 pivot 小的
        if(i<=j){swap(a[i],a[j]);i++;j--;} // 交换
    }
    if(l<j)quick_sort(a,l,j);            // 递归左边
    if(i<r)quick_sort(a,i,r);            // 递归右边
}
// 平均 O(nlogn)，最坏 O(n²)，不稳定
```

### 9.5 归并排序 —— 先分后合

```cpp
void merge(int a[],int l,int m,int r){
    int n1=m-l+1,n2=r-m;
    int L[n1],R[n2];                     // 临时数组存左右
    for(int i=0;i<n1;i++)L[i]=a[l+i];
    for(int i=0;i<n2;i++)R[i]=a[m+1+i];
    int i=0,j=0,k=l;
    while(i<n1&&j<n2)                    // 合并：谁小取谁
        a[k++]=(L[i]<=R[j])?L[i++]:R[j++];
    while(i<n1)a[k++]=L[i++];            // 剩下的直接抄
    while(j<n2)a[k++]=R[j++];
}

void merge_sort(int a[],int l,int r){
    if(l>=r)return;
    int m=l+(r-l)/2;
    merge_sort(a,l,m);                   // 左边排序
    merge_sort(a,m+1,r);                 // 右边排序
    merge(a,l,m,r);                      // 合并有序两边
}
// O(nlogn)，稳定，但额外空间 O(n)
```

### 9.6 堆排序 —— 用最大堆取最大值

```cpp
void heapify(int a[],int n,int i){
    int mx=i;                            // 假设自己是最大
    int l=2*i+1,r=2*i+2;
    if(l<n&&a[l]>a[mx])mx=l;             // 左孩子更大
    if(r<n&&a[r]>a[mx])mx=r;             // 右孩子更大
    if(mx!=i){swap(a[i],a[mx]);heapify(a,n,mx);} // 下沉
}

void heap_sort(int a[],int n){
    for(int i=n/2-1;i>=0;i--)heapify(a,n,i);  // 建堆
    for(int i=n-1;i>0;i--){                   // 取最大值
        swap(a[0],a[i]);                       // 最大→末尾
        heapify(a,i,0);                        // 剩余再堆化
    }
}
// O(nlogn)，不稳定，原地
```

### 9.7 六种排序总结

| 算法 | 平均 | 最坏 | 稳定 | 原地 |
|------|------|------|------|------|
| 选择 | O(n²) | O(n²) | × | √ |
| 插入 | O(n²) | O(n²) | √ | √ |
| 希尔 | ~O(n¹·³³) | O(n²) | × | √ |
| 快速 | O(nlogn) | O(n²) | × | √ |
| 归并 | O(nlogn) | O(nlogn) | √ | × |
| 堆 | O(nlogn) | O(nlogn) | × | √ |

---

<details>
<summary>📝 题目 9-1：快排一趟</summary>

**题**：`[5,3,8,6,2,7]` 快排第一趟（pivot=6）。

**答**：i 找≥6→arr[2]=8，j 找≤6→arr[4]=2，交换→[5,3,2,6,8,7]。左边≤6，右边≥6。

</details>

<details>
<summary>📝 题目 9-2：堆排序过程</summary>

**题**：[10,9,8,7,6,5,4,3,2,1] 已是大根堆，两次交换后数组状况。

**答**：第一次 swap(10,1)→[1,9,8,7,6,5,4,3,2,|10]，heapify 得 [9,7,8,3,6,5,4,1,2,|10]。第二次 swap(9,2)→[2,7,8,3,6,5,4,1,|9,10]，heapify 得 [8,7,5,3,6,2,4,1,9,10]。

</details>

---

<a id="ch10-h"></a>
## 10. Hash Table 哈希表

### 核心思想

把 key 通过哈希函数映射到数组下标。**除留余数法**：`h(key)=key%table_size`。

核心三操作：**insert**（插入）、**retrieve**（查找）、**remove**（删除）。两个关键字映射到同一位置叫**冲突**，需要解决。

### 10.1 二次探测实现

```cpp
const int H=7;

int hash(Key k){ return k%H; }   // 哈希函数

class HashTable{
    Record tbl[H];
    bool emp[H];               // 这个位置是空的吗
    bool del[H];               // 这个位置被删过吗（墓碑标记）
                               // ⚠️ 为什么需要 del？因为删除后如果直接置空，
                               // 后续查找会以为"没找到"而提前终止
public:
    void clear(){
        for(int i=0;i<H;i++){ emp[i]=true; del[i]=false; }
    }

    // 插入——二次探测 pos=(h + i²) % H
    Error_code insert(const Record &r,int &pos){
        Key k=r.the_key();
        int h=hash(k);
        int fd=-1;                // 第一个遇到的墓碑位置

        for(int i=0;i<H;i++){
            pos=(h+i*i)%H;         // 二次探测公式
            if(emp[pos]){          // 找到空位
                if(fd!=-1)pos=fd;  // 优先填墓碑
                tbl[pos]=r;
                emp[pos]=false;
                return success;
            }
            if(del[pos]){          // 墓碑：记下来但不停止
                if(fd==-1)fd=pos;
                continue;
            }
            if(tbl[pos].the_key()==k)return duplicate_error; // 重复
        }
        if(fd!=-1){                // 遍历完只有墓碑可用
            pos=fd;tbl[pos]=r;
            emp[pos]=false;del[pos]=false;
            return success;
        }
        return overflow;           // 表真满了
    }

    // 查找——也用二次探测
    Error_code retrieve(const Key &k,Record &found,int &pos){
        int h=hash(k);
        for(int i=0;i<H;i++){
            pos=(h+i*i)%H;
            if(emp[pos])return not_present;          // 遇到空位=一定没有
            if(!del[pos]&&tbl[pos].the_key()==k){     // 找到
                found=tbl[pos];
                return success;
            }
        }
        return not_present;
    }

    // 删除——软删除（标记墓碑）
    Error_code remove(const Key &k,Record &found,int &pos){
        int h=hash(k);
        for(int i=0;i<H;i++){
            pos=(h+i*i)%H;
            if(emp[pos])return not_present;
            if(!del[pos]&&tbl[pos].the_key()==k){
                found=tbl[pos];
                del[pos]=true;     // 标记删除，不置空！
                return success;
            }
        }
        return not_present;
    }
};
```

### 10.2 几种探测方式对比

| 方式 | 序列 | 特点 |
|------|------|------|
| 线性探测 | (h+1),(h+2),... | 简单但易聚集 |
| 二次探测 | (h+1²),(h+2²),... | 减少聚集 |

### 10.3 链地址法（每个槽一个链表）

```cpp
vector<int> tbl[H];
void insert(int k){ tbl[k%H].push_back(k); }
bool search(int k){
    for(int x:tbl[k%H])if(x==k)return true;
    return false;
}
```

---

<details>
<summary>📝 题目 10-1：二次探测插入推演</summary>

**题**：H=7, h(k)=k%7。依次插入 10,22,31,4,15。

**答**：10→3；22→1；31→h=3冲突，i=1→(3+1)%7=4✅；4→h=4冲突，i=1→5✅；15→h=1冲突，i=1→2✅。

</details>

---

<a id="ch11-b"></a>
## 11. Binary Tree 二叉树

### 核心概念

每个结点最多俩孩子：left 和 right。链式存储——每个结点是 `data + left指针 + right指针`。

```cpp
template<class E>
struct Binary_node{
    E data;
    Binary_node<E> *left,*right;
    Binary_node():left(nullptr),right(nullptr){}
    Binary_node(const E &d):data(d),left(nullptr),right(nullptr){}
};
```

### 二叉树类 + 三种遍历

```cpp
template<class E>
class Binary_tree{
protected:
    Binary_node<E> *root;
    int cnt;

    // 递归遍历辅助
    void preAux(Binary_node<E> *t,void(*v)(E&)){
        if(!t)return;
        v(t->data);            // 根
        preAux(t->left,v);     // 左
        preAux(t->right,v);    // 右
    }
    void inAux(Binary_node<E> *t,void(*v)(E&)){
        if(!t)return;
        inAux(t->left,v);      // 左
        v(t->data);            // 根
        inAux(t->right,v);     // 右
    }
    void postAux(Binary_node<E> *t,void(*v)(E&)){
        if(!t)return;
        postAux(t->left,v);    // 左
        postAux(t->right,v);   // 右
        v(t->data);            // 根
    }

    int heightAux(Binary_node<E> *t)const{
        if(!t)return 0;
        return 1+max(heightAux(t->left),heightAux(t->right));
    }

    void clear(Binary_node<E> *&t){
        if(!t)return;
        clear(t->left);        // 先递归删左
        clear(t->right);       // 再递归删右
        delete t;              // 最后删自己
        t=nullptr;
    }

public:
    Binary_tree():root(nullptr),cnt(0){}
    bool empty()const{return cnt==0;}
    int size()const{return cnt;}
    int height()const{return heightAux(root);}
    void preorder(void(*v)(E&)){preAux(root,v);}
    void inorder(void(*v)(E&)){inAux(root,v);}
    void postorder(void(*v)(E&)){postAux(root,v);}
};
```

### 遍历图示

```
      A
     / \
    B   C
   / \   \
  D   E   F

前序(根左右): A B D E C F
中序(左根右): D B E A C F
后序(左右根): D E B F C A
```

---

<details>
<summary>📝 题目 11-1：根据遍历序列还原树</summary>

**题**：前序 ABDECF，中序 DBEAFC，画出树。

**答**：前序首字母 A 是根；中序 DBEAFC → A 左 DB E，右 FC。递归：左子树根 B，B 左 D 右 E；右子树根 C，C 左 F。即上面那棵树。

</details>

---

<a id="ch12-bst"></a>
## 12. Binary Search Tree 二叉搜索树

### BST 性质

对任意结点：**左子树所有值 < 结点值 < 右子树所有值**。中序遍历得到有序序列。

### BST 类（继承 Binary_tree）

```cpp
template<class R>
class Search_tree:public Binary_tree<R>{
public:
    // 查找——利用 BST 性质二分
    Error_code search(R &t)const{
        Binary_node<R> *f=searchNode(this->root,t);
        if(!f)return not_present;
        t=f->data;                    // 通过引用返回
        return success;
    }

    // 插入——递归找空位
    Error_code insert(const R &d){
        return insAux(this->root,d);
    }

    // 删除——分三种情况
    Error_code remove(const R &t){
        return remAux(this->root,t);
    }

    int leaves()const{return leavesAux(this->root);}
    int sum()const{return sumAux(this->root);}

private:
    Binary_node<R>* searchNode(Binary_node<R>*t,const R&d)const{
        if(!t||t->data==d)return t;
        if(d<t->data)return searchNode(t->left,d);
        return searchNode(t->right,d);
    }

    Error_code insAux(Binary_node<R> *&t,const R&d){
        if(!t){                       // 找到空位
            t=new Binary_node<R>(d);
            this->cnt++;
            return success;
        }
        if(d<t->data)return insAux(t->left,d);
        if(d>t->data)return insAux(t->right,d);
        return duplicate_error;       // 等于=重复
    }

    Error_code remAux(Binary_node<R> *&t,const R&d){
        if(!t)return not_present;
        if(d<t->data)return remAux(t->left,d);
        if(d>t->data)return remAux(t->right,d);
        return remRoot(t);           // 找到，删它
    }

    Error_code remRoot(Binary_node<R> *&t){
        // 情况1：叶子
        if(!t->left&&!t->right){delete t;t=nullptr;this->cnt--;return success;}
        // 情况2-a：只有右孩子
        if(!t->left){
            Binary_node<R> *tmp=t;
            t=t->right;              // 用右孩子替代自己
            delete tmp;this->cnt--;
            return success;
        }
        // 情况2-b：只有左孩子
        if(!t->right){
            Binary_node<R> *tmp=t;
            t=t->left;               // 用左孩子替代自己
            delete tmp;this->cnt--;
            return success;
        }
        // 情况3：两个孩子 → 找中序后继（右子树最左）
        Binary_node<R> *par=t,*succ=t->right;
        while(succ->left){par=succ;succ=succ->left;}  // 找后继
        t->data=succ->data;          // 用后继的值替换
        if(par==t)par->right=succ->right;  // 后继是右孩子
        else      par->left=succ->right;   // 后继在更深处
        delete succ;this->cnt--;
        return success;
    }

    int leavesAux(Binary_node<R>*t)const{
        if(!t)return 0;
        if(!t->left&&!t->right)return 1;
        return leavesAux(t->left)+leavesAux(t->right);
    }

    int sumAux(Binary_node<R>*t)const{
        if(!t)return 0;
        return t->data+sumAux(t->left)+sumAux(t->right);
    }
};
```

### BST 删除三种情况

| 情况 | 被删结点 | 操作 |
|------|---------|------|
| 1 | 叶子 | 直接 delete |
| 2 | 只有一个孩子 | 用孩子替代自己 |
| 3 | 有两个孩子 | 找右子树最小值（中序后继）替换值，删后继 |

### Buildable Tree

将排序好的列表递归二分为平衡 BST：

```cpp
Binary_node<R>* buildSubtree(List<R>&l,int lo,int hi){
    if(lo>hi)return nullptr;
    int mid=(lo+hi)/2;              // 中间值做根
    Binary_node<R>*n=new Binary_node<R>;
    R val;l.retrieve(mid,val);
    n->data=val;
    n->left=buildSubtree(l,lo,mid-1);
    n->right=buildSubtree(l,mid+1,hi);
    return n;
}
```

---

<details>
<summary>📝 题目 12-1：BST 插入</summary>

**题**：依次插入 [5,3,7,2,4,6,8]。

**答**：
```
    5
   / \
  3   7
 / \ / \
2  4 6 8
```

</details>

<details>
<summary>📝 题目 12-2：BST 删根</summary>

**题**：上树删 5。

**答**：找右子树最小值 6 替换，删原 6：
```
    6
   / \
  3   7
 / \   \
2  4    8
```

</details>

---

<a id="ch13-a"></a>
## 13. AVL Tree 平衡二叉搜索树

### AVL 定义

自平衡 BST：任一结点左右子树高度差 ≤ 1。平衡因子 bf = 左高 - 右高 ∈ {-1,0,1}。

```cpp
enum Balance_factor{left_higher,equal_height,right_higher};
```

### AVL 结点

```cpp
template<class R>
struct AVL_node:public Binary_node<R>{
    Balance_factor balance;
    AVL_node():balance(equal_height){this->left=this->right=nullptr;}
    AVL_node(const R&x):balance(equal_height){this->data=x;this->left=this->right=nullptr;}
    void set_balance(Balance_factor b){balance=b;}
    Balance_factor get_balance()const{return balance;}
};
```

### 四种失衡与旋转

| 类型 | 动作 | 旋转 |
|------|------|------|
| **LL** | 左子树的左子树插入 | 右旋一次 |
| **RR** | 右子树的右子树插入 | 左旋一次 |
| **LR** | 左子树的右子树插入 | 先左旋再右旋 |
| **RL** | 右子树的左子树插入 | 先右旋再左旋 |

```cpp
// 左旋：把右边的孩子转上来
void rotate_left(Binary_node<R>*&root){
    Binary_node<R>*rt=root->right;
    root->right=rt->left;      // 右孩子的左子树挂给自己
    rt->left=root;              // 自己变成右孩子的左孩子
    root=rt;                    // 右孩子上位
}

// 右旋：把左边的孩子转上来（镜像）
void rotate_right(Binary_node<R>*&root){
    Binary_node<R>*lt=root->left;
    root->left=lt->right;
    lt->right=root;
    root=lt;
}
```

### 插入再平衡

沿路径回溯，遇到 bf 变成 ±2 时进 `left_balance` 或 `right_balance`。

```cpp
// 插入左边后子树变高
if(taller){
    switch(sub_root->get_balance()){
        case left_higher:        // 原本左高→失衡
            left_balance(sub_root);
            taller=false;        // 旋转后高度恢复
            break;
        case equal_height:       // 原本等高→变左高
            sub_root->set_balance(left_higher);
            break;
        case right_higher:       // 原本右高→变等高
            sub_root->set_balance(equal_height);
            taller=false;
            break;
    }
}
```

### 删除再平衡

删除比插入复杂：删完子树变矮（shorter=true）时沿路径检查。

**right_balance2** 比 `right_balance` 多一种 `equal_height` 情况（插入不可能出现，删除可能）。

### 课件七漏洞速查

| # | 问题 | 后果 | 修复 |
|---|------|------|------|
| 1 | `right_balance` 中 equal_height 无 break | fall-through 到双旋 | 加 break |
| 2 | `left_balance` 同上 + 错误信息写错 | 同上 | 加 break+改文字 |
| 3 | case 里声明变量无花括号 | 编译错误 "crosses init" | 加 `{}` |
| 4 | `left_balance2` 函数体为空 | 删除后无法再平衡 | 填完整实现 |
| 5 | `the_key()!=0` 当哨兵 | key=0 时失效 | 改 bool 标记 |
| 6 | 头文件缺 `#pragma once` | 重复定义 | 补上 |
| 7 | `using namespace std` 致 left/right 歧义 | 编译错误 | `this->` 限定 |

---

<details>
<summary>📝 题目 13-1：四类失衡</summary>

**题**：判断类型。(a) 右子树的右子树插入 (b) 左子树的右子树插入 (c) 左子树的左子树插入 (d) 右子树的左子树插入。

**答**：(a)RR→左旋 (b)LR→先左再右 (c)LL→右旋 (d)RL→先右再左。口诀：左左右旋，右右左旋，左右→左右旋，右左→右左旋。

</details>

<details>
<summary>📝 题目 13-2：AVL 插入推演</summary>

**题**：依次插入 [1,2,3,4] 到空 AVL。

**答**：1 根；2 右边；3 入→RR→左旋得 `2(左1右3)`；4 入→RR→左旋得 `2(左1,右3(右4))`。每个时刻树都是平衡的。

</details>

---

<a id="ch14-oop"></a>
## 14. C++ OOP 进阶

### 14.1 深拷贝 vs 浅拷贝

```cpp
class List{
    Node *head;int _sz;
public:
    // 析构：释放链表所有结点
    ~List(){clear();}

    // 拷贝构造：深拷贝，逐个结点 new
    List(const List&o):head(nullptr),_sz(0){copyFrom(o);}

    // 赋值：先释放自己，再深拷贝
    List& operator=(const List&o){
        if(this!=&o){clear();copyFrom(o);}  // 防自赋值
        return *this;
    }
};
```

**三/五法则**：定义了析构函数就必须定义拷贝构造和赋值。因为编译器默认的是浅拷贝（只复制指针值）。

### 14.2 继承

```cpp
// Search_tree 继承 Binary_tree——获得 root、cnt、遍历方法
template<class R>
class Search_tree:public Binary_tree<R>{
    // 这里能直接用 this->root、this->cnt
};
```

### 14.3 运算符重载

```cpp
// 重载 < 用于 Record 比较
bool operator<(const Record &a,const Record &b){return a.the_key()<b.the_key();}
// 重载 << 用于输出
ostream& operator<<(ostream &out,const Record &r){out<<r.the_key();return out;}
```

### 14.4 函数指针

```cpp
void print(int&x){cout<<x<<endl;}
void update(int&x){x*=2;}
list.traverse(print);     // 输出
list.traverse(update);    // 翻倍
```

---

<details>
<summary>📝 题目 14-1：三/五法则</summary>

**题**：为什么链表类必须同时定义析构、拷贝构造、赋值运算符？

**答**：链表用 new 分配堆内存。编译器默认的三者都是浅拷贝——只复制指针，不复制数据。会导致：修改一个影响另一个、double free、悬空指针。三点必须同时深拷贝。

</details>

---

<a id="ch15-err"></a>
## 15. 经典错误自查表

| # | 错误 | 错因 | 修法 |
|---|------|------|------|
| 1 | vector 越界 | 没 resize 就索引访问 | resize 或用 push_back |
| 2 | getline 读空行 | cin>> 后换行符没吃掉 | cin.ignore(...) |
| 3 | 循环脏数据 | 上轮字符串没清空 | 无条件 s="" |
| 4 | DP 下标偏移 | dp[i][j] 对应 A[i-1] 混淆 | 边界 +1 精确对应 |
| 5 | VLA 越界 | 循环边界超出声明大小 | 边界 ≤ m, ≤ n |
| 6 | sort comp 传值 | 没用引用，大量拷贝 | 全用 const & |
| 7 | a/b 截断 | 整数除法丢掉小数 | 交叉相乘比较 |
| 8 | 队列判空 | front==rear 搞反 | 循环队列用 cnt |
| 9 | 哈希删后查 | 直接置空打断探测 | 用墓碑标记 deleted |
| 10 | BST 删双孩 | 只换值忘了删后继 | 值替换 + 原后继 delete |
| 11 | switch fall-through | case 后漏 break | 补 break |
| 12 | `the_key()==0` 当哨兵 | key 真可能为 0 | 用 bool 标记 |
| 13 | left/right 命名冲突 | using namespace std + 成员叫 left | 用 this->  |
| 14 | 头文件无守卫 | 重复 include 重定义 | #pragma once |

---

*期末加油！手写代码 + 推演过程 + 搞懂每行原理 = 稳过。*
