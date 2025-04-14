# Application Routes

This section documents the application's routes and navigation structure.

## Route Structure

Our application uses a hierarchical routing system with these main sections:

- **/auth**: Authentication routes (login, register, password reset)
- **/dashboard**: Main application dashboard
- **/campaigns**: Campaign management and analytics
- **/settings**: User and system settings
- **/admin**: Administrative functions (admin users only)

## Route Documentation

Detailed documentation for each route section:

- [Auth Routes](./auth.md): Authentication and user management
- [Dashboard Routes](./dashboard.md): Main application dashboard
- [Campaign Routes](./campaigns.md): Campaign creation and management
- [Settings Routes](./settings.md): User and application settings
- [Admin Routes](./admin.md): Administrative functionality

## Route Guards

Routes are protected based on user role and authentication status:

1. **Public Routes**: Available to all users (login, register, etc.)
2. **Authenticated Routes**: Require valid user login
3. **Role-Based Routes**: Require specific user roles (admin, editor, etc.)

## Navigation Components

The main navigation components are:

- **Main Navigation**: Primary navigation in the sidebar
- **User Menu**: User-specific options in the top-right header
- **Breadcrumbs**: Context-based navigation showing current location

## Route Implementation

Routes are implemented using React Router with the following pattern:

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="campaigns" element={<CampaignList />} />
    <Route path="campaigns/:id" element={<CampaignDetail />} />
    {/* Additional routes */}
  </Route>
</Routes>
```

For code-level details about route implementation, see the router setup in `src/router/index.tsx`.
