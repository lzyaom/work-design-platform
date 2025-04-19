// 代码预览示例集合
export interface CodeSample {
  language: string
  label: string
  code: string
}

export const codeSamples: CodeSample[] = [
  {
    language: 'typescript',
    label: 'TypeScript',
    code: `interface User {
  id: number;
  name: string;
  age?: number;
}

/**
 * 用户服务类
 */
class UserService {
  private users: Map<number, User> = new Map();

  async findById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
}`,
  },
  {
    language: 'javascript',
    label: 'JavaScript',
    code: `// 异步函数示例
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}`,
  },
  {
    language: 'html',
    label: 'HTML',
    code: `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>示例页面</title>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>这是一个示例。</p>
  </div>
</body>
</html>`,
  },
  {
    language: 'css',
    label: 'CSS',
    code: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.button {
  background: linear-gradient(to right, #4a90e2, #357abd);
  color: white;
  border-radius: 4px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}`,
  },
  {
    language: 'json',
    label: 'JSON',
    code: `{
  "name": "theme-preview",
  "version": "1.0.0",
  "description": "Monaco Editor theme preview",
  "dependencies": {
    "monaco-editor": "^0.52.0",
    "vue": "^3.4.0"
  }
}`,
  },
  {
    language: 'python',
    label: 'Python',
    code: `from typing import List, Optional

class TreeNode:
    def __init__(self, val: int = 0):
        self.val = val
        self.left = None
        self.right = None

def inorder_traversal(root: Optional[TreeNode]) -> List[int]:
    """中序遍历二叉树"""
    result = []
    
    def dfs(node: Optional[TreeNode]):
        if not node:
            return
        dfs(node.left)
        result.append(node.val)
        dfs(node.right)
    
    dfs(root)
    return result`,
  },
  {
    language: 'java',
    label: 'Java',
    code: `public class Example {
    private final List<String> items;
    
    public Example() {
        this.items = new ArrayList<>();
    }
    
    /**
     * 添加元素到列表
     * @param item 要添加的元素
     * @return 是否添加成功
     */
    public boolean addItem(String item) {
        return items.add(item);
    }
}`,
  },
  {
    language: 'rust',
    label: 'Rust',
    code: `#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && 
        self.height > other.height
    }
}`,
  },
]

// 获取随机示例
export function getRandomSample(): CodeSample {
  const index = Math.floor(Math.random() * codeSamples.length)
  return codeSamples[index]
}

// 根据语言获取示例
export function getSampleByLanguage(language: string): CodeSample | undefined {
  return codeSamples.find((sample) => sample.language.toLowerCase() === language.toLowerCase())
}

// 获取指定索引的示例
export function getSampleByIndex(index: number): CodeSample {
  return codeSamples[index % codeSamples.length]
}

// 获取所有支持的语言
export function getSupportedLanguages(): string[] {
  return [...new Set(codeSamples.map((sample) => sample.language))]
}

// 轮播示例生成器
export function* sampleIterator(): Generator<CodeSample> {
  let index = 0
  while (true) {
    yield codeSamples[index]
    index = (index + 1) % codeSamples.length
  }
}
