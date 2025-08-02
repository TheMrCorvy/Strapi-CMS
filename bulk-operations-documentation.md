# Bulk Operations Documentation

This document describes the custom bulk operation endpoints added to the Strapi CMS for the `directory` and `anime-episode` content types.

## Directory Bulk Operations

### POST /api/directories/bulk
Creates multiple directories at once.

**Request Body:**
```json
{
  "data": [
    {
      "display_name": "Season 1",
      "directory_path": "/anime/series/season1",
      "adult": false
    },
    {
      "display_name": "Season 2", 
      "directory_path": "/anime/series/season2",
      "adult": false
    }
  ]
}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "display_name": "Season 1",
      "directory_path": "/anime/series/season1",
      "adult": false,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "display_name": "Season 2",
      "directory_path": "/anime/series/season2", 
      "adult": false,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "count": 2
  }
}
```

### PATCH /api/directories/bulk
Updates multiple directories with their relationships.

**Request Body:**
```json
{
  "data": [
    {
      "id": 2,
      "parent_directory": 1,
      "sub_directories": [3, 4]
    },
    {
      "id": 3,
      "parent_directory": 2,
      "display_name": "Updated Name"
    }
  ]
}
```

**Response:**
```json
{
  "data": [
    {
      "id": 2,
      "display_name": "Season 2",
      "directory_path": "/anime/series/season2",
      "adult": false,
      "parent_directory": {
        "id": 1,
        "display_name": "Season 1"
      },
      "sub_directories": [
        {
          "id": 3,
          "display_name": "Episode 1"
        },
        {
          "id": 4,
          "display_name": "Episode 2"
        }
      ],
      "anime_episodes": []
    }
  ],
  "meta": {
    "count": 1
  }
}
```

## Anime Episode Bulk Operations

### POST /api/anime-episodes/bulk
Creates multiple anime episodes at once.

**Request Body:**
```json
{
  "data": [
    {
      "display_name": "Episode 1",
      "file_path": "/videos/episode1.mp4",
      "parent_directory": 1
    },
    {
      "display_name": "Episode 2",
      "file_path": "/videos/episode2.mp4",
      "parent_directory": 1
    }
  ]
}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "display_name": "Episode 1",
      "file_path": "/videos/episode1.mp4",
      "parent_directory": 1,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "display_name": "Episode 2", 
      "file_path": "/videos/episode2.mp4",
      "parent_directory": 1,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "count": 2
  }
}
```

### PATCH /api/anime-episodes/bulk
Updates multiple anime episodes with their relationships.

**Request Body:**
```json
{
  "data": [
    {
      "id": 1,
      "parent_directory": 2,
      "display_name": "Updated Episode 1"
    },
    {
      "id": 2,
      "parent_directory": 2
    }
  ]
}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "display_name": "Updated Episode 1",
      "file_path": "/videos/episode1.mp4",
      "parent_directory": {
        "id": 2,
        "display_name": "Season 2"
      },
      "updatedAt": "2025-01-15T10:05:00.000Z"
    },
    {
      "id": 2,
      "display_name": "Episode 2",
      "file_path": "/videos/episode2.mp4", 
      "parent_directory": {
        "id": 2,
        "display_name": "Season 2"
      },
      "updatedAt": "2025-01-15T10:05:00.000Z"
    }
  ],
  "meta": {
    "count": 2
  }
}
```

## Usage Workflow

### Typical Workflow for Directories:
1. **Bulk Create**: Create 100+ directories using `POST /api/directories/bulk`
2. **Bulk Update**: Set up parent/child relationships using `PATCH /api/directories/bulk`

### Typical Workflow for Anime Episodes:
1. **Bulk Create**: Create many anime episodes using `POST /api/anime-episodes/bulk`
2. **Bulk Update**: Assign episodes to their respective parent directories using `PATCH /api/anime-episodes/bulk`

## Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid data format, missing required fields, or validation errors
- **404 Not Found**: Referenced entities don't exist (for updates)
- **409 Conflict**: Unique constraint violations (duplicate paths/files)
- **500 Internal Server Error**: Unexpected server errors

### Improved Bulk Update Error Handling

The bulk update endpoints now include enhanced error handling:

- **Individual Item Processing**: Each item in the bulk update is processed independently
- **Partial Success**: Updates that succeed are returned even if some items fail
- **Detailed Error Reporting**: Failed items are reported with specific error messages
- **Error Summary**: Response includes error count and details in the meta section

#### Response Format with Errors

When some items fail during bulk update, the response includes both successful updates and error details:

```json
{
  "data": [
    {
      "id": 1,
      "display_name": "Successfully Updated Directory",
      "updatedAt": "2025-01-15T10:05:00.000Z"
    }
  ],
  "meta": {
    "count": 1,
    "total": 3,
    "errors": 2
  },
  "errors": [
    {
      "id": 2,
      "error": "Directory with id 2 not found"
    },
    {
      "id": 3,
      "error": "Parent directory with id 999 not found"
    }
  ]
}
```

## Performance Considerations

- These endpoints process items sequentially to ensure data integrity
- For very large batches (1000+ items), consider splitting into smaller chunks
- The parent directory verification in updates ensures referential integrity
- All operations include proper error handling and rollback capabilities

## Authentication

These endpoints respect Strapi's authentication and authorization system. Make sure to include proper authentication headers when making requests.
