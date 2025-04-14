# Marketing Intelligence Platform: Documentation Index

Welcome to the project documentation! This collection of documents is designed to help Claude 3.7 understand the project structure, architecture, and implementation details.

## Available Documentation

1. **[Project Overview](./01-project-overview.md)**

   - Purpose of the project
   - Core features
   - Technical architecture
   - Development principles
   - Brand guidelines
   - Deployment information

2. **[Code Organization](./02-code-organization.md)**

   - Project structure
   - Naming conventions
   - Component structure
   - Single source of truth approach
   - UI component organization (atomic design)
   - Master toolkit
   - Icon system
   - Tree shake process

3. **[UI Component Library](./03-ui-component-library.md)**

   - Overview of the component library
   - Shadcn UI integration
   - Available components
   - Component registry system
   - UI component browser
   - Icon component details
   - Typography system
   - Component directory structure
   - Implementation guidelines

4. **[Database Models](./04-database-models.md)**

   - Overview of the database
   - Key models (CampaignWizard, Influencer, User, etc.)
   - Key enums
   - Relationships
   - Migrations
   - Seeding
   - Indexes
   - JSON fields

5. **[API and Authentication](./05-api-and-authentication.md)**

   - API structure
   - Authentication flow
   - Auth implementation
   - Middleware
   - API security
   - API examples
   - Error handling

6. **[Graphiti Integration](./06-graphiti-integration.md)**
   - Overview of Graphiti
   - Key concepts
   - Working with Graphiti
   - Best practices
   - UI/UX integration
   - Example use cases
   - Technical implementation
   - Security considerations

## Using This Documentation

This documentation is designed to be a comprehensive reference for understanding the project. When working with the codebase:

1. Start with the **Project Overview** to understand the big picture
2. Review the **Code Organization** to understand the structure and conventions
3. Dive into the **UI Component Library** when working on the frontend
4. Refer to **Database Models** when working with data
5. Check **API and Authentication** for backend functionality
6. Use **Graphiti Integration** guidance when maintaining project knowledge

## Important Guidelines

### Brand Colors

- **Primary**: Jet `#333333`
- **Secondary**: Payne's Grey `#4A5568`
- **Accent**: Deep Sky Blue `#00BFFF`
- **Background**: White `#FFFFFF`
- **Divider**: French Grey `#D1D5DB`
- **Interactive**: Medium Blue `#3182CE`

### Icons

- **Icon Library**: FontAwesome Pro
- **Default state**: Light icons (`fa-light`)
- **Hover state**: Solid icons (`fa-solid`)

### Coding Standards

- Follow atomic design principles
- Use TypeScript for type safety
- Maintain single source of truth
- Follow established naming conventions
- Keep components small and focused
- Write tests for all components
