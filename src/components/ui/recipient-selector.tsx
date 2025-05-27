/**
 * @component RecipientSelector
 * @category molecule
 * @subcategory input
 * @description Advanced recipient selector supporting both users and organisations with search
 * @status active
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon/icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  identifier?: string; // Used by organisation users
}

interface Organisation {
  id: string;
  name: string;
  slug?: string;
  userCount: number;
  users?: User[];
}

interface SelectedRecipient {
  id: string;
  type: 'user' | 'organisation';
  name: string;
  email?: string;
  userCount?: number;
}

interface RecipientSelectorProps {
  selectedRecipients: SelectedRecipient[];
  onSelectionChange: (recipients: SelectedRecipient[]) => void;
  className?: string;
}

export function RecipientSelector({
  selectedRecipients,
  onSelectionChange,
  className,
}: RecipientSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  // Fetch users and organisations
  const fetchData = useCallback(async () => {
    setIsLoadingUsers(true);
    setIsLoadingOrgs(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setOrganisations(data.organizations || []);
      } else {
        toast.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoadingUsers(false);
      setIsLoadingOrgs(false);
    }
  }, []);

  // Fetch organisation users
  const fetchOrgUsers = useCallback(async (orgId: string) => {
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}/users`);
      if (response.ok) {
        const users = await response.json();
        setOrganisations((prev: Organisation[]) =>
          prev.map((org: Organisation) => (org.id === orgId ? { ...org, users: users || [] } : org))
        );
      }
    } catch (error) {
      console.error('Error fetching organisation users:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle organisation expansion
  const toggleOrgExpansion = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
      // Fetch users for this org if not already loaded
      const org = organisations.find((o: Organisation) => o.id === orgId);
      if (org && !org.users) {
        fetchOrgUsers(orgId);
      }
    }
    setExpandedOrgs(newExpanded);
  };

  // Selection handlers
  const handleUserSelect = (user: User) => {
    const userRecipient: SelectedRecipient = {
      id: user.id,
      type: 'user',
      name: user.name || user.email,
      email: user.email,
    };

    const isSelected = selectedRecipients.some(r => r.id === user.id && r.type === 'user');
    if (isSelected) {
      onSelectionChange(selectedRecipients.filter(r => !(r.id === user.id && r.type === 'user')));
    } else {
      onSelectionChange([...selectedRecipients, userRecipient]);
    }
  };

  const handleOrgSelect = (org: Organisation) => {
    const orgRecipient: SelectedRecipient = {
      id: org.id,
      type: 'organisation',
      name: org.name,
      userCount: org.userCount,
    };

    const isSelected = selectedRecipients.some(r => r.id === org.id && r.type === 'organisation');
    if (isSelected) {
      onSelectionChange(
        selectedRecipients.filter(r => !(r.id === org.id && r.type === 'organisation'))
      );
    } else {
      onSelectionChange([...selectedRecipients, orgRecipient]);
    }
  };

  // Filter functions
  const filteredUsers = users.filter(
    user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOrganisations = organisations.filter(
    (org: Organisation) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.slug && org.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper functions
  const isUserSelected = (userId: string) =>
    selectedRecipients.some(r => r.id === userId && r.type === 'user');

  const isOrgSelected = (orgId: string) =>
    selectedRecipients.some(r => r.id === orgId && r.type === 'organisation');

  const totalRecipientsCount = selectedRecipients.reduce((count, recipient) => {
    if (recipient.type === 'user') return count + 1;
    if (recipient.type === 'organisation') return count + (recipient.userCount || 0);
    return count;
  }, 0);

  return (
    <Card className={cn('font-sans', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-semibold">
          <span>Select Recipients</span>
          <Badge variant="secondary" className="font-medium">
            {selectedRecipients.length} selected ({totalRecipientsCount} total recipients)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 font-sans">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="font-medium">
            Search Users & Organisations
          </Label>
          <div className="relative">
            <Icon
              iconId="faSearchLight"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              id="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or organisation..."
              className="pl-10 font-sans"
            />
          </div>
        </div>

        {/* Selected Recipients Summary */}
        {selectedRecipients.length > 0 && (
          <div className="space-y-2">
            <Label className="font-medium">Selected Recipients</Label>
            <div className="flex flex-wrap gap-2">
              {selectedRecipients.map(recipient => (
                <Badge
                  key={`${recipient.type}-${recipient.id}`}
                  variant="default"
                  className="flex items-center gap-2 font-medium"
                >
                  <Icon
                    iconId={recipient.type === 'user' ? 'faUserLight' : 'faBuildingLight'}
                    className="h-3 w-3"
                  />
                  {recipient.name}
                  {recipient.type === 'organisation' && recipient.userCount && (
                    <span className="text-xs font-normal">({recipient.userCount})</span>
                  )}
                  <button
                    onClick={() => {
                      onSelectionChange(
                        selectedRecipients.filter(
                          r => !(r.id === recipient.id && r.type === recipient.type)
                        )
                      );
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <Icon iconId="faXmarkLight" className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tabs for Users and Organisations */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="font-medium">
              <Icon iconId="faUserLight" className="mr-2 h-4 w-4" />
              Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="organisations" className="font-medium">
              <Icon iconId="faBuildingLight" className="mr-2 h-4 w-4" />
              Organisations ({filteredOrganisations.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-2">
            <ScrollArea className="h-64">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 font-normal">
                  No users found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={cn(
                        'flex items-center space-x-3 p-3 rounded-md cursor-pointer border transition-colors',
                        isUserSelected(user.id)
                          ? 'bg-accent/10 border-accent'
                          : 'hover:bg-muted border-transparent'
                      )}
                      onClick={() => handleUserSelect(user)}
                    >
                      <Checkbox
                        checked={isUserSelected(user.id)}
                        onChange={() => handleUserSelect(user)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                        {user.name && (
                          <p className="text-xs text-muted-foreground truncate font-normal">
                            {user.name}
                          </p>
                        )}
                        {user.role && (
                          <Badge variant="outline" className="text-xs mt-1 font-normal">
                            {user.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Organisations Tab */}
          <TabsContent value="organisations" className="space-y-2">
            <ScrollArea className="h-64">
              {isLoadingOrgs ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : filteredOrganisations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 font-normal">
                  No organisations found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOrganisations.map((org: Organisation) => (
                    <div key={org.id} className="space-y-2">
                      {/* Organisation Header */}
                      <div
                        className={cn(
                          'flex items-center space-x-3 p-3 rounded-md cursor-pointer border transition-colors',
                          isOrgSelected(org.id)
                            ? 'bg-accent/10 border-accent'
                            : 'hover:bg-muted border-transparent'
                        )}
                        onClick={() => handleOrgSelect(org)}
                      >
                        <Checkbox
                          checked={isOrgSelected(org.id)}
                          onChange={() => handleOrgSelect(org)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{org.name}</p>
                            <Badge variant="secondary" className="text-xs font-normal">
                              {org.userCount} members
                            </Badge>
                          </div>
                          {org.slug && (
                            <p className="text-xs text-muted-foreground truncate font-normal">
                              /{org.slug}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            toggleOrgExpansion(org.id);
                          }}
                          className="p-1 h-6 w-6"
                        >
                          <Icon
                            iconId={
                              expandedOrgs.has(org.id) ? 'faChevronUpLight' : 'faChevronDownLight'
                            }
                            className="h-3 w-3"
                          />
                        </Button>
                      </div>

                      {/* Organisation Users (when expanded) */}
                      {expandedOrgs.has(org.id) && (
                        <div className="ml-6 space-y-1">
                          {org.users ? (
                            org.users.map((user: User) => (
                              <div
                                key={`${org.id}-${user.id}`}
                                className="flex items-center space-x-2 p-2 text-sm text-muted-foreground bg-muted/50 rounded font-normal"
                              >
                                <Icon iconId="faUserLight" className="h-3 w-3" />
                                <span className="truncate">{user.identifier || user.email}</span>
                                {user.role && (
                                  <Badge variant="outline" className="text-xs font-normal">
                                    {user.role}
                                  </Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-center p-4">
                              <LoadingSpinner />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectionChange([])}
            disabled={selectedRecipients.length === 0}
            className="font-medium"
          >
            Clear All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allUsers: SelectedRecipient[] = users.map((user: User) => ({
                id: user.id,
                type: 'user',
                name: user.name || user.email,
                email: user.email,
              }));
              onSelectionChange(allUsers);
            }}
            disabled={isLoadingUsers}
            className="font-medium"
          >
            Select All Users
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allOrgs: SelectedRecipient[] = organisations.map((org: Organisation) => ({
                id: org.id,
                type: 'organisation',
                name: org.name,
                userCount: org.userCount,
              }));
              onSelectionChange(allOrgs);
            }}
            disabled={isLoadingOrgs}
            className="font-medium"
          >
            Select All Orgs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
