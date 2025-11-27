# Cline Usage Guide: Effective Workflows, Rules, and MCP Server Integration

## Core Rules (MANDATORY)

### 🔑 **Context7 Integration for Code Generation**

- **ALWAYS use Upstash Context7 MCP server** for any code generation, library research, or documentation lookup
- Before writing code, use `resolve-library-id` to get accurate library IDs for frameworks/libraries you need to implement
- Use `get-library-docs` to fetch current documentation and best practices directly from sources
- Only fetch external docs via `fetch-mcp-server` for non-code and code topics (APIs, specifications, articles)

### 📋 **Structured Request Format**

Always structure your requests using this format:

```
TASK: [Brief description]
CONTEXT: [Project framework, current file, existing code]
REQUIREMENTS: [Specific needs, constraints, outputs]
STEPS: [If complex, break down expected steps]
MCP: [MCP servers/tools needed and why]
```

### 🔍 **MCP Server Auto-Selection Rules**

Cline will automatically choose the right MCP server based on task type:

- **Code generation/library research**: Context7 (`resolve-library-id`, `get-library-docs`)
- **Web content/data fetching**: fetch-mcp-server (`fetch_html`, `fetch_json`, `fetch_txt`, `fetch_markdown`)
- **Complex problem solving**: sequential-thinking (`sequentialthinking`)
- **Notion workspace management**: notion-mcp-server (API operations for databases, pages, comments)
- **Advanced file operations**: filesystem MCP server (read/write files, directory management)

## Effective Workflows

### Code Generation Workflow

1. **Library Research**: Use Context7 to resolve library IDs and check documentation
2. **Pattern Analysis**: Use `search_files` to find existing patterns in codebase
3. **Implementation**: Write code following project conventions
4. **Validation**: Test integration points and error handling

### Data Fetching Workflow

1. **Identify Source**: Determine whether Context7 can provide docs or need external fetch
2. **Fetch Data**: Use appropriate fetch tool (JSON for APIs, markdown for docs)
3. **Process Data**: Transform data according to requirements
4. **Integrate**: Apply data to codebase with proper error handling

### Complex Task Workflow

1. **Break Down**: Use sequential-thinking tool to analyze and structure complex tasks
2. **Iterative Implementation**: Complete one logical unit before proceeding
3. **Review & Adjust**: Check integration points and edge cases

## MCP Server Usage Guidelines

### **Context7 - Primary Code Resource**

**WHEN TO USE:**

- Writing new code or implementing features
- Researching library/framework usage
- Getting current documentation
- Finding implementation examples

**TOOLS:**

- `resolve-library-id`: Resolves package/product names to Context7-compatible library IDs with relevance scoring
- `get-library-docs`: Fetches up-to-date documentation, supports 'code' (API references) and 'info' (conceptual guides) modes

**HOW TO USE:**

```
Use Context7 to research [library/framework] for [specific task].
Resolve the correct library ID first, then fetch documentation.
```

### **fetch-mcp-server - External Data**

**WHEN TO USE:**

- API documentation specifications
- Configuration examples
- Data format standards
- Web content analysis
- Competitive research

**TOOLS:**

- `fetch_json`: API responses, configuration files
- `fetch_markdown`: Documentation, README files
- `fetch_html`: Web scraping, structured content
- `fetch_txt`: Plain text content, logs

### **sequential-thinking - Complex Problems**

**WHEN TO USE:**

- Multi-step refactoring tasks
- System design decisions
- Complex bug analysis
- Workflow optimization
- Architecture planning

**TOOLS:**

- `sequentialthinking`: Facilitates a detailed, step-by-step thinking process for problem-solving and analysis. Allows breaking down complex problems, revising thoughts, and generating/verifying solution hypotheses.

### **notion-mcp-server - Knowledge Management**

**WHEN TO USE:**

- Project documentation
- Requirement tracking
- Progress documentation
- Collaborative workflows
- Knowledge base creation

**TOOLS:**

- `API-get-user`: Retrieve a user
- `API-get-users`: List all users
- `API-get-self`: Retrieve your token's bot user
- `API-post-database-query`: Query a database
- `API-post-search`: Search by title
- `API-get-block-children`: Retrieve block children
- `API-patch-block-children`: Append block children
- `API-retrieve-a-block`: Retrieve a block
- `API-update-a-block`: Update a block
- `API-delete-a-block`: Delete a block
- `API-retrieve-a-page`: Retrieve a page
- `API-patch-page`: Update page properties
- `API-post-page`: Create a page
- `API-create-a-database`: Create a database
- `API-update-a-database`: Update a database
- `API-retrieve-a-database`: Retrieve a database
- `API-retrieve-a-page-property`: Retrieve a page property item
- `API-retrieve-a-comment`: Retrieve comments
- `API-create-a-comment`: Create comment

