## TODO List
申明：这个文档可能由英语写作然后实用ai翻译。
### 设计哲学：
app的设计为本地优先，希望提供最即使，快速的用户体验。所有核心功能都应在不连接至后端的情况下使用。添加删除操作优先操作browser内部的tinybase，然后同步至后端db。搜索功能则分为两部分执行，优先在本地db进行搜索然后异步执行后端搜索的结果返回后再进行合并。
### 实现功能
1. web客户端
2. 添加/删除/标记/查看待办事项（包含标题，描述可选）。
3. 数据持久化, 任务分类, 任务按优先级排序,
4. 增删查改离线可用
5. 搜索功能包含前端本地搜索和异步后端搜索
6. 多设备协作（同步）

### 前端设计
1. 使用typescript+htmlx作为主要开发语言 保证用户交互灵敏与加载速度
2. tinybase作为本地数据库，保证离线可用

### 后端设计
1. 使用springboot+java作为后端主要开发语言用于同步用户数据，验证用户身份，以及搜索功能
2. 使用mysql作为主要数据库，保证数据持久化存储
3. 使用ElasticSearch作为搜索引擎，提升搜索效率

### API设计
1. 所有核心 API 都需要认证。客户端在登录后获取 token，并在后续请求的 Authorization 请求头中携带此 token。
```
Authorization: Bearer <your_jwt_token>
```

2. POST /auth/login 用户登录以获取认证令牌。
```
{
  "username": "your_username",
  "password": "your_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY3ODg4NjQwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}

Response code:
200 OK: 登录成功。

401 Unauthorized: 用户名或密码错误。
```

3. POST /todos/sync 负责处理客户端（基于 tinybase）的离线变更，并返回服务器端的最新数据。这是一个事务性操作。
- changes: (Object) 客户端在本地发生的所有变更。

- creates: (Array<TodoCreateDTO>) 客户端本地创建的新任务列表。

- updates: (Array<TodoDTO>) 客户端本地更新的任务列表。

- deletes: (Array<Long>) 客户端本地删除的任务的 id 列表。
```
{
  "changes": {
    "creates": [
      {
        "localId": "uuid-123-abc",
        "title": "购买牛奶",
        "description": "全脂",
        "category": "生活"
      }
    ],
    "updates": [
      {
        "id": 12,
        "title": "完成项目报告 (已更新)",
        "description": "...",
        "completed": true,
        "category": "工作",
        "createdAt": "2025-11-13T10:00:00Z",
        "updatedAt": "2025-11-14T19:20:00Z"
      }
    ],
    "deletes": [
      25
    ]
  }
}

Response:
createdMappings: (Object) 一个 localId 到 id 的映射表，用于客户端将本地创建的任务与服务器ID对应起来。

serverChanges: (Array<TodoDTO>) 自 lastSyncTimestamp 以来，在服务器上发生变更（或被其他设备变更）的所有任务列表。

{
  "createdMappings": {
    "uuid-123-abc": 101
  },
  "serverChanges": [
    {
      "id": 15,
      "title": "（来自另一台设备的）新任务",
      "description": null,
      "completed": false,
      "category": "工作",
      "createdAt": "2025-11-14T18:10:00Z",
      "updatedAt": "2025-11-14T18:10:00Z"
    }
  ]
}
```

4. GET /todos/search 远程搜索终结点
- 查询参数 (Query Parameters): q (String, 必需): 搜索关键词。

```
GET /api/todos/search?q=报告

Response Body - 200 OK: 一个 TodoDTO 对象数组。可以为空
```