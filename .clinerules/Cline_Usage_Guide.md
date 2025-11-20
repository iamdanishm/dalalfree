# Cline Usage Guide: Rules, Instructions, and MCP Server Integration

## Overview

Cline is a highly skilled software engineer AI assistant designed to help with programming tasks, code analysis, file operations, and system commands. This guide outlines the rules and best practices for interacting with Cline effectively, including proper instruction formatting and strategic use of MCP (Model Context Protocol) servers.

## General Interaction Rules

### 1. **Be Specific and Clear**

- Provide detailed, unambiguous instructions
- Include context about your project structure, technologies used, and desired outcomes
- Avoid vague requests like "fix this" without specifying what needs fixing

### 2. **Structure Your Requests**

- Break complex tasks into smaller, manageable steps
- Specify file paths, function names, or code sections you're referring to
- Use numbered or bulleted lists for multi-step instructions

### 3. **Provide Context**

- Mention the programming language, framework, or technology stack
- Include relevant code snippets, error messages, or expected behavior
- Reference specific files or directories when possible

### 4. **Use Appropriate File References**

- Provide full paths relative to the current working directory (`d:\code\Clients\Esam\DalalFree\code\dalalfree`)
- Use consistent naming conventions
- Include file extensions when relevant

## Instruction Formatting Best Practices

### Code-Related Tasks

```
- Language: [Specify language]
- Framework: [If applicable]
- Task: [Clear description]
- Files to modify: [List specific files]
- Expected behavior: [Describe desired outcome]
```

### File Operations

```
- Action: [create, modify, delete, move]
- Target: [Specific file or directory path]
- Content: [For creation/modification tasks]
- Reasoning: [Why this change is needed]
```

### System Commands

```
- Command purpose: [Clear explanation of what the command does]
- Directory: [If not the current working directory]
- Expected output: [What you expect to see]
- Safety notes: [Any potential risks or required approvals]
```

## MCP Server Integration Guidelines

### When to Use MCP Servers

Consider using MCP servers for specialized tasks that go beyond basic file operations and command execution:

1. **Data Fetching and External APIs**

   - Use `fetch-mcp-server` for web scraping and content extraction
   - Useful for gathering information from websites, APIs, or online documentation

2. **Sequential Thinking and Problem Solving**

   - Use `sequential-thinking` MCP server for complex, multi-step reasoning
   - Ideal for breaking down intricate problems into manageable steps

3. **Notion Integration**

   - Use `notion-mcp-server` for database operations, page management, and content creation
   - Helpful for documentation, project tracking, or knowledge management tasks

4. **File System Operations (Advanced)**
   - Use `filesystem` MCP server for complex file operations beyond basic read/write
   - Useful when current directory limitations restrict access

### How to Request MCP Server Usage

When a task requires MCP server capabilities, specify:

```
- MCP Server Needed: [Server name]
- Tool Required: [Specific tool from the server]
- Purpose: [Why this MCP server is necessary]
- Expected Outcome: [What data or action you want from the MCP server]
```

### Available MCP Servers and Use Cases

1. **fetch-mcp-server**

   - **Tools**: fetch_html, fetch_markdown, fetch_txt, fetch_json
   - **Best for**: Research, documentation gathering, API testing, content extraction
   - **Example**: "Fetch the latest API documentation from a specific URL"

2. **sequential-thinking MCP server**

   - **Tool**: sequentialthinking
   - **Best for**: Complex problem-solving, step-by-step analysis, planning multi-phase tasks
   - **Example**: "Break down this refactoring task into smaller steps"

3. **notion-mcp-server**

   - **Tools**: Multiple database, page, and comment operations
   - **Best for**: Knowledge management, project documentation, collaborative workflows
   - **Example**: "Create a Notion page for project requirements"

4. **filesystem MCP server**
   - **Tool**: Advanced file operations
   - **Best for**: Operations requiring access to directories outside the current workspace
   - **Example**: "Read files from a different project directory"

## Task Execution Best Practices

### 1. **Start with Exploration**

- Begin by examining project structure and relevant files
- Use `list_files` and `read_file` tools to understand the codebase
- Identify dependencies and existing patterns

### 2. **Plan Before Acting**

- Break down tasks into logical steps
- Use `search_files` to find related code patterns
- Consider potential impacts on other parts of the system

### 3. **Iterative Development**

- Make changes incrementally
- Test each modification before proceeding
- Use version control appropriately (though Cline handles file operations)

### 4. **Safety First**

- Be cautious with destructive operations
- Request user approval for potentially risky commands
- Always provide explanations for actions taken

## Error Handling and Troubleshooting

### When Things Go Wrong

1. **Check Command Compatibility**: Ensure commands are appropriate for Windows environment
2. **Verify Paths**: Confirm file paths are correct and accessible
3. **Review Output**: Examine command results and error messages carefully
4. **Ask for Clarification**: Request additional information if something is unclear

### Common Issues and Solutions

- **Command not found**: Verify tool availability or provide installation instructions
- **Permission errors**: Use appropriate administrative privileges or suggest alternatives
- **Path issues**: Use absolute paths or verify directory structure
- **MCP server errors**: Check server configuration and tool parameters

## Communication Tips

### Be Direct and Technical

- Avoid casual language; be precise and professional
- Use technical terminology appropriate to your domain
- Provide concrete examples and code snippets

### Anticipate Follow-up

- Consider what additional information might be needed
- Prepare related files or examples in advance
- Think about potential edge cases or complications

### Respect Tool Limitations

- Remember Cline operates from a fixed working directory
- Use absolute paths for operations outside the current directory
- Be aware of platform-specific considerations (Windows environment)

## Example Interactions

### Good Request

```
Create a new React component for user authentication with the following specifications:
- File location: app/components/AuthForm.jsx
- Features: Email/password login, remember me option
- Style: Use Tailwind CSS classes
- Integration: Connect to existing API endpoint /api/auth/login
```

### Requesting MCP Server Usage

```
I need to fetch the latest weather data for multiple cities. Please use the fetch-mcp-server to get JSON data from the OpenWeather API for New York, London, and Tokyo. Then, format this data into a readable markdown table.
```

### Complex Task Breakdown

```
Refactor the user dashboard component by:
1. Separating business logic from UI components
2. Implementing proper error handling for API calls
3. Adding loading states for better UX
4. Creating reusable hooks for data fetching

Files to modify:
- app/(dashboard)/user/page.jsx
- app/components/UserDashboard.jsx (new file)
```

## Conclusion

Following these guidelines will help you work more effectively with Cline, leading to better outcomes and fewer misunderstandings. Remember that Cline's capabilities are extensive, but clear communication is key to leveraging them fully. When in doubt, provide more context rather than less, and don't hesitate to ask clarifying questions if needed.

For technical support or advanced usage patterns, consult the available MCP server documentation or request specific examples for your use case.
