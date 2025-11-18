## TODO List
## Demo
访问 [todo.javacafe.dev](https://todo.javacafe.dev) 体验在线版本。

### 0. 设计哲学：
app的设计为本地优先，希望提供最即使，快速的用户体验。所有核心功能都应在不连接至后端的情况下使用。添加删除操作优先操作browser内部的tinybase，然后同步至后端db。搜索功能则于本地使用flexsearch实现。

### 1. 技术选型
- 编程语言: 前端使用vanilla typescript+html，后端使用java+springboot。希望给用户最轻量级快速的使用体验，减少框架的加载overhead所以使用没有框架的前端技术栈。而后端使用springboot则是因为其成熟的生态系统，方便快速实现用户认证和数据同步功能，同时保证代码的可维护性。
- 数据库: tinybase+mysql。使用tinybase作为前端数据库，保证离线可用性和快速的数据读写，同时在可以使用index快速查找。后端使用mysql用于数据持久化存储，让多端数据同步成为可能。 不使用mangoDB等NoSQL数据库是因为任务数据结构相对简单，关系型数据库足以胜任。
- 库：使用flexsearch作为前端搜索库，保证快速的本地搜索功能。替代方案为遍历整个tinybase数据库，效率较低。

### 2. 项目结构
- frontend: 项目的typescript前端代码，负责用户交互，数据的本地存储和同步。使用/API/** 与后端通信。
- backend: 项目的java后端代码，负责用户认证，多客户端同步
- db: 项目的数据库文件，包含前端和后端的数据库结构定义和初始化脚本。

#### 后端模块设计
使用ddd设计模式，将与db交互和负责认证的底层代码分离（infrastructure），将业务逻辑和api接口分离（application/service）。domain层负责定义核心业务对象和逻辑，只包含核心同步逻辑。

### 3. 需求细节与决策
- 描述是否必填？如何处理空输入？ 描述为可选字段，用户可以选择不填写。若用户未填写描述，则在显示任务时仅显示标题。
- 已完成的任务在 UI 或 CLI 中如何显示? 已完成的任务将在任务列表中用灰色显示，并在标题前添加一个勾选符号，且描述被划去。
- 分类： 用户可以为任务选择一个分类（如“工作”、“个人”）。用户可通过左侧边栏选择不同分类来过滤任务列表。
- 本地化客户端实现：允许用户不登录使用app，将停止与服务器同步，但仍然可以使用所有核心功能。用户登录后，数据将与服务器同步，实现多设备协作。
- 本地搜索功能：使用flexsearch监听tinybase的table操作，在增删改后更新对应index。搜索后只显示搜索内容，用户在清除搜索后恢复显示全部任务。
- 多客户端支持：用户会在app启动后尝试从服务器拉取最新数据，并在本地有变更时推送至服务器。服务器将返回最新数据，客户端合并后更新本地数据库。重新渲染前端。使用jwt token进行用户认证。

### 4. AI 使用说明
1. 使用gemini以及copilot。
2. 在前端辅助下完成ui渲染逻辑，在架构设计时使用ai一起brainstorm，例如在搜索功能实现上我首先考虑使用tinybase的index实现，但发现其不支持模糊搜索，于是使用ai帮忙寻找替代方案，最终选择在多种方案中选择了flexsearch因为其良好的性能和社区支持。在部署环节使用ai辅助在大量log中寻找最可能的有效信息。
  
### 5. 运行与测试方式
部署于 [个人服务器上](https://todo.javacafe.dev)，使用docker+caddy进行部署。前端使用静态文件服务，后端使用springboot内置的tomcat服务器。caddy负责反向代理和https证书管理。

### 6. 总结与反思
1. 同步功能可以使用websocket实现，可以提供更实时的同步体验。
2. 前端渲染todo中依然需要更多的功能，比如加粗显示等等。

#### API设计
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