### **filesystem MCP - Advanced File Ops**

**WHEN TO USE:**

- Operations outside current working directory
- Batch file processing
- Cross-project operations
- System-wide configuration changes

**TOOLS:**

- `read_text_file`: Read complete contents of a file as text
- `read_media_file`: Read an image or audio file, returns base64 data and MIME type
- `read_multiple_files`: Read multiple files simultaneously
- `write_file`: Create new file or overwrite existing (exercise caution)
- `edit_file`: Make selective edits with advanced pattern matching
- `create_directory`: Create new directory or ensure it exists
- `list_directory`: List directory contents with file/directory prefixes
- `list_directory_with_sizes`: List directory contents with sizes
- `move_file`: Move or rename files and directories
- `search_files`: Recursively search for files/directories matching patterns
- `directory_tree`: Get recursive JSON tree structure of directory contents
- `get_file_info`: Get detailed file/directory metadata
- `list_allowed_directories`: List all directories the server is allowed to access

## Practical Request Formats

### Code Implementation

```
Create a user authentication API in Next.js with the following:
- Use Context7 to research best practices for NextAuth.js integration
- Implement login/register endpoints with validation
- Include rate limiting and security headers
- Use existing project patterns from app/api/
```

### Documentation Research

```
Using Context7, research Redux Toolkit documentation for:
- Setting up RTK Query in a Next.js application
- Best practices for API integration
- Caching strategies and error handling patterns
```

### System Analysis

```
Analyze the current user management system by:
- Using sequential-thinking to break down the architecture
- Searching for user-related code patterns across the codebase
- Identifying potential improvements in security and performance
```

### Data Processing

```
Fetch and process external data:
- Use fetch_json to get data from [API endpoint]
- Transform the data to match our Property schema
- Implement proper error handling and data validation
- Update the database with new information
```

## Workspace-Specific Rules

### Current Project (dalalfree)

- **Framework**: Next.js with App Router
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Working Directory**: `d:\code\Clients\Esam\DalalFree\code\dalalfree`

### File Path Standards

- **API Routes**: `app/api/[...subpath]/route.js`
- **Components**: `app/components/` or feature-specific directories
- **Pages**: `app/(dashboard|auth|property)/[subpath]/page.jsx`
- **Models**: `app/lib/models/[ModelName].js`

## Error Prevention Rules

### Code Quality

- Always check existing patterns before implementing new features
- Use proper TypeScript types when available
- Follow project naming conventions (camelCase, PascalCase)
- Include error boundaries and fallback UI

### Security

- Validate all user inputs
- Use parameterized queries to prevent injection
- Implement proper authentication checks
- Log security-related events

### Performance

- Implement caching where appropriate
- Optimize database queries
- Use proper indexing strategies
- Lazy load heavy components

## Integration Examples

### New Feature Implementation

```
Implement file upload functionality:
1. Use Context7 to research Next.js file upload best practices
2. Create API route for handling multipart/form-data
3. Implement client-side upload component with progress tracking
4. Add file validation and security checks
5. Update database schema if needed
```

### Bug Fixing

```
Fix user login issue:
1. Use sequential-thinking to analyze the authentication flow
2. Check current NextAuth configuration
3. Search for similar issues in codebase
4. Implement fix with proper error handling
5. Test all authentication scenarios
```

### API Integration

```
Integrate payment gateway:
1. Use fetch_json to test payment API endpoints
2. Implement webhook handlers for payment events
3. Create database models for transaction tracking
4. Build payment UI components
5. Add error handling and retry logic
```

## Conclusion

This guide emphasizes:

- **Context7-first approach** for all code-related tasks
- **Structured communication** with clear task breakdowns
- **MCP server expertise** selection based on task requirements
- **Iterative development** with proper validation and testing
- **Project-specific awareness** of frameworks and conventions

For optimal results, provide clear context and follow the structured request format. Cline will automatically leverage the most appropriate MCP servers to ensure accurate, well-researched implementations.
