---
name: notion
description: Query and sync data with Notion workspaces via the Notion API. Use for reading databases, querying pages, creating pages, and updating properties.
---

# Notion Integration Skill

This skill enables interaction with Notion workspaces via the Notion API.

## Setup Required

The user needs to provide:
1. **NOTION_API_KEY** - Internal integration token from https://www.notion.so/my-integrations
2. **NOTION_DATABASE_ID** - Database ID to query (for lesson plans, student progress, etc.)

## Available Actions

### 1. Query a Database
Fetch all pages from a Notion database with optional filters:
- Filter by property (e.g., Level, Student, Status)
- Sort by property
- Limit results

### 2. Read a Page
Get page content including:
- Page properties
- Page children (blocks)
- Comments

### 3. Create a Page
Create new pages in a database with:
- Database ID as parent
- Properties from database schema
- Content blocks

### 4. Update Page Properties
Update existing page properties in a database.

### 5. Search
Full-text search across all pages and databases.

## Common Use Cases

- **Student Progress**: Query database for student's lesson history
- **Lesson Plans**: Fetch lesson content by level/topic
- **Vocabulary**: Read vocabulary lists from Notion pages
- **Sync Progress**: Write student progress back to Notion

## Notion API Reference

Base URL: `https://api.notion.com/v1`
Version: `2022-06-28`

### Headers Required
```
Authorization: Bearer <NOTION_API_KEY>
Notion-Version: 2022-06-28
Content-Type: application/json
```

### Example Request - Query Database
```javascript
POST /v1/databases/{database_id}/query
{
  "filter": {
    "property": "Level",
    "select": { "equals": "Tiger" }
  },
  "sorts": [{ "property": "Order", "direction": "ascending" }]
}
```

### Example Request - Create Page
```javascript
POST /v1/pages
{
  "parent": { "database_id": "<database_id>" },
  "properties": {
    "Name": { "title": [{ "text": { "content": "Student Name" } }] },
    "Level": { "select": { "name": "Tiger" } }
  }
}
```

## Workflow

1. Ask user for NOTION_API_KEY and NOTION_DATABASE_ID
2. Test connection with a simple search or query
3. Perform requested operations
4. Report results to user